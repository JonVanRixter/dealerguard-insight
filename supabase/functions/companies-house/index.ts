import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CH_BASE = "https://api.company-information.service.gov.uk";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("COMPANIES_HOUSE_API_KEY");
    if (!apiKey) throw new Error("COMPANIES_HOUSE_API_KEY is not configured");

    const authToken = btoa(`${apiKey}:`);

    const { action, ...params } = await req.json();

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
        const q = encodeURIComponent(params.query || "");
        result = await chFetch(`/search/companies?q=${q}&items_per_page=10`);
        break;
      }
      case "profile": {
        if (!params.companyNumber) throw new Error("companyNumber is required");
        result = await chFetch(`/company/${params.companyNumber}`);
        break;
      }
      case "officers": {
        if (!params.companyNumber) throw new Error("companyNumber is required");
        result = await chFetch(`/company/${params.companyNumber}/officers?items_per_page=100`);
        break;
      }
      case "pscs": {
        if (!params.companyNumber) throw new Error("companyNumber is required");
        result = await chFetch(`/company/${params.companyNumber}/persons-with-significant-control`);
        break;
      }
      case "filing-history": {
        if (!params.companyNumber) throw new Error("companyNumber is required");
        result = await chFetch(`/company/${params.companyNumber}/filing-history?items_per_page=20`);
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("companies-house error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
