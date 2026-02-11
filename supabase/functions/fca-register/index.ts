import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FCA_BASE = "https://register.fca.org.uk/services";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FCA_API_KEY = Deno.env.get("FCA_API_KEY");
    if (!FCA_API_KEY) {
      throw new Error("FCA_API_KEY is not configured");
    }

    const { action, ...params } = await req.json();

    const headers: Record<string, string> = {
      "X-Auth-Email": FCA_API_KEY,
      "X-Auth-Key": FCA_API_KEY,
      Accept: "application/json",
    };

    let result: unknown;

    switch (action) {
      case "search": {
        const q = encodeURIComponent(params.query || "");
        const type = params.type || "firm";
        const res = await fetch(
          `${FCA_BASE}/V0.1/Search?q=${q}&type=${type}`,
          { headers }
        );
        if (res.status === 404) {
          result = { Status: "Not Found", Data: [], Message: `No results found for "${params.query}"` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`FCA search failed [${res.status}]: ${text}`);
        }
        result = await res.json();
        break;
      }

      case "firm": {
        if (!params.frn) throw new Error("FRN is required");
        const res = await fetch(`${FCA_BASE}/V0.1/Firm/${params.frn}`, {
          headers,
        });
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No firm found with FRN ${params.frn}` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`FCA firm lookup failed [${res.status}]: ${text}`);
        }
        result = await res.json();
        break;
      }

      case "firm-individuals": {
        if (!params.frn) throw new Error("FRN is required");
        const res = await fetch(
          `${FCA_BASE}/V0.1/Firm/${params.frn}/Individuals`,
          { headers }
        );
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No individuals found for FRN ${params.frn}` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `FCA individuals lookup failed [${res.status}]: ${text}`
          );
        }
        result = await res.json();
        break;
      }

      case "firm-permissions": {
        if (!params.frn) throw new Error("FRN is required");
        const res = await fetch(
          `${FCA_BASE}/V0.1/Firm/${params.frn}/Permission`,
          { headers }
        );
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No permissions found for FRN ${params.frn}` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `FCA permissions lookup failed [${res.status}]: ${text}`
          );
        }
        result = await res.json();
        break;
      }

      case "firm-activities": {
        if (!params.frn) throw new Error("FRN is required");
        const res = await fetch(
          `${FCA_BASE}/V0.1/Firm/${params.frn}/Activities`,
          { headers }
        );
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No activities found for FRN ${params.frn}` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `FCA activities lookup failed [${res.status}]: ${text}`
          );
        }
        result = await res.json();
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fca-register error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
