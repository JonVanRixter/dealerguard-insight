import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const audits = reportMetrics.auditsCompleted.monthly;
const sla = reportMetrics.slaPerformance.monthly;
const onb = reportMetrics.onboardingMetrics.monthly;
const alerts = reportMetrics.alertMetrics.monthly;
const health = reportMetrics.platformHealthSnapshot;

// Feb 26 data
const febAudits = audits[audits.length - 2];
const janAudits = audits[audits.length - 3];
const febSla = sla[sla.length - 2];
const febOnb = onb[onb.length - 2];
const febAlerts = alerts[alerts.length - 2];
const totalAlertsAck = febAlerts.acknowledged;
const ackPct = ((totalAlertsAck / febAlerts.generated) * 100).toFixed(1);

const rows = [
  {
    label: "Audits completed this month",
    value: febAudits.total,
    detail: <><TrendingUp className="w-3 h-3 text-outcome-pass inline" /> +{febAudits.total - janAudits.total} vs Jan</>,
  },
  {
    label: "SLA met rate",
    value: `${febSla.slaMetPct}%`,
    detail: <><AlertTriangle className="w-3 h-3 text-destructive inline" /> Below 90% target</>,
  },
  {
    label: "Onboarding approvals",
    value: febOnb.approved,
    detail: <span className="text-muted-foreground">({febOnb.avgDaysToApprove} day avg)</span>,
  },
  {
    label: "Alerts generated",
    value: febAlerts.generated,
    detail: <span className="text-muted-foreground">{ackPct}% acknowledged</span>,
  },
  {
    label: "Open re-check requests",
    value: health.openReCheckRequests,
    detail: <span>{health.slaBreachedItems > 0 ? <span className="text-destructive">({health.slaBreachedItems} overdue 🔴)</span> : <span className="text-muted-foreground">All on track</span>}</span>,
  },
];

export function ReportsSnapshotWidget() {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Platform Snapshot — Feb 2026</h3>
        </div>
        <button
          onClick={() => navigate("/reports")}
          className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
        >
          View full Reports & Analytics <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="px-5 py-4 space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{row.value}</span>
              <span className="text-xs">{row.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
