import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SANDBOX_BASE = "https://connect.sandbox.creditsafe.com/v1";

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
  // Tokens typically last 1 hour; refresh 5 min early
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    const token = await authenticate();

    let result: unknown;

    switch (action) {
      case "search": {
        result = await searchCompanies(token, {
          name: params.name,
          regNo: params.regNo,
          country: params.country || "GB",
        });
        break;
      }
      case "report": {
        if (!params.connectId) throw new Error("connectId is required");
        result = await getCompanyReport(token, params.connectId);
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("creditsafe error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
