import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search, Loader2, CheckCircle2, AlertTriangle, XCircle,
  Building2, PoundSterling, Users, FileText,
  ChevronDown, ChevronUp, ExternalLink, Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface EnrichmentResult {
  business_info: Record<string, string>;
  financial_info: Record<string, string | Record<string, string>>;
  directors_and_shareholders: Record<string, string | any[]>;
  supporting_docs: Record<string, string>;
  missing_fields: string[];
}

interface Props {
  dealerName: string;
  companyNumber?: string;
  onEnriched?: (result: EnrichmentResult, screeningMap: Record<string, string>) => void;
}

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */
const NOT_FOUND = "NOT FOUND";

function fieldDisplay(value: unknown): string {
  if (value === NOT_FOUND || value === null || value === undefined || value === "") return NOT_FOUND;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function FieldRow({ label, value }: { label: string; value: unknown }) {
  const display = fieldDisplay(value);
  const missing = display === NOT_FOUND;
  return (
    <div className="flex items-start justify-between gap-3 py-2 px-3 rounded-md bg-muted/20">
      <span className="text-xs text-muted-foreground shrink-0 w-44">{label}</span>
      <div className="flex items-center gap-2 flex-1 justify-end text-right">
        {missing ? (
          <>
            <span className="text-xs text-destructive font-medium">{display}</span>
            <Badge variant="destructive" className="text-[9px] px-1 py-0 h-auto">MISSING</Badge>
          </>
        ) : (
          <>
            <span className="text-xs font-medium text-foreground break-all">{display}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export function DealerEnrichment({ dealerName, companyNumber, onEnriched }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState<EnrichmentResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    business: true, financial: true, directors: true, docs: true,
  });

  const toggleSection = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const runEnrichment = useCallback(async () => {
    if (!dealerName) return;
    setLoading(true);
    setProgress(0);
    setResult(null);

    const enriched: EnrichmentResult = {
      business_info: {
        registered_name: NOT_FOUND,
        trading_names: NOT_FOUND,
        registered_address: NOT_FOUND,
        trading_address: NOT_FOUND,
        company_number: companyNumber || NOT_FOUND,
        fca_frn: NOT_FOUND,
        fca_permissions_summary: NOT_FOUND,
        vat_number: NOT_FOUND,
        incorporation_date: NOT_FOUND,
        sic_codes: NOT_FOUND,
      },
      financial_info: {
        credit_score: NOT_FOUND,
        risk_band: NOT_FOUND,
        credit_limit: NOT_FOUND,
        average_payment_behaviour_dbt: NOT_FOUND,
        last_3_years_accounts: NOT_FOUND,
      },
      directors_and_shareholders: {
        active_directors: NOT_FOUND,
        persons_of_significant_control: NOT_FOUND,
      },
      supporting_docs: {
        fca_authorisation_link: NOT_FOUND,
        companies_house_profile_link: NOT_FOUND,
        filing_history_link: NOT_FOUND,
      },
      missing_fields: [],
    };

    const screeningMap: Record<string, string> = {};

    try {
      // ---------- 1. Companies House ----------
      setProgressLabel("Searching Companies House…");
      setProgress(10);

      let chCompanyNumber = companyNumber || "";

      // Search by name if no company number
      if (!chCompanyNumber) {
        try {
          const { data } = await supabase.functions.invoke("companies-house", {
            body: { action: "search", query: dealerName },
          });
          const items = data?.items || [];
          if (items.length > 0) {
            chCompanyNumber = items[0].company_number || "";
            enriched.business_info.company_number = chCompanyNumber;
          }
        } catch (e) {
          console.warn("CH search failed:", e);
        }
      }

      if (chCompanyNumber) {
        setProgress(20);
        // Profile
        try {
          const { data: profile } = await supabase.functions.invoke("companies-house", {
            body: { action: "profile", companyNumber: chCompanyNumber },
          });
          if (profile && profile.status !== "not_found") {
            enriched.business_info.registered_name = profile.company_name || NOT_FOUND;
            screeningMap.companyName = profile.company_name || "";

            if (profile.registered_office_address) {
              const a = profile.registered_office_address;
              const addr = [a.address_line_1, a.address_line_2, a.locality, a.region, a.postal_code, a.country]
                .filter(Boolean).join(", ");
              enriched.business_info.registered_address = addr || NOT_FOUND;
              screeningMap.registeredAddress = addr;
            }

            enriched.business_info.incorporation_date = profile.date_of_creation || NOT_FOUND;
            enriched.business_info.company_number = chCompanyNumber;
            screeningMap.companyRegNo = chCompanyNumber;
            screeningMap.companyStatus = profile.company_status || "";

            if (profile.sic_codes?.length > 0) {
              enriched.business_info.sic_codes = profile.sic_codes.join(", ");
            }

            enriched.supporting_docs.companies_house_profile_link =
              `https://find-and-update.company-information.service.gov.uk/company/${chCompanyNumber}`;
            enriched.supporting_docs.filing_history_link =
              `https://find-and-update.company-information.service.gov.uk/company/${chCompanyNumber}/filing-history`;
          }
        } catch (e) {
          console.warn("CH profile failed:", e);
        }

        setProgress(35);
        // Officers
        try {
          const { data: officers } = await supabase.functions.invoke("companies-house", {
            body: { action: "officers", companyNumber: chCompanyNumber },
          });
          const items = officers?.items || [];
          const active = items.filter((o: any) => !o.resigned_on);
          if (active.length > 0) {
            enriched.directors_and_shareholders.active_directors = active.map((o: any) => ({
              name: o.name,
              role: o.officer_role,
              appointed_on: o.appointed_on || NOT_FOUND,
              dob: o.date_of_birth
                ? `${o.date_of_birth.month}/${o.date_of_birth.year}`
                : NOT_FOUND,
              nationality: o.nationality || NOT_FOUND,
            }));
            screeningMap.fcaIndividuals = active.slice(0, 3).map((o: any) => o.name).join(", ") +
              (active.length > 3 ? ` (+${active.length - 3} more)` : "");
          }
        } catch (e) {
          console.warn("CH officers failed:", e);
        }

        setProgress(45);
        // PSCs
        try {
          const { data: pscs } = await supabase.functions.invoke("companies-house", {
            body: { action: "pscs", companyNumber: chCompanyNumber },
          });
          const items = pscs?.items || [];
          if (items.length > 0) {
            enriched.directors_and_shareholders.persons_of_significant_control = items.map((p: any) => ({
              name: p.name || p.name_elements?.forename + " " + p.name_elements?.surname || NOT_FOUND,
              natures_of_control: p.natures_of_control || [],
              notified_on: p.notified_on || NOT_FOUND,
            }));
          }
        } catch (e) {
          console.warn("CH PSCs failed:", e);
        }
      }

      // ---------- 2. FCA Register ----------
      setProgressLabel("Searching FCA Register…");
      setProgress(55);

      try {
        const { data: fcaSearch } = await supabase.functions.invoke("fca-register", {
          body: { action: "search", query: dealerName, type: "firm" },
        });
        const fcaResults = fcaSearch?.Data || [];
        if (fcaResults.length > 0) {
          const frn = fcaResults[0]["FRN"] || fcaResults[0]["Firm Reference Number"];
          if (frn) {
            // Firm detail
            const { data: firmDetail } = await supabase.functions.invoke("fca-register", {
              body: { action: "firm", frn },
            });
            const firm = firmDetail?.Data?.[0] || firmDetail;
            if (firm && firm.Status !== "Not Found") {
              enriched.business_info.fca_frn = frn;
              screeningMap.fcaFrn = `FRN: ${frn} — ${firm["Current Status"] || "Unknown"}`;
              enriched.supporting_docs.fca_authorisation_link =
                `https://register.fca.org.uk/s/firm?id=${frn}`;

              if (firm["Address"]) {
                const addr = Object.values(firm["Address"] as Record<string, string>).filter(Boolean).join(", ");
                if (!screeningMap.registeredAddress && addr) {
                  enriched.business_info.registered_address = addr;
                  screeningMap.registeredAddress = addr;
                }
              }
            }

            // Permissions
            setProgress(65);
            const { data: permResult } = await supabase.functions.invoke("fca-register", {
              body: { action: "firm-permissions", frn },
            });
            const perms = permResult?.Data || [];
            if (perms.length > 0) {
              const permNames = perms.map((p: any) => p["Permission"] || p["Regulated Activity"] || "Unknown");
              enriched.business_info.fca_permissions_summary = permNames.slice(0, 5).join("; ") +
                (permNames.length > 5 ? ` (+${permNames.length - 5} more)` : "");
              screeningMap.fcaPermissions = permNames.slice(0, 3).join(", ");
            }
          }
        }
      } catch (e) {
        console.warn("FCA search failed:", e);
      }

      // ---------- 3. CreditSafe ----------
      setProgressLabel("Fetching CreditSafe data…");
      setProgress(75);

      try {
        const csBody: Record<string, string> = { action: "search", country: "GB" };
        if (chCompanyNumber) csBody.regNo = chCompanyNumber;
        else csBody.name = dealerName;

        const { data: csSearch } = await supabase.functions.invoke("creditsafe", { body: csBody });
        const companies = csSearch?.companies || [];
        if (companies.length > 0) {
          setProgress(85);
          const { data: csReport } = await supabase.functions.invoke("creditsafe", {
            body: { action: "report", connectId: companies[0].id },
          });

          if (csReport?.report) {
            const report = csReport.report;
            const cr = report.creditScore?.currentCreditRating;
            const scoreVal = cr?.providerValue?.value;
            const scoreNum = scoreVal ? parseInt(scoreVal) : 0;

            enriched.financial_info.credit_score = scoreVal
              ? `${scoreVal} / ${cr?.providerValue?.maxValue || "100"}`
              : NOT_FOUND;
            enriched.financial_info.risk_band = scoreVal
              ? (scoreNum >= 71 ? "Low Risk" : scoreNum >= 40 ? "Medium Risk" : "High Risk")
              : NOT_FOUND;
            enriched.financial_info.credit_limit = cr?.creditLimit?.value
              ? `£${cr.creditLimit.value.toLocaleString()}`
              : NOT_FOUND;
            enriched.financial_info.average_payment_behaviour_dbt =
              report.paymentData?.dbt !== undefined ? `${report.paymentData.dbt} days` : NOT_FOUND;

            if (scoreVal) {
              screeningMap.creditScore = `${scoreVal}/${cr?.providerValue?.maxValue || "100"} (${enriched.financial_info.risk_band})`;
            }

            // Company trading name from CS
            if (report.companySummary?.businessName) {
              enriched.business_info.trading_names = report.companySummary.businessName;
            }

            // Accounts
            const accounts = report.financialStatements || [];
            if (accounts.length > 0) {
              const summary = accounts.slice(0, 3).map((a: any) => {
                const year = a.yearEndDate || "N/A";
                const turnover = a.profitAndLoss?.revenue ?? a.profitAndLoss?.turnover ?? "N/A";
                const profit = a.profitAndLoss?.profitLoss ?? a.profitAndLoss?.operatingProfit ?? "N/A";
                const assets = a.balanceSheet?.totalAssets ?? "N/A";
                const liabilities = a.balanceSheet?.totalLiabilities ?? "N/A";
                return { year, turnover, profit, assets, liabilities };
              });
              enriched.financial_info.last_3_years_accounts = summary as any;
            }
          }
        }
      } catch (e) {
        console.warn("CreditSafe failed:", e);
      }

      // ---------- 4. Compute missing fields ----------
      setProgress(95);
      setProgressLabel("Computing results…");

      const missing: string[] = [];
      const checkMissing = (section: string, obj: Record<string, unknown>) => {
        for (const [key, val] of Object.entries(obj)) {
          const display = fieldDisplay(val);
          if (display === NOT_FOUND) missing.push(`${section}.${key}`);
        }
      };
      checkMissing("business_info", enriched.business_info);
      checkMissing("financial_info", enriched.financial_info);
      checkMissing("directors_and_shareholders", enriched.directors_and_shareholders);
      checkMissing("supporting_docs", enriched.supporting_docs);
      enriched.missing_fields = missing;

      setResult(enriched);
      onEnriched?.(enriched, screeningMap);
      setProgress(100);
      setProgressLabel("Complete");

      toast({
        title: "Enrichment Complete",
        description: `${missing.length} field(s) marked as MISSING.`,
      });
    } catch (e) {
      console.error("Enrichment error:", e);
      toast({ title: "Enrichment Failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [dealerName, companyNumber, onEnriched, toast]);

  const copyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast({ title: "Copied", description: "Enrichment JSON copied to clipboard." });
  };

  const SECTIONS = [
    {
      key: "business",
      title: "Business Information",
      icon: Building2,
      data: result?.business_info,
      fields: [
        ["Registered Name", "registered_name"],
        ["Trading Name(s)", "trading_names"],
        ["Registered Address", "registered_address"],
        ["Trading Address", "trading_address"],
        ["Company Number", "company_number"],
        ["FCA FRN", "fca_frn"],
        ["FCA Permissions", "fca_permissions_summary"],
        ["VAT Number", "vat_number"],
        ["Incorporation Date", "incorporation_date"],
        ["SIC Codes", "sic_codes"],
      ],
    },
    {
      key: "financial",
      title: "Financial Information",
      icon: PoundSterling,
      data: result?.financial_info,
      fields: [
        ["Credit Score", "credit_score"],
        ["Risk Band", "risk_band"],
        ["Credit Limit", "credit_limit"],
        ["Avg Payment Behaviour (DBT)", "average_payment_behaviour_dbt"],
        ["Last 3 Years' Accounts", "last_3_years_accounts"],
      ],
    },
    {
      key: "directors",
      title: "Directors & Shareholders",
      icon: Users,
      data: result?.directors_and_shareholders,
      fields: [
        ["Active Directors", "active_directors"],
        ["Persons of Significant Control", "persons_of_significant_control"],
      ],
    },
    {
      key: "docs",
      title: "Supporting Documents",
      icon: FileText,
      data: result?.supporting_docs,
      fields: [
        ["FCA Authorisation Link", "fca_authorisation_link"],
        ["Companies House Profile", "companies_house_profile_link"],
        ["Filing History", "filing_history_link"],
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Trigger button */}
      {!result && (
        <div className="space-y-3">
          <Button
            onClick={runEnrichment}
            disabled={loading || !dealerName}
            className="gap-2 w-full sm:w-auto"
            size="lg"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Enriching…" : "Run Full Enrichment"}
          </Button>
          {loading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progressLabel}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* Summary bar */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold">Enrichment Complete</p>
                <p className="text-xs text-muted-foreground">
                  {result.missing_fields.length} missing field(s) flagged
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={copyJson}>
                <Copy className="w-3 h-3" /> Copy JSON
              </Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setResult(null); setProgress(0); }}>
                Re-run
              </Button>
            </div>
          </div>

          {/* Section cards */}
          {SECTIONS.map((section) => (
            <Collapsible
              key={section.key}
              open={expandedSections[section.key]}
              onOpenChange={() => toggleSection(section.key)}
            >
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <section.icon className="w-4 h-4 text-primary" />
                    {section.title}
                  </div>
                  <div className="flex items-center gap-2">
                    {section.data && (
                      <Badge variant="outline" className="text-[10px]">
                        {section.fields.filter(([, k]) => fieldDisplay((section.data as any)?.[k]) !== NOT_FOUND).length}/{section.fields.length} found
                      </Badge>
                    )}
                    {expandedSections[section.key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1">
                <div className="rounded-lg border border-border p-3 space-y-1">
                  {section.fields.map(([label, key]) => {
                    const val = (section.data as any)?.[key];
                    // Special rendering for arrays (directors, PSCs)
                    if (Array.isArray(val)) {
                      return (
                        <div key={key} className="space-y-1">
                          <p className="text-[10px] text-muted-foreground px-3 pt-2 font-medium">{label}</p>
                          {val.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 py-1.5 px-3 rounded-md bg-muted/20 text-xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="font-medium">{item.name || JSON.stringify(item)}</span>
                              {item.role && <Badge variant="secondary" className="text-[9px]">{item.role}</Badge>}
                              {item.appointed_on && item.appointed_on !== NOT_FOUND && (
                                <span className="text-muted-foreground">Appt: {item.appointed_on}</span>
                              )}
                              {item.dob && item.dob !== NOT_FOUND && (
                                <span className="text-muted-foreground">DOB: {item.dob}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    // Special rendering for links
                    if (typeof val === "string" && val.startsWith("http")) {
                      return (
                        <div key={key} className="flex items-start justify-between gap-3 py-2 px-3 rounded-md bg-muted/20">
                          <span className="text-xs text-muted-foreground shrink-0 w-44">{label}</span>
                          <a href={val} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      );
                    }
                    // Special for accounts (object array stringified)
                    if (key === "last_3_years_accounts" && typeof val === "object" && val !== null && !Array.isArray(val)) {
                      return <FieldRow key={key} label={label} value={JSON.stringify(val)} />;
                    }
                    if (key === "last_3_years_accounts" && Array.isArray(val)) {
                      return (
                        <div key={key} className="space-y-1">
                          <p className="text-[10px] text-muted-foreground px-3 pt-2 font-medium">{label}</p>
                          {val.map((yr: any, i: number) => (
                            <div key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-1.5 px-3 rounded-md bg-muted/20 text-xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="font-medium">{yr.year}</span>
                              <span>Turnover: {yr.turnover ?? "N/A"}</span>
                              <span>P&L: {yr.profit ?? "N/A"}</span>
                              <span>Assets: {yr.assets ?? "N/A"}</span>
                              <span>Liabilities: {yr.liabilities ?? "N/A"}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return <FieldRow key={key} label={label} value={val} />;
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* Missing fields summary */}
          {result.missing_fields.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <p className="text-sm font-semibold text-destructive">Missing Fields ({result.missing_fields.length})</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_fields.map((f) => (
                  <Badge key={f} variant="outline" className="text-[10px] text-destructive border-destructive/30">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
