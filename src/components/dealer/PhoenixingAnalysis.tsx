import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Flame, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { CreditSafeReport } from "./CreditSafeCard";

interface PhoenixFlag {
  id: string;
  label: string;
  detail: string;
  severity: "high" | "medium" | "low";
}

function analysePhoenixRisk(report: CreditSafeReport): { flags: PhoenixFlag[]; riskLevel: "high" | "medium" | "low" | "none" } {
  const flags: PhoenixFlag[] = [];
  const summary = report.report?.companySummary;
  const credit = report.report?.creditScore?.currentCreditRating;
  const ccjs = report.report?.negativeInformation?.ccjSummary;
  const dbt = report.report?.paymentData?.dbt;
  const directors = report.report?.directors?.currentDirectors;

  // 1. Young company check (incorporated within last 2 years)
  if (summary?.companyRegistrationDate) {
    const regDate = new Date(summary.companyRegistrationDate);
    const ageMonths = (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (ageMonths < 24) {
      flags.push({
        id: "young_company",
        label: "Recently Incorporated",
        detail: `Company registered ${regDate.toLocaleDateString("en-GB")} — less than 2 years old. New entities formed to continue a dissolved business are a key phoenixing indicator.`,
        severity: "medium",
      });
    }
  }

  // 2. Directors linked to dissolved/liquidated companies
  if (directors && directors.length > 0) {
    const dissolvedLinks: string[] = [];
    for (const director of directors) {
      const otherDirShips = director.additionalData?.otherDirectorships || [];
      for (const co of otherDirShips) {
        const status = (co.status || "").toLowerCase();
        if (status.includes("dissolv") || status.includes("liquidat") || status.includes("insolvency") || status.includes("administration")) {
          dissolvedLinks.push(`${director.name} — ${co.companyName} (${co.status})`);
        }
      }
    }
    if (dissolvedLinks.length > 0) {
      flags.push({
        id: "director_dissolved",
        label: "Directors Linked to Dissolved Companies",
        detail: `${dissolvedLinks.length} director link(s) to dissolved/liquidated entities found:\n${dissolvedLinks.slice(0, 5).join("\n")}${dissolvedLinks.length > 5 ? `\n... and ${dissolvedLinks.length - 5} more` : ""}`,
        severity: "high",
      });
    }
  }

  // 3. CCJ history
  if (ccjs?.numberOfExact && ccjs.numberOfExact > 0) {
    flags.push({
      id: "ccj_history",
      label: "County Court Judgments Found",
      detail: `${ccjs.numberOfExact} CCJ(s) totalling £${(ccjs.totalAmountOfExact || 0).toLocaleString()}. Outstanding judgments suggest prior debt avoidance.`,
      severity: ccjs.numberOfExact >= 3 ? "high" : "medium",
    });
  }

  // 4. Very low credit score
  const scoreVal = parseInt(credit?.providerValue?.value || "0");
  if (credit?.providerValue?.value && scoreVal > 0 && scoreVal < 30) {
    flags.push({
      id: "low_credit",
      label: "Very Low Credit Score",
      detail: `Score of ${scoreVal}/100 indicates severe financial distress, consistent with a recently phoenixed entity.`,
      severity: "high",
    });
  } else if (credit?.providerValue?.value && scoreVal >= 30 && scoreVal < 50) {
    flags.push({
      id: "weak_credit",
      label: "Weak Credit Score",
      detail: `Score of ${scoreVal}/100 is below average and warrants further investigation.`,
      severity: "medium",
    });
  }

  // 5. High DBT
  if (dbt !== undefined && dbt > 30) {
    flags.push({
      id: "high_dbt",
      label: "High Days Beyond Terms",
      detail: `${dbt} days beyond payment terms suggests ongoing cash flow issues or deliberate late payment patterns.`,
      severity: dbt > 60 ? "high" : "medium",
    });
  }

  // 6. Negative equity
  const equity = summary?.latestShareholdersEquityFigure?.value;
  if (equity !== undefined && equity < 0) {
    flags.push({
      id: "negative_equity",
      label: "Negative Shareholders' Equity",
      detail: `Equity of £${equity.toLocaleString()} means liabilities exceed assets — a hallmark of pre-insolvency trading.`,
      severity: "high",
    });
  }

  // Determine overall risk
  const highCount = flags.filter(f => f.severity === "high").length;
  const mediumCount = flags.filter(f => f.severity === "medium").length;

  let riskLevel: "high" | "medium" | "low" | "none" = "none";
  if (highCount >= 2 || (highCount >= 1 && mediumCount >= 2)) riskLevel = "high";
  else if (highCount >= 1 || mediumCount >= 2) riskLevel = "medium";
  else if (mediumCount >= 1) riskLevel = "low";

  return { flags, riskLevel };
}

const riskConfig = {
  high: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    badge: "destructive" as const,
    label: "High Phoenixing Risk",
    icon: Flame,
  },
  medium: {
    bg: "bg-outcome-pending/10",
    border: "border-outcome-pending/30",
    text: "text-outcome-pending",
    badge: "outline" as const,
    label: "Moderate Phoenixing Risk",
    icon: AlertTriangle,
  },
  low: {
    bg: "bg-muted/30",
    border: "border-border",
    text: "text-muted-foreground",
    badge: "outline" as const,
    label: "Low Phoenixing Risk",
    icon: Info,
  },
  none: {
    bg: "bg-outcome-pass/10",
    border: "border-outcome-pass/30",
    text: "text-outcome-pass",
    badge: "outline" as const,
    label: "No Phoenixing Indicators",
    icon: CheckCircle,
  },
};

const severityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-outcome-pending/10 text-outcome-pending border-outcome-pending/20",
  low: "bg-muted text-muted-foreground border-border",
};

interface PhoenixingAnalysisProps {
  report: CreditSafeReport;
}

export const PhoenixingAnalysis = ({ report }: PhoenixingAnalysisProps) => {
  const { flags, riskLevel } = useMemo(() => analysePhoenixRisk(report), [report]);
  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.text}`} />
          <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
        </div>
        <Badge variant={config.badge} className={`text-[10px] ${riskLevel !== "high" ? config.text : ""}`}>
          {flags.length} indicator{flags.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {flags.length > 0 && (
        <div className="space-y-2">
          {flags.map((flag) => (
            <div key={flag.id} className={`rounded-md border px-3 py-2 ${severityColors[flag.severity]}`}>
              <p className="text-xs font-medium">{flag.label}</p>
              <p className="text-xs mt-0.5 opacity-80 whitespace-pre-line">{flag.detail}</p>
            </div>
          ))}
        </div>
      )}

      {riskLevel === "none" && (
        <p className="text-xs text-muted-foreground">
          No indicators of phoenixing activity were detected based on company age, director history, CCJs, credit score, and payment behaviour.
        </p>
      )}
    </div>
  );
};
