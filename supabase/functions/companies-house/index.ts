import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CH_BASE = "https://api.company-information.service.gov.uk";

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateQuery(query: unknown): string {
  if (typeof query !== "string" || query.length === 0 || query.length > 200) {
    throw new ValidationError("Query must be 1-200 characters");
  }
  return query;
}

function validateCompanyNumber(num: unknown): string {
  if (typeof num !== "string" || !/^[A-Z0-9]{1,8}$/i.test(num)) {
    throw new ValidationError("companyNumber must be 1-8 alphanumeric characters");
  }
  return num;
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

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("COMPANIES_HOUSE_API_KEY");
    if (!apiKey) throw new Error("COMPANIES_HOUSE_API_KEY is not configured");

    const authToken = btoa(`${apiKey}:`);

    const body = await req.json();
    const action = body.action;

    if (typeof action !== "string") {
      throw new ValidationError("action is required");
    }

    const chFetch = async (path: string) => {
      const res = await fetch(`${CH_BASE}${path}`, {
        headers: { Authorization: `Basic ${authToken}` },
      });
      if (res.status === 404) return { status: "not_found" };
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Companies House API [${res.status}]: ${text}`);
      }
      return await res.json();
    };

    let result: unknown;

    switch (action) {
      case "search": {
        const q = encodeURIComponent(validateQuery(body.query));
        result = await chFetch(`/search/companies?q=${q}&items_per_page=10`);
        break;
      }
      case "profile": {
        const companyNumber = validateCompanyNumber(body.companyNumber);
        result = await chFetch(`/company/${companyNumber}`);
        break;
      }
      case "officers": {
        const companyNumber = validateCompanyNumber(body.companyNumber);
        result = await chFetch(`/company/${companyNumber}/officers?items_per_page=100`);
        break;
      }
      case "pscs": {
        const companyNumber = validateCompanyNumber(body.companyNumber);
        result = await chFetch(`/company/${companyNumber}/persons-with-significant-control`);
        break;
      }
      case "filing-history": {
        const companyNumber = validateCompanyNumber(body.companyNumber);
        result = await chFetch(`/company/${companyNumber}/filing-history?items_per_page=20`);
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
    console.error("companies-house error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
