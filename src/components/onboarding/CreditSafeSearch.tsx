import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, Building2, Loader2, ShieldCheck, AlertTriangle, ShieldAlert,
  TrendingUp, TrendingDown, Minus,
} from "lucide-react";

interface CreditScoreResult {
  companyName: string;
  score: string | null;
  maxScore: string | null;
  description: string | null;
  creditLimit: number | null;
  dbt: number | null;
  ccjCount: number | null;
  riskLevel: "Low Risk" | "Medium Risk" | "High Risk" | null;
  previousScore: string | null;
  status: string | null;
  regNo: string | null;
}

export type { CreditScoreResult };

function getRiskBadge(risk: string | null) {
  if (!risk) return null;
  if (risk === "Low Risk") return { icon: ShieldCheck, className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" };
  if (risk === "Medium Risk") return { icon: AlertTriangle, className: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400" };
  return { icon: ShieldAlert, className: "bg-destructive/15 text-destructive border-destructive/30" };
}

interface Props {
  defaultSearch?: string;
  companyNumber?: string;
  /** "full" = search + detail cards, "score-only" = just score badge inline */
  variant?: "full" | "score-only";
  onResult?: (result: CreditScoreResult) => void;
}

export function CreditSafeSearch({ defaultSearch = "", companyNumber, variant = "full", onResult }: Props) {
  const { toast } = useToast();
  const [query, setQuery] = useState(defaultSearch);
  const [searching, setSearching] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [result, setResult] = useState<CreditScoreResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = async (byReg = false) => {
    setSearching(true);
    setCompanies([]);
    setResult(null);
    setHasSearched(true);

    try {
      const body: Record<string, string> = { action: "search", country: "GB" };
      if (byReg && companyNumber) body.regNo = companyNumber;
      else body.name = query;

      const { data, error } = await supabase.functions.invoke("creditsafe", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const list = data?.companies || [];
      setCompanies(list);
      if (list.length === 0) toast({ title: "No Results", description: "No companies found." });
    } catch (e) {
      toast({ title: "Search Failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const fetchReport = async (company: any) => {
    setLoadingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke("creditsafe", {
        body: { action: "report", connectId: company.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const report = data?.report;
      const cr = report?.creditScore?.currentCreditRating;
      const scoreVal = cr?.providerValue?.value;
      const scoreNum = scoreVal ? parseInt(scoreVal) : 0;

      const res: CreditScoreResult = {
        companyName: report?.companySummary?.businessName || company.name,
        score: scoreVal || null,
        maxScore: cr?.providerValue?.maxValue || "100",
        description: cr?.commonDescription || null,
        creditLimit: cr?.creditLimit?.value || null,
        dbt: report?.paymentData?.dbt ?? null,
        ccjCount: report?.negativeInformation?.ccjSummary?.numberOfExact ?? null,
        riskLevel: scoreVal ? (scoreNum >= 71 ? "Low Risk" : scoreNum >= 40 ? "Medium Risk" : "High Risk") : null,
        previousScore: report?.creditScore?.previousCreditRating?.commonValue || null,
        status: report?.companySummary?.companyStatus?.status || null,
        regNo: report?.companySummary?.companyRegistrationNumber || null,
      };

      setResult(res);
      onResult?.(res);
    } catch (e) {
      toast({ title: "Report Failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setLoadingReport(false);
    }
  };

  // Score-only variant: just show result inline
  if (variant === "score-only" && result) {
    const badge = getRiskBadge(result.riskLevel);
    return (
      <div className="flex items-center gap-2">
        <span className={`font-bold ${result.riskLevel === "Low Risk" ? "text-emerald-600" : result.riskLevel === "Medium Risk" ? "text-amber-600" : "text-destructive"}`}>
          {result.score}
        </span>
        <span className="text-xs text-muted-foreground">/ {result.maxScore}</span>
        {badge && (
          <Badge variant="outline" className={`text-[10px] ${badge.className}`}>
            <badge.icon className="w-2.5 h-2.5 mr-0.5" />{result.riskLevel}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      {!result && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search CreditSafe…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                className="pl-9 h-9 bg-background"
              />
            </div>
            <Button onClick={() => doSearch()} disabled={searching || !query} size="sm" className="h-9">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
            {companyNumber && (
              <Button onClick={() => doSearch(true)} disabled={searching} variant="outline" size="sm" className="h-9 text-xs">
                By Reg No
              </Button>
            )}
          </div>

          {/* Results list */}
          {companies.length > 0 && (
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden max-h-48 overflow-y-auto">
              {companies.map((c: any) => (
                <div
                  key={c.id}
                  className="px-3 py-2 flex items-center gap-2 hover:bg-muted/50 cursor-pointer text-sm"
                  onClick={() => fetchReport(c)}
                >
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.regNo}</span>
                </div>
              ))}
            </div>
          )}

          {loadingReport && (
            <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Fetching report…
            </div>
          )}

          {hasSearched && companies.length === 0 && !searching && (
            <p className="text-xs text-muted-foreground text-center py-2">No companies found.</p>
          )}
        </>
      )}

      {/* Result card */}
      {result && (
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{result.companyName}</p>
              <p className="text-xs text-muted-foreground">{result.regNo} · {result.status}</p>
            </div>
            {(() => {
              const badge = getRiskBadge(result.riskLevel);
              return badge ? (
                <Badge variant="outline" className={`text-xs ${badge.className}`}>
                  <badge.icon className="w-3 h-3 mr-1" />{result.riskLevel}
                </Badge>
              ) : null;
            })()}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-muted/30 rounded-md p-2.5">
              <p className="text-[10px] text-muted-foreground mb-0.5">Credit Score</p>
              <div className="flex items-center gap-1">
                <span className={`text-lg font-bold ${result.riskLevel === "Low Risk" ? "text-emerald-600" : result.riskLevel === "Medium Risk" ? "text-amber-600" : "text-destructive"}`}>
                  {result.score || "N/A"}
                </span>
                <span className="text-[10px] text-muted-foreground">/ {result.maxScore}</span>
                {result.previousScore && (
                  parseInt(result.score || "0") > parseInt(result.previousScore) ? <TrendingUp className="w-3 h-3 text-score-up" /> :
                  parseInt(result.score || "0") < parseInt(result.previousScore) ? <TrendingDown className="w-3 h-3 text-score-down" /> :
                  <Minus className="w-3 h-3 text-score-neutral" />
                )}
              </div>
            </div>
            <div className="bg-muted/30 rounded-md p-2.5">
              <p className="text-[10px] text-muted-foreground mb-0.5">Credit Limit</p>
              <span className="text-sm font-bold">{result.creditLimit ? `£${result.creditLimit.toLocaleString()}` : "N/A"}</span>
            </div>
            <div className="bg-muted/30 rounded-md p-2.5">
              <p className="text-[10px] text-muted-foreground mb-0.5">DBT</p>
              <span className={`text-sm font-bold ${result.dbt && result.dbt > 30 ? "text-destructive" : ""}`}>{result.dbt !== null ? `${result.dbt} days` : "N/A"}</span>
            </div>
            <div className="bg-muted/30 rounded-md p-2.5">
              <p className="text-[10px] text-muted-foreground mb-0.5">CCJs</p>
              <span className={`text-sm font-bold ${result.ccjCount && result.ccjCount > 0 ? "text-destructive" : ""}`}>{result.ccjCount ?? "N/A"}</span>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setResult(null); setCompanies([]); setHasSearched(false); }}>
            New Search
          </Button>
        </div>
      )}
    </div>
  );
}
