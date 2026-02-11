import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const { auditData } = await req.json();
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
Overall RAG Status: ${auditData.overallRag.toUpperCase()}
Overall Score: ${auditData.overallScore}%
Customer Sentiment Score: ${auditData.customerSentimentScore}/10
Last Audit Date: ${auditData.lastAuditDate}

Section Results:
${auditData.sections.map((s: any) => `- ${s.name}: RAG=${s.summary.ragStatus.toUpperCase()}, Green=${s.summary.green}, Amber=${s.summary.amber}, Red=${s.summary.red}. Notes: ${s.summary.notes}`).join("\n")}

Key Actions (${auditData.keyActions.length} total):
${auditData.keyActions.map((a: any) => `- [${a.priority}] ${a.action} (${a.status}) — ${a.section}`).join("\n")}

Failed/Partial Controls:
${auditData.sections.flatMap((s: any) => s.controls.filter((c: any) => c.result !== "pass").map((c: any) => `- ${s.name} > ${c.controlArea}: ${c.result.toUpperCase()} — ${c.comments}`)).join("\n") || "None"}`;

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
    console.error("generate-audit-summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
