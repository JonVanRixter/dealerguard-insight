import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SANDBOX_BASE = "https://connect.sandbox.creditsafe.com/v1";

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/** Cache token in-memory for the function instance lifetime */
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function authenticate(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const username = Deno.env.get("CREDITSAFE_USERNAME");
  const password = Deno.env.get("CREDITSAFE_PASSWORD");
  if (!username || !password) {
    throw new Error("CreditSafe credentials not configured");
  }

  const res = await fetch(`${SANDBOX_BASE}/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CreditSafe auth failed [${res.status}]: ${text}`);
  }

  const data = await res.json();
  cachedToken = data.token;
  tokenExpiry = Date.now() + 55 * 60 * 1000;
  return cachedToken!;
}

async function searchCompanies(
  token: string,
  query: { name?: string; regNo?: string; country?: string }
) {
  const params = new URLSearchParams();
  if (query.country) params.set("countries", query.country);
  if (query.name) params.set("name", query.name);
  if (query.regNo) params.set("regNo", query.regNo);
  params.set("pageSize", "10");
  params.set("page", "1");

  const res = await fetch(`${SANDBOX_BASE}/companies?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CreditSafe company search failed [${res.status}]: ${text}`);
  }

  return await res.json();
}

async function getCompanyReport(token: string, connectId: string) {
  const res = await fetch(`${SANDBOX_BASE}/companies/${connectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CreditSafe report fetch failed [${res.status}]: ${text}`);
  }

  return await res.json();
}

// Input validation
function validateSearchParams(params: Record<string, unknown>) {
  const validated: { name?: string; regNo?: string; country?: string } = {};
  if (params.name !== undefined) {
    if (typeof params.name !== "string" || params.name.length > 200) throw new ValidationError("name must be a string under 200 chars");
    validated.name = params.name;
  }
  if (params.regNo !== undefined) {
    if (typeof params.regNo !== "string" || params.regNo.length > 50) throw new ValidationError("regNo must be a string under 50 chars");
    validated.regNo = params.regNo;
  }
  if (params.country !== undefined) {
    if (typeof params.country !== "string" || !/^[A-Z]{2}$/i.test(params.country)) throw new ValidationError("country must be a 2-letter code");
    validated.country = params.country;
  }
  if (!validated.name && !validated.regNo) throw new ValidationError("name or regNo is required");
  return validated;
}

function validateConnectId(id: unknown): string {
  if (typeof id !== "string" || id.length === 0 || id.length > 100) {
    throw new ValidationError("connectId must be 1-100 characters");
  }
  return id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Authenticate the calling user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const action = body.action;

    if (typeof action !== "string") {
      throw new ValidationError("action is required");
    }

    const csToken = await authenticate();

    let result: unknown;

    switch (action) {
      case "search": {
        const searchParams = validateSearchParams(body);
        result = await searchCompanies(csToken, {
          ...searchParams,
          country: searchParams.country || "GB",
        });
        break;
      }
      case "report": {
        const connectId = validateConnectId(body.connectId);
        result = await getCompanyReport(csToken, connectId);
        break;
      }
      default:
        throw new ValidationError(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof ValidationError) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("creditsafe error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
