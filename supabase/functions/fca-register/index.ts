import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FCA_BASE = "https://register.fca.org.uk/services";

// Input validation helpers
function validateFrn(frn: unknown): string {
  if (typeof frn !== "string" || !/^\d{1,7}$/.test(frn)) {
    throw new ValidationError("FRN must be 1-7 digits");
  }
  return frn;
}

function validateQuery(query: unknown): string {
  if (typeof query !== "string" || query.length === 0 || query.length > 200) {
    throw new ValidationError("Query must be 1-200 characters");
  }
  return query;
}

function validateType(type: unknown): string {
  const allowed = ["firm", "individual"];
  if (type !== undefined && (typeof type !== "string" || !allowed.includes(type))) {
    throw new ValidationError("Type must be 'firm' or 'individual'");
  }
  return (type as string) || "firm";
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
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
    const FCA_API_KEY = Deno.env.get("FCA_API_KEY");
    if (!FCA_API_KEY) {
      throw new Error("FCA_API_KEY is not configured");
    }

    const body = await req.json();
    const action = body.action;

    if (typeof action !== "string") {
      throw new ValidationError("action is required");
    }

    const headers: Record<string, string> = {
      "X-Auth-Email": FCA_API_KEY,
      "X-Auth-Key": FCA_API_KEY,
      Accept: "application/json",
    };

    let result: unknown;

    switch (action) {
      case "search": {
        const q = encodeURIComponent(validateQuery(body.query));
        const type = validateType(body.type);
        const res = await fetch(
          `${FCA_BASE}/V0.1/Search?q=${q}&type=${type}`,
          { headers }
        );
        if (res.status === 404) {
          result = { Status: "Not Found", Data: [], Message: `No results found for "${body.query}"` };
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
        const frn = validateFrn(body.frn);
        const res = await fetch(`${FCA_BASE}/V0.1/Firm/${frn}`, { headers });
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No firm found with FRN ${frn}` };
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
        const frn = validateFrn(body.frn);
        const res = await fetch(`${FCA_BASE}/V0.1/Firm/${frn}/Individuals`, { headers });
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No individuals found for FRN ${frn}` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`FCA individuals lookup failed [${res.status}]: ${text}`);
        }
        result = await res.json();
        break;
      }

      case "firm-permissions": {
        const frn = validateFrn(body.frn);
        const res = await fetch(`${FCA_BASE}/V0.1/Firm/${frn}/Permission`, { headers });
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No permissions found for FRN ${frn}` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`FCA permissions lookup failed [${res.status}]: ${text}`);
        }
        result = await res.json();
        break;
      }

      case "firm-activities": {
        const frn = validateFrn(body.frn);
        const res = await fetch(`${FCA_BASE}/V0.1/Firm/${frn}/Activities`, { headers });
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No activities found for FRN ${frn}` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`FCA activities lookup failed [${res.status}]: ${text}`);
        }
        result = await res.json();
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
    console.error("fca-register error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
