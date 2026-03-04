import { Building2, Users, ShieldCheck, AlertTriangle, Clock, RefreshCw, BarChart3, XCircle } from "lucide-react";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const h = reportMetrics.platformHealthSnapshot;

const kpis = [
  { label: "Active Lenders", value: h.activeLenders, sub: `${h.pendingLenders} pending`, icon: Building2 },
  { label: "Active Dealers", value: h.activeDealers, sub: `${h.deactivatedDealers} deactivated`, icon: Users },
  { label: "Avg Portfolio Score", value: `${h.avgPortfolioScore}%`, sub: null, icon: ShieldCheck },
  { label: "Open Review Items", value: h.openManualReviewItems, sub: null, icon: BarChart3 },
  { label: "Open Re-Checks", value: h.openReCheckRequests, sub: null, icon: RefreshCw },
  { label: "SLA Breached", value: h.slaBreachedItems, sub: null, icon: AlertTriangle, danger: h.slaBreachedItems > 0 },
  { label: "Checks Overdue", value: h.checksOverdue, sub: `${h.checksAmber} amber · ${h.checksRed} red`, icon: Clock, danger: h.checksOverdue > 0 },
];

export function PlatformHealthKPIs() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {kpis.map((k) => (
        <div key={k.label} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
            <k.icon className="w-3.5 h-3.5" />
            {k.label}
          </div>
          <span className={`text-2xl font-bold ${k.danger ? "text-destructive" : "text-foreground"}`}>{k.value}</span>
          {k.sub && <p className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</p>}
        </div>
      ))}
    </div>
  );
}
