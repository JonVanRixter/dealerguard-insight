import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { RefreshCw, AlertTriangle, CheckCircle2, Clock, TrendingUp, TrendingDown, Minus, Lightbulb, ArrowRight } from "lucide-react";
import { ReportChartTooltip } from "./ReportChartTooltip";
import reportMetrics from "@/data/tcg/reportMetrics.json";
import { useNavigate } from "react-router-dom";

const { monthly, outcomeBreakdown } = reportMetrics.reCheckMetrics;

const currentPeriod = monthly[monthly.length - 2]; // Feb 26
const prevPeriod = monthly[monthly.length - 3]; // Jan 26

const OUTCOME_COLORS = ["hsl(var(--primary))", "hsl(var(--primary) / 0.5)", "hsl(var(--destructive))"];

const openRequests = [
  { ref: "RR-001", dealer: "Blackmore", lender: "Apex", control: "Consumer support", type: "Re-Check", typeBadge: "🔄", priority: "Normal", status: "Submitted", statusColor: "text-yellow-500", sla: "14h left", slaDanger: false },
  { ref: "RR-002", dealer: "Summit Cars", lender: "Apex", control: "Legal entity status", type: "Fail Chase", typeBadge: "⚠️", priority: "High", status: "In Progress", statusColor: "text-primary", sla: "2h left", slaDanger: false },
  { ref: "RR-004", dealer: "Horizon Motors", lender: "Apex", control: "FCA authorisation", type: "Fail Chase", typeBadge: "⚠️", priority: "Critical", status: "Submitted", statusColor: "text-yellow-500", sla: "BREACHED", slaDanger: true },
];

function ChangeArrow({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value > 0) return <span className="text-outcome-pass flex items-center gap-0.5 text-xs font-semibold"><TrendingUp className="w-3 h-3" /> +{value}{suffix}</span>;
  if (value < 0) return <span className="text-destructive flex items-center gap-0.5 text-xs font-semibold"><TrendingDown className="w-3 h-3" /> {value}{suffix}</span>;
  return <span className="text-muted-foreground flex items-center gap-0.5 text-xs font-semibold"><Minus className="w-3 h-3" /> 0{suffix}</span>;
}

export function ReCheckMetricsModule() {
  const navigate = useNavigate();
  const resolutionRate = currentPeriod.completed > 0 ? ((currentPeriod.completed / currentPeriod.submitted) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><RefreshCw className="w-3.5 h-3.5" />Requests Submitted</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{currentPeriod.submitted}</span>
            <ChangeArrow value={currentPeriod.submitted - prevPeriod.submitted} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">vs {prevPeriod.submitted} in Jan 26</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><AlertTriangle className="w-3.5 h-3.5" />Fail Chases</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{currentPeriod.failChases}</span>
            <ChangeArrow value={currentPeriod.failChases - prevPeriod.failChases} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Auto-triggered · vs {prevPeriod.failChases} in Jan 26</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><CheckCircle2 className="w-3.5 h-3.5" />Completed</div>
          <span className="text-3xl font-bold text-foreground">{currentPeriod.completed}</span>
          <p className="text-[11px] text-muted-foreground mt-1">{resolutionRate}% resolution rate</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><Clock className="w-3.5 h-3.5" />Avg Resolution Time</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{currentPeriod.avgResolutionHrs}<span className="text-lg">h</span></span>
            <ChangeArrow value={currentPeriod.avgResolutionHrs - prevPeriod.avgResolutionHrs} suffix="h" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">vs {prevPeriod.avgResolutionHrs}h in Jan 26</p>
        </div>
      </div>

      {/* Volume chart + Outcome donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Re-Check & Fail Chase Volume — Monthly</h3>
          <p className="text-xs text-muted-foreground mb-4">Submitted / Completed / Fail Chases per month</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar dataKey="submitted" name="Submitted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failChases" name="Fail Chases" fill="hsl(var(--destructive) / 0.7)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Outcome Breakdown</h3>
          <div className="h-48 flex items-center">
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={outcomeBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="count" nameKey="outcome">
                  {outcomeBreakdown.map((_, i) => (
                    <Cell key={i} fill={OUTCOME_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<ReportChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2.5 pl-2">
              {outcomeBreakdown.map((o, i) => (
                <div key={o.outcome} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: OUTCOME_COLORS[i] }} />
                  <span className="text-muted-foreground">{o.outcome}</span>
                  <span className="font-semibold text-foreground ml-auto">{o.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 px-3 py-2.5 bg-primary/5 rounded-lg">
            <p className="text-xs text-foreground flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>87.5% of re-check completions either confirmed the existing result or improved it. Only 1 re-check resulted in a score reduction — suggesting lenders are raising re-checks thoughtfully rather than speculatively.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Open requests table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Open Re-Check / Fail Chase Requests</h3>
          <p className="text-xs text-muted-foreground">Live view — currently open items across all lenders</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-5 py-2.5 font-medium">Ref</th>
                <th className="text-left px-2 py-2.5 font-medium">Dealer</th>
                <th className="text-left px-2 py-2.5 font-medium">Lender</th>
                <th className="text-left px-2 py-2.5 font-medium">Control</th>
                <th className="text-left px-2 py-2.5 font-medium">Type</th>
                <th className="text-left px-2 py-2.5 font-medium">Priority</th>
                <th className="text-left px-2 py-2.5 font-medium">Status</th>
                <th className="text-right px-5 py-2.5 font-medium">SLA</th>
              </tr>
            </thead>
            <tbody>
              {openRequests.map((r) => (
                <tr key={r.ref} className="border-b border-border last:border-0">
                  <td className="px-5 py-2.5 font-mono text-xs text-foreground">{r.ref}</td>
                  <td className="px-2 py-2.5 font-medium text-foreground">{r.dealer}</td>
                  <td className="px-2 py-2.5 text-muted-foreground">{r.lender}</td>
                  <td className="px-2 py-2.5 text-foreground">{r.control}</td>
                  <td className="px-2 py-2.5">
                    <span className="text-xs">{r.typeBadge} {r.type}</span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className={`text-xs font-medium ${r.priority === "Critical" ? "text-destructive" : r.priority === "High" ? "text-foreground" : "text-muted-foreground"}`}>
                      {r.priority === "Critical" && "🔴 "}{r.priority}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className={`text-xs font-medium ${r.statusColor}`}>
                      {r.status === "Submitted" ? "🟡" : "🔵"} {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <span className={`text-xs font-semibold ${r.slaDanger ? "text-destructive" : "text-muted-foreground"}`}>
                      {r.slaDanger ? "🔴 " : ""}{r.sla}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end">
          <button
            onClick={() => navigate("/tcg/review-queue")}
            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
          >
            Go to Manual Review Queue <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
