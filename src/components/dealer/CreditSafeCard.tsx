import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Flame,
} from "lucide-react";
import { PhoenixingAnalysis } from "./PhoenixingAnalysis";
import type { CreditSafeEntry } from "@/utils/pdfExport";

interface CreditSafeCompany {
  id: string;
  name: string;
  regNo?: string;
  status?: string;
  country?: string;
  address?: {
    simpleValue?: string;
    city?: string;
    postCode?: string;
  };
  creditScore?: {
    currentCreditRating?: {
      commonValue?: string;
      commonDescription?: string;
      creditLimit?: { value?: number; currency?: string };
      providerValue?: { value?: string; maxValue?: string };
    };
  };
}

export interface CreditSafeReport {
  report?: {
    companySummary?: {
      businessName?: string;
      companyRegistrationNumber?: string;
      companyStatus?: { status?: string };
      latestTurnoverFigure?: { value?: number; currency?: string };
      latestShareholdersEquityFigure?: { value?: number };
      companyRegistrationDate?: string;
      mainActivity?: { code?: string; description?: string };
    };
    creditScore?: {
      currentCreditRating?: {
        commonValue?: string;
        commonDescription?: string;
        creditLimit?: { value?: number; currency?: string };
        providerValue?: { value?: string; maxValue?: string };
      };
      previousCreditRating?: {
        commonValue?: string;
        commonDescription?: string;
      };
    };
    additionalInformation?: {
      ratingHistory?: Array<{ date?: string; rating?: number }>;
    };
    directors?: {
      currentDirectors?: Array<{
        name?: string;
        dateOfBirth?: string;
        directorType?: string;
        appointmentDate?: string;
        positions?: Array<{
          dateAppointed?: string;
          position?: string;
        }>;
        additionalData?: {
          otherDirectorships?: Array<{
            companyName?: string;
            companyNumber?: string;
            status?: string;
            appointedDate?: string;
            resignedDate?: string;
          }>;
        };
      }>;
    };
    paymentData?: {
      dbt?: number;
    };
    negativeInformation?: {
      ccjSummary?: {
        numberOfExact?: number;
        totalAmountOfExact?: number;
      };
    };
  };
}

function getRatingColor(rating?: string): string {
  if (!rating) return "text-muted-foreground";
  const val = parseInt(rating);
  if (val >= 71) return "text-rag-green";
  if (val >= 40) return "text-rag-amber";
  return "text-rag-red";
}

function getRatingBadge(rating?: string) {
  if (!rating) return null;
  const val = parseInt(rating);
  if (val >= 71) return { variant: "outline" as const, className: "border-rag-green text-rag-green", label: "Low Risk", icon: ShieldCheck };
  if (val >= 40) return { variant: "outline" as const, className: "border-rag-amber text-rag-amber", label: "Medium Risk", icon: AlertTriangle };
  return { variant: "destructive" as const, className: "", label: "High Risk", icon: ShieldAlert };
}

interface CreditSafeCardProps {
  dealerName: string;
  companiesHouseNumber?: string;
  onDataLoaded?: (data: CreditSafeEntry) => void;
}

export const CreditSafeCard = ({ dealerName, companiesHouseNumber, onDataLoaded }: CreditSafeCardProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState(dealerName);
  const [searching, setSearching] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [searchResults, setSearchResults] = useState<CreditSafeCompany[]>([]);
  const [report, setReport] = useState<CreditSafeReport | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CreditSafeCompany | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (byRegNo = false) => {
    setSearching(true);
    setSearchResults([]);
    setReport(null);
    setSelectedCompany(null);
    setHasSearched(true);

    try {
      const body: Record<string, string> = { action: "search", country: "GB" };
      if (byRegNo && companiesHouseNumber) {
        body.regNo = companiesHouseNumber;
      } else {
        body.name = searchQuery;
      }

      const { data, error } = await supabase.functions.invoke("creditsafe", { body });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const companies = data?.companies || [];
      setSearchResults(companies);

      if (companies.length === 0) {
        toast({ title: "No Results", description: "No companies found matching your search." });
      }
    } catch (e) {
      console.error("CreditSafe search error:", e);
      toast({
        title: "Search Failed",
        description: e instanceof Error ? e.message : "Failed to search CreditSafe.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleFetchReport = async (company: CreditSafeCompany) => {
    setLoadingReport(true);
    setSelectedCompany(company);

    try {
      const { data, error } = await supabase.functions.invoke("creditsafe", {
        body: { action: "report", connectId: company.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setReport(data);
    } catch (e) {
      console.error("CreditSafe report error:", e);
      toast({
        title: "Report Failed",
        description: e instanceof Error ? e.message : "Failed to fetch credit report.",
        variant: "destructive",
      });
    } finally {
      setLoadingReport(false);
    }
  };

  const creditRating = report?.report?.creditScore?.currentCreditRating;
  const prevRating = report?.report?.creditScore?.previousCreditRating;
  const summary = report?.report?.companySummary;
  const ratingBadge = getRatingBadge(creditRating?.providerValue?.value);
  const ccjs = report?.report?.negativeInformation?.ccjSummary;
  const dbt = report?.report?.paymentData?.dbt;

  const currentVal = parseInt(creditRating?.providerValue?.value || "0");
  const prevVal = parseInt(prevRating?.commonValue || "0");
  const trendDir = currentVal > prevVal ? "up" : currentVal < prevVal ? "down" : "stable";

  // Notify parent with CreditSafe data for PDF export
  useEffect(() => {
    if (report && onDataLoaded) {
      const scoreVal = creditRating?.providerValue?.value;
      const scoreNum = scoreVal ? parseInt(scoreVal) : 0;
      const riskLevel: "Low Risk" | "Medium Risk" | "High Risk" | undefined = scoreVal ? (scoreNum >= 71 ? "Low Risk" : scoreNum >= 40 ? "Medium Risk" : "High Risk") : undefined;
      onDataLoaded({
        companyName: summary?.businessName || selectedCompany?.name || dealerName,
        registrationNumber: summary?.companyRegistrationNumber,
        companyStatus: summary?.companyStatus?.status,
        creditScore: creditRating?.providerValue?.value,
        creditScoreMax: creditRating?.providerValue?.maxValue,
        creditDescription: creditRating?.commonDescription,
        creditLimit: creditRating?.creditLimit?.value,
        dbt: report.report?.paymentData?.dbt,
        ccjCount: ccjs?.numberOfExact,
        ccjTotal: ccjs?.totalAmountOfExact,
        turnover: summary?.latestTurnoverFigure?.value,
        equity: summary?.latestShareholdersEquityFigure?.value,
        riskLevel,
        previousScore: prevRating?.commonValue,
      });
    }
  }, [report]);


  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">CreditSafe Report</h3>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">Sandbox</Badge>
        </div>
        {report && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => { setReport(null); setSelectedCompany(null); }}>
            <RefreshCw className="w-3 h-3 mr-1" /> New Search
          </Button>
        )}
      </div>

      {!report ? (
        <div className="px-5 py-4 space-y-4">
          {/* Search Form */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 h-9 bg-background"
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={searching} size="sm" className="h-9">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
            {companiesHouseNumber && (
              <Button onClick={() => handleSearch(true)} disabled={searching} variant="outline" size="sm" className="h-9 text-xs">
                Search by Reg No.
              </Button>
            )}
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {searchResults.map((company) => (
                <div
                  key={company.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleFetchReport(company)}
                >
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{company.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {company.regNo && `Reg: ${company.regNo}`}
                      {company.address?.simpleValue && ` · ${company.address.simpleValue}`}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          )}

          {hasSearched && searchResults.length === 0 && !searching && (
            <p className="text-sm text-muted-foreground text-center py-4">No companies found. Try a different search term.</p>
          )}

          {loadingReport && (
            <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Fetching credit report...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 py-4 space-y-5">
          {/* Company Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-base font-semibold text-foreground">{summary?.businessName || selectedCompany?.name}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {summary?.companyRegistrationNumber && `Reg: ${summary.companyRegistrationNumber}`}
                {summary?.companyStatus?.status && ` · ${summary.companyStatus.status}`}
              </p>
            </div>
            {ratingBadge && (
              <Badge variant={ratingBadge.variant} className={`${ratingBadge.className} text-xs`}>
                <ratingBadge.icon className="w-3 h-3 mr-1" />
                {ratingBadge.label}
              </Badge>
            )}
          </div>

          {/* Phoenixing Analysis */}
          <PhoenixingAnalysis report={report} />

          {/* Credit Score Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Credit Score</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-2xl font-bold ${getRatingColor(creditRating?.providerValue?.value)}`}>
                  {creditRating?.providerValue?.value || "N/A"}
                </span>
                <span className="text-xs text-muted-foreground">/ {creditRating?.providerValue?.maxValue || "100"}</span>
                {trendDir === "up" && <TrendingUp className="w-4 h-4 text-rag-green" />}
                {trendDir === "down" && <TrendingDown className="w-4 h-4 text-rag-red" />}
                {trendDir === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Credit Limit</p>
              <span className="text-lg font-bold text-foreground">
                {creditRating?.creditLimit?.value
                  ? `£${creditRating.creditLimit.value.toLocaleString()}`
                  : "N/A"}
              </span>
            </div>

            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">DBT (Days Beyond Terms)</p>
              <span className={`text-lg font-bold ${dbt && dbt > 30 ? "text-rag-red" : dbt && dbt > 14 ? "text-rag-amber" : "text-foreground"}`}>
                {dbt !== undefined ? `${dbt} days` : "N/A"}
              </span>
            </div>

            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">CCJs</p>
              <span className={`text-lg font-bold ${ccjs?.numberOfExact && ccjs.numberOfExact > 0 ? "text-rag-red" : "text-foreground"}`}>
                {ccjs?.numberOfExact ?? "N/A"}
              </span>
              {ccjs?.totalAmountOfExact ? (
                <span className="text-xs text-muted-foreground ml-1">
                  (£{ccjs.totalAmountOfExact.toLocaleString()})
                </span>
              ) : null}
            </div>
          </div>

          {/* Rating Description */}
          {creditRating?.commonDescription && (
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Rating Description</p>
              <p className="text-sm text-foreground">{creditRating.commonDescription}</p>
            </div>
          )}

          {/* Financials */}
          {summary?.latestTurnoverFigure?.value && (
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Turnover: </span>
                <span className="font-medium text-foreground">
                  £{summary.latestTurnoverFigure.value.toLocaleString()}
                </span>
              </div>
              {summary.latestShareholdersEquityFigure?.value && (
                <div>
                  <span className="text-muted-foreground">Equity: </span>
                  <span className="font-medium text-foreground">
                    £{summary.latestShareholdersEquityFigure.value.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
