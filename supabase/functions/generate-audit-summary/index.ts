import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateAuditData(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object") {
    throw new ValidationError("auditData must be an object");
  }

  const raw = JSON.stringify(data);
  if (raw.length > 50000) {
    throw new ValidationError("auditData must be less than 50KB");
  }

  const d = data as Record<string, unknown>;

  if (typeof d.dealerName !== "string" || d.dealerName.length > 200) {
    throw new ValidationError("dealerName must be a string under 200 chars");
  }
  if (typeof d.firmType !== "string") {
    throw new ValidationError("firmType is required");
  }
  if (typeof d.overallRag !== "string") {
    throw new ValidationError("overallRag is required");
  }
  if (typeof d.overallScore !== "number" || d.overallScore < 0 || d.overallScore > 100) {
    throw new ValidationError("overallScore must be 0-100");
  }
  if (typeof d.customerSentimentScore !== "number" || d.customerSentimentScore < 0 || d.customerSentimentScore > 10) {
    throw new ValidationError("customerSentimentScore must be 0-10");
  }
  if (!Array.isArray(d.sections) || d.sections.length > 50) {
    throw new ValidationError("sections must be an array with max 50 items");
  }
  if (!Array.isArray(d.keyActions) || d.keyActions.length > 100) {
    throw new ValidationError("keyActions must be an array with max 100 items");
  }

  return d;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
    const body = await req.json();
    const auditData = validateAuditData(body.auditData);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a senior FCA compliance analyst producing executive summaries for motor dealer compliance audits. Write in formal, professional British English suitable for board-level reporting.

Structure your summary with these sections using markdown:
## Executive Summary
A 2-3 sentence overview of the dealer's compliance position.

## Key Findings
Bullet points of the most significant findings, both positive and negative. Reference specific section names.

## Risk Areas
Highlight any red or amber rated sections with specific concerns (e.g., missing IDD, CreditSafe issues, representative APR gaps).

## Recommended Actions
Prioritised list of remediation steps, distinguishing between urgent (red), important (amber), and monitoring (green) items.

## Assurance Opinion
A final paragraph giving an overall assurance opinion on the dealer's compliance posture, suitable for regulatory reporting.

Keep the summary concise but comprehensive — approximately 400-500 words. Use specific data from the audit (scores, RAG statuses, control results) to support your analysis. Do not use emojis.`;

    const userPrompt = `Generate an executive compliance summary for the following dealer audit:

Dealer: ${auditData.dealerName}
Firm Type: ${auditData.firmType === "AR" ? "Appointed Representative" : "Directly Authorised"}
Overall RAG Status: ${String(auditData.overallRag).toUpperCase()}
Overall Score: ${auditData.overallScore}%
Customer Sentiment Score: ${auditData.customerSentimentScore}/10
Last Audit Date: ${auditData.lastAuditDate || "N/A"}

Section Results:
${(auditData.sections as any[]).map((s: any) => `- ${s.name}: RAG=${s.summary.ragStatus.toUpperCase()}, Green=${s.summary.green}, Amber=${s.summary.amber}, Red=${s.summary.red}. Notes: ${s.summary.notes}`).join("\n")}

Key Actions (${(auditData.keyActions as any[]).length} total):
${(auditData.keyActions as any[]).map((a: any) => `- [${a.priority}] ${a.action} (${a.status}) — ${a.section}`).join("\n")}

Failed/Partial Controls:
${(auditData.sections as any[]).flatMap((s: any) => s.controls.filter((c: any) => c.result !== "pass").map((c: any) => `- ${s.name} > ${c.controlArea}: ${c.result.toUpperCase()} — ${c.comments}`)).join("\n") || "None"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    if (e instanceof ValidationError) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("generate-audit-summary error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
