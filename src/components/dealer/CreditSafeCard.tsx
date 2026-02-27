import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Flame,
} from "lucide-react";
import { PhoenixingAnalysis } from "./PhoenixingAnalysis";
import type { CreditSafeEntry } from "@/utils/pdfExport";

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
  if (val >= 71) return "text-outcome-pass";
  if (val >= 40) return "text-outcome-pending";
  return "text-outcome-fail";
}

function getRatingBadge(rating?: string) {
  if (!rating) return null;
  const val = parseInt(rating);
  if (val >= 71) return { variant: "outline" as const, className: "border-outcome-pass text-outcome-pass", label: "Low Risk", icon: ShieldCheck };
  if (val >= 40) return { variant: "outline" as const, className: "border-outcome-pending text-outcome-pending", label: "Medium Risk", icon: AlertTriangle };
  return { variant: "destructive" as const, className: "", label: "High Risk", icon: ShieldAlert };
}

// Generate deterministic mock CreditSafe data based on dealer name
function generateMockReport(dealerName: string, companiesHouseNumber?: string): CreditSafeReport {
  const hash = dealerName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const score = 40 + (hash % 55); // 40-94
  const prevScore = score + ((hash % 10) - 5);
  const dbt = hash % 25;
  const ccjCount = hash % 7 === 0 ? 1 : 0;
  const turnover = 500000 + (hash * 12345) % 9500000;

  return {
    report: {
      companySummary: {
        businessName: dealerName,
        companyRegistrationNumber: companiesHouseNumber || String(8000000 + (hash % 999999)),
        companyStatus: { status: "Active" },
        latestTurnoverFigure: { value: turnover, currency: "GBP" },
        latestShareholdersEquityFigure: { value: Math.round(turnover * 0.3) },
        companyRegistrationDate: `${2005 + (hash % 15)}-${String(1 + (hash % 12)).padStart(2, "0")}-01`,
        mainActivity: { code: "45111", description: "Sale of new cars and light motor vehicles" },
      },
      creditScore: {
        currentCreditRating: {
          commonValue: String(score),
          commonDescription: score >= 71 ? "Very Low Risk" : score >= 40 ? "Moderate Risk" : "High Risk",
          creditLimit: { value: Math.round(score * 1500), currency: "GBP" },
          providerValue: { value: String(score), maxValue: "100" },
        },
        previousCreditRating: {
          commonValue: String(prevScore),
          commonDescription: prevScore >= 71 ? "Very Low Risk" : prevScore >= 40 ? "Moderate Risk" : "High Risk",
        },
      },
      paymentData: { dbt },
      negativeInformation: {
        ccjSummary: {
          numberOfExact: ccjCount,
          totalAmountOfExact: ccjCount > 0 ? 2500 + (hash % 5000) : 0,
        },
      },
      directors: {
        currentDirectors: [
          {
            name: "Director A",
            directorType: "Director",
            appointmentDate: "2015-06-01",
            additionalData: { otherDirectorships: [] },
          },
        ],
      },
    },
  };
}

interface CreditSafeCardProps {
  dealerName: string;
  companiesHouseNumber?: string;
  onDataLoaded?: (data: CreditSafeEntry) => void;
}

export const CreditSafeCard = ({ dealerName, companiesHouseNumber, onDataLoaded }: CreditSafeCardProps) => {
  const notified = useRef(false);
  const report = generateMockReport(dealerName, companiesHouseNumber);

  const creditRating = report.report?.creditScore?.currentCreditRating;
  const prevRating = report.report?.creditScore?.previousCreditRating;
  const summary = report.report?.companySummary;
  const ratingBadge = getRatingBadge(creditRating?.providerValue?.value);
  const ccjs = report.report?.negativeInformation?.ccjSummary;
  const dbt = report.report?.paymentData?.dbt;

  const currentVal = parseInt(creditRating?.providerValue?.value || "0");
  const prevVal = parseInt(prevRating?.commonValue || "0");
  const trendDir = currentVal > prevVal ? "up" : currentVal < prevVal ? "down" : "stable";

  useEffect(() => {
    if (!notified.current && onDataLoaded) {
      notified.current = true;
      const scoreVal = creditRating?.providerValue?.value;
      const scoreNum = scoreVal ? parseInt(scoreVal) : 0;
      const riskLevel: "Low Risk" | "Medium Risk" | "High Risk" | undefined = scoreVal
        ? scoreNum >= 71 ? "Low Risk" : scoreNum >= 40 ? "Medium Risk" : "High Risk"
        : undefined;
      onDataLoaded({
        companyName: summary?.businessName || dealerName,
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
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">CreditSafe Report</h3>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-muted-foreground">SIMULATED DATA</Badge>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Company Header */}
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-base font-semibold text-foreground">{summary?.businessName}</h4>
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
              {trendDir === "up" && <TrendingUp className="w-4 h-4 text-score-up" />}
              {trendDir === "down" && <TrendingDown className="w-4 h-4 text-score-down" />}
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
            <span className={`text-lg font-bold ${dbt && dbt > 30 ? "text-outcome-fail" : dbt && dbt > 14 ? "text-outcome-pending" : "text-foreground"}`}>
              {dbt !== undefined ? `${dbt} days` : "N/A"}
            </span>
          </div>

          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">CCJs</p>
            <span className={`text-lg font-bold ${ccjs?.numberOfExact && ccjs.numberOfExact > 0 ? "text-outcome-fail" : "text-foreground"}`}>
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
    </div>
  );
};
