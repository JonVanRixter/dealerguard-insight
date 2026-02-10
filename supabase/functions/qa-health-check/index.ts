import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CheckResult {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  duration_ms: number;
}

async function checkDatabase(supabase: ReturnType<typeof createClient>): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.from("profiles").select("id").limit(1);
    if (error) throw error;
    return { name: "Database Connectivity", status: "pass", message: "Database responding normally", duration_ms: Date.now() - start };
  } catch (e: any) {
    return { name: "Database Connectivity", status: "fail", message: `Database error: ${e.message}`, duration_ms: Date.now() - start };
  }
}

async function checkAuth(supabaseUrl: string, anonKey: string): Promise<CheckResult> {
  const start = Date.now();
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: anonKey },
    });
    if (!res.ok) throw new Error(`Auth responded with ${res.status}`);
    await res.text();
    return { name: "Authentication Service", status: "pass", message: "Auth service responding normally", duration_ms: Date.now() - start };
  } catch (e: any) {
    return { name: "Authentication Service", status: "fail", message: `Auth error: ${e.message}`, duration_ms: Date.now() - start };
  }
}

async function checkStorage(supabase: ReturnType<typeof createClient>): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    const hasDealerBucket = data?.some((b) => b.id === "dealer-documents");
    if (!hasDealerBucket) {
      return { name: "File Storage", status: "warn", message: "Storage accessible but dealer-documents bucket not found", duration_ms: Date.now() - start };
    }
    return { name: "File Storage", status: "pass", message: `Storage operational (${data.length} bucket${data.length !== 1 ? "s" : ""})`, duration_ms: Date.now() - start };
  } catch (e: any) {
    return { name: "File Storage", status: "fail", message: `Storage error: ${e.message}`, duration_ms: Date.now() - start };
  }
}

async function checkEdgeFunctions(supabaseUrl: string, anonKey: string): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Check that the generate-audit-summary function responds (OPTIONS preflight)
    const res = await fetch(`${supabaseUrl}/functions/v1/generate-audit-summary`, {
      method: "OPTIONS",
      headers: { apikey: anonKey },
    });
    // OPTIONS should return 200 with CORS headers
    if (res.status <= 204) {
      await res.text();
      return { name: "Edge Functions", status: "pass", message: "Edge functions reachable", duration_ms: Date.now() - start };
    }
    await res.text();
    return { name: "Edge Functions", status: "warn", message: `Edge function responded with status ${res.status}`, duration_ms: Date.now() - start };
  } catch (e: any) {
    return { name: "Edge Functions", status: "fail", message: `Edge function error: ${e.message}`, duration_ms: Date.now() - start };
  }
}

async function checkDataIntegrity(supabase: ReturnType<typeof createClient>): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Check for expired documents
    const { data: expired, error } = await supabase
      .from("dealer_documents")
      .select("id", { count: "exact", head: true })
      .lt("expiry_date", new Date().toISOString().split("T")[0]);
    
    if (error) throw error;

    const count = expired?.length ?? 0;
    if (count > 10) {
      return { name: "Data Integrity", status: "warn", message: `${count} expired documents need attention`, duration_ms: Date.now() - start };
    }
    return { name: "Data Integrity", status: "pass", message: "No critical data issues detected", duration_ms: Date.now() - start };
  } catch (e: any) {
    return { name: "Data Integrity", status: "warn", message: `Could not check data integrity: ${e.message}`, duration_ms: Date.now() - start };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const start = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Run all checks in parallel
    const checks = await Promise.all([
      checkDatabase(supabase),
      checkAuth(supabaseUrl, anonKey),
      checkStorage(supabase),
      checkEdgeFunctions(supabaseUrl, anonKey),
      checkDataIntegrity(supabase),
    ]);

    const totalDuration = Date.now() - start;

    // Determine overall status
    const hasFail = checks.some((c) => c.status === "fail");
    const hasWarn = checks.some((c) => c.status === "warn");
    const overallStatus = hasFail ? "fail" : hasWarn ? "warn" : "pass";

    const passCount = checks.filter((c) => c.status === "pass").length;
    const summary = `${passCount}/${checks.length} checks passed${hasFail ? " — FAILURES DETECTED" : hasWarn ? " — warnings present" : " — all systems operational"}`;

    // Store the result
    await supabase.from("qa_health_checks").insert({
      overall_status: overallStatus,
      checks: checks,
      summary,
      duration_ms: totalDuration,
    });

    // Trim old records (keep last 90 days)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    await supabase
      .from("qa_health_checks")
      .delete()
      .lt("run_at", cutoff.toISOString());

    return new Response(
      JSON.stringify({ overall_status: overallStatus, checks, summary, duration_ms: totalDuration }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("QA health check error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
