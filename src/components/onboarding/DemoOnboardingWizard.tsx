import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingDocUpload } from "@/components/onboarding/OnboardingDocUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Loader2, CheckCircle2, XCircle, AlertTriangle,
  ArrowRight, ArrowLeft, Building2, FileUp, Send,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface FieldResult {
  label: string;
  value: string;
  source: string;
}

interface SearchResults {
  fields: FieldResult[];
  companyNumber: string;
  dealerName: string;
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Company Search                                            */
/* ------------------------------------------------------------------ */
function StepSearch({
  onResults,
}: {
  onResults: (r: SearchResults) => void;
}) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"name" | "postcode" | "frn">("name");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  const runSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setProgress(0);

    const fields: FieldResult[] = [];
    let companyNumber = "";
    let dealerName = query;

    try {
      // --- Companies House ---
      setProgressLabel("Searching Companies House…");
      setProgress(15);

      try {
        const searchBody: Record<string, string> = { action: "search", query: query.trim() };
        const { data: chSearch } = await supabase.functions.invoke("companies-house", { body: searchBody });
        const items = chSearch?.items || [];
        if (items.length > 0) {
          const co = items[0];
          companyNumber = co.company_number || "";
          dealerName = co.title || query;
          fields.push(
            { label: "Company Name", value: co.title || "", source: "Companies House" },
            { label: "Company Number", value: companyNumber, source: "Companies House" },
            { label: "Company Status", value: co.company_status || "", source: "Companies House" },
          );
          if (co.address_snippet) {
            fields.push({ label: "Registered Address", value: co.address_snippet, source: "Companies House" });
          }
          if (co.date_of_creation) {
            fields.push({ label: "Incorporation Date", value: co.date_of_creation, source: "Companies House" });
          }
        }
      } catch (e) {
        console.warn("CH search failed:", e);
      }

      // Get full profile if we have a company number
      if (companyNumber) {
        setProgress(30);
        try {
          const { data: profile } = await supabase.functions.invoke("companies-house", {
            body: { action: "profile", companyNumber },
          });
          if (profile && profile.status !== "not_found") {
            if (profile.registered_office_address) {
              const a = profile.registered_office_address;
              const addr = [a.address_line_1, a.address_line_2, a.locality, a.region, a.postal_code].filter(Boolean).join(", ");
              const existing = fields.find(f => f.label === "Registered Address");
              if (existing) existing.value = addr;
              else fields.push({ label: "Registered Address", value: addr, source: "Companies House" });
            }
            if (profile.sic_codes?.length) {
              fields.push({ label: "SIC Codes", value: profile.sic_codes.join(", "), source: "Companies House" });
            }
          }
        } catch {}

        setProgress(40);
        // Officers
        try {
          const { data: officers } = await supabase.functions.invoke("companies-house", {
            body: { action: "officers", companyNumber },
          });
          const active = (officers?.items || []).filter((o: any) => !o.resigned_on);
          if (active.length > 0) {
            fields.push({
              label: "Active Directors",
              value: active.map((o: any) => `${o.name} (${o.officer_role})`).join("; "),
              source: "Companies House",
            });
          }
        } catch {}

        setProgress(50);
        // PSCs
        try {
          const { data: pscs } = await supabase.functions.invoke("companies-house", {
            body: { action: "pscs", companyNumber },
          });
          const items = pscs?.items || [];
          if (items.length > 0) {
            fields.push({
              label: "Persons of Significant Control",
              value: items.map((p: any) => p.name).filter(Boolean).join("; "),
              source: "Companies House",
            });
          }
        } catch {}
      }

      // --- FCA Register ---
      setProgressLabel("Searching FCA Register…");
      setProgress(60);

      try {
        const fcaQuery = searchType === "frn" ? query.trim() : dealerName;
        const fcaAction = searchType === "frn" ? "firm" : "search";
        const fcaBody = searchType === "frn"
          ? { action: fcaAction, frn: fcaQuery }
          : { action: fcaAction, query: fcaQuery, type: "firm" };

        const { data: fcaData } = await supabase.functions.invoke("fca-register", { body: fcaBody });

        const fcaResults = fcaData?.Data || [];
        if (fcaResults.length > 0) {
          const firm = fcaResults[0];
          const frn = firm["FRN"] || firm["Firm Reference Number"] || "";
          if (frn) {
            fields.push({ label: "FCA FRN", value: frn, source: "FCA Register" });

            const status = firm["Current Status"] || firm["Status"] || "";
            if (status) fields.push({ label: "FCA Status", value: status, source: "FCA Register" });

            // Get permissions
            setProgress(75);
            try {
              const { data: permResult } = await supabase.functions.invoke("fca-register", {
                body: { action: "firm-permissions", frn },
              });
              const perms = permResult?.Data || [];
              if (perms.length > 0) {
                const permNames = perms.map((p: any) => p["Permission"] || p["Regulated Activity"] || "Unknown");
                fields.push({
                  label: "FCA Permissions",
                  value: permNames.slice(0, 5).join("; ") + (permNames.length > 5 ? ` (+${permNames.length - 5} more)` : ""),
                  source: "FCA Register",
                });
              }
            } catch {}

            // Individuals
            try {
              const { data: indResult } = await supabase.functions.invoke("fca-register", {
                body: { action: "firm-individuals", frn },
              });
              const inds = indResult?.Data || [];
              if (inds.length > 0) {
                fields.push({
                  label: "Approved Individuals",
                  value: inds.slice(0, 5).map((i: any) => i["Full Name"] || i["Name"] || "").filter(Boolean).join("; "),
                  source: "FCA Register",
                });
              }
            } catch {}
          }
        }
      } catch (e) {
        console.warn("FCA search failed:", e);
      }

      setProgress(100);
      setProgressLabel("Search complete");

      // Add known required fields that are missing
      const requiredLabels = [
        "Company Name", "Company Number", "Registered Address", "Company Status",
        "Active Directors", "FCA FRN", "FCA Status", "FCA Permissions",
        "VAT Registration", "Trading Address", "Insurance Details",
      ];
      const foundLabels = new Set(fields.map(f => f.label));
      for (const label of requiredLabels) {
        if (!foundLabels.has(label)) {
          fields.push({ label, value: "", source: "" });
        }
      }

      onResults({ fields, companyNumber, dealerName });

      toast({
        title: "Search Complete",
        description: `Found ${fields.filter(f => f.value).length} fields, ${fields.filter(f => !f.value).length} missing.`,
      });
    } catch (e) {
      console.error("Search error:", e);
      toast({ title: "Search Failed", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [query, searchType, onResults, toast]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          <CardTitle>Step 1: Company Search</CardTitle>
        </div>
        <CardDescription>
          Search by company name, postcode, or FCA FRN to automatically retrieve data from Companies House and the FCA Register.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search type selector */}
        <div className="flex gap-2">
          {([
            { key: "name", label: "Company Name" },
            { key: "postcode", label: "Postcode" },
            { key: "frn", label: "FCA FRN" },
          ] as const).map((t) => (
            <Button
              key={t.key}
              variant={searchType === t.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchType(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-3">
          <Input
            placeholder={
              searchType === "name" ? "Enter company name…" :
              searchType === "postcode" ? "Enter postcode…" :
              "Enter FCA FRN…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            className="flex-1"
          />
          <Button onClick={runSearch} disabled={loading || !query.trim()} className="gap-2 shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progressLabel}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Results Review                                            */
/* ------------------------------------------------------------------ */
function StepResults({ results }: { results: SearchResults }) {
  const found = results.fields.filter(f => f.value);
  const missing = results.fields.filter(f => !f.value);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <CardTitle>Step 2: Search Results</CardTitle>
        </div>
        <CardDescription>
          Data automatically retrieved from Companies House and FCA Register. Missing fields are highlighted in red.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 text-sm">
          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400 gap-1">
            <CheckCircle2 className="w-3 h-3" /> {found.length} Found
          </Badge>
          {missing.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="w-3 h-3" /> {missing.length} Missing
            </Badge>
          )}
        </div>

        {/* Found fields */}
        {found.length > 0 && (
          <div className="space-y-1.5">
            {found.map((f, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2"
              >
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-medium">{f.value}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px]">{f.source}</Badge>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Missing fields */}
        {missing.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-destructive flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> Missing — requires manual input
            </p>
            {missing.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
              >
                <div>
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-medium text-destructive">NOT FOUND</p>
                </div>
                <XCircle className="w-4 h-4 text-destructive shrink-0" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Completion Form                                           */
/* ------------------------------------------------------------------ */
function StepCompletionForm({
  results,
  onComplete,
}: {
  results: SearchResults;
  onComplete: () => void;
}) {
  const missing = results.fields.filter(f => !f.value);
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const updateOverride = (label: string, value: string) =>
    setOverrides((prev) => ({ ...prev, [label]: value }));

  const filledCount = Object.values(overrides).filter(v => v.trim()).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileUp className="w-5 h-5 text-primary" />
          <CardTitle>Step 3: Complete Missing Information</CardTitle>
        </div>
        <CardDescription>
          Fill in any fields that couldn't be found automatically and upload supporting documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Missing field inputs */}
        {missing.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Missing Fields ({filledCount}/{missing.length} completed)</p>
            <Progress value={missing.length > 0 ? (filledCount / missing.length) * 100 : 100} className="h-2" />

            <div className="grid gap-3 sm:grid-cols-2">
              {missing.map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    placeholder={`Enter ${f.label.toLowerCase()}…`}
                    value={overrides[f.label] || ""}
                    onChange={(e) => updateOverride(f.label, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {missing.length === 0 && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              All fields were found automatically — no manual input needed.
            </p>
          </div>
        )}

        {/* Additional notes */}
        <div className="space-y-2">
          <Label>Additional Notes</Label>
          <Textarea placeholder="Any additional information or context…" className="min-h-[80px]" />
        </div>

        {/* Document upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FileUp className="w-4 h-4" /> Upload Supporting Documents
          </Label>
          {results.dealerName ? (
            <OnboardingDocUpload dealerName={results.dealerName} category="Onboarding" compact />
          ) : (
            <p className="text-xs text-muted-foreground">Run a search first to enable uploads.</p>
          )}
        </div>

        <Button onClick={onComplete} className="gap-2 w-full sm:w-auto">
          <Send className="w-4 h-4" /> Submit Application
        </Button>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Wizard                                                        */
/* ------------------------------------------------------------------ */
export function DemoOnboardingWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [results, setResults] = useState<SearchResults | null>(null);

  const handleResults = (r: SearchResults) => {
    setResults(r);
    setStep(2);
  };

  const handleComplete = () => {
    toast({ title: "Application Submitted", description: "Demo application has been submitted successfully." });
    setStep(1);
    setResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Company Search" },
          { n: 2, label: "Review Results" },
          { n: 3, label: "Complete & Upload" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            {i > 0 && <div className={`h-px w-8 ${step >= s.n ? "bg-primary" : "bg-border"}`} />}
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                step === s.n
                  ? "bg-primary text-primary-foreground"
                  : step > s.n
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
              }`}
              onClick={() => {
                if (s.n === 1) setStep(1);
                if (s.n === 2 && results) setStep(2);
                if (s.n === 3 && results) setStep(3);
              }}
            >
              {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : <span>{s.n}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 1 && <StepSearch onResults={handleResults} />}
      {step === 2 && results && (
        <>
          <StepResults results={results} />
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> New Search
            </Button>
            <Button onClick={() => setStep(3)} className="gap-2">
              Continue to Form <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
      {step === 3 && results && (
        <>
          <StepCompletionForm results={results} onComplete={handleComplete} />
          <div className="flex justify-start">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Results
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
