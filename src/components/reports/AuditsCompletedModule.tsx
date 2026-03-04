import { useMemo } from "react";
import {
  ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Cell,
} from "recharts";
import { CheckCircle2, ClipboardCheck, RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import { InsightCallout } from "./InsightCallout";
import { ReportChartTooltip } from "./ReportChartTooltip";
import reportMetrics from "@/data/tcg/reportMetrics.json";
import { useNavigate } from "react-router-dom";

const { weekly, monthly, quarterly, bySection, byLender } = reportMetrics.auditsCompleted;

// Use Feb 26 as "selected period" for KPIs
const currentPeriod = monthly[monthly.length - 2]; // Feb 26
const prevPeriod = monthly[monthly.length - 3]; // Jan 26

const totalChecks = currentPeriod.total;
const scheduledChecks = currentPeriod.scheduled;
const reAuditChecks = currentPeriod.reAudit;
const avgPassRate = (bySection.reduce((s, sec) => s + sec.passRate, 0) / bySection.length).toFixed(1);

const worstFailSection = [...bySection].sort((a, b) => b.failRate - a.failRate)[0];

function ChangeArrow({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value > 0) return <span className="text-outcome-pass flex items-center gap-0.5 text-xs font-semibold"><TrendingUp className="w-3 h-3" /> +{value}{suffix}</span>;
  if (value < 0) return <span className="text-destructive flex items-center gap-0.5 text-xs font-semibold"><TrendingDown className="w-3 h-3" /> {value}{suffix}</span>;
  return <span className="text-muted-foreground flex items-center gap-0.5 text-xs font-semibold"><Minus className="w-3 h-3" /> 0{suffix}</span>;
}

export function AuditsCompletedModule() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><ClipboardCheck className="w-3.5 h-3.5" />Checks Completed</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{totalChecks}</span>
            <ChangeArrow value={totalChecks - prevPeriod.total} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">vs {prevPeriod.total} in Jan 26</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><CheckCircle2 className="w-3.5 h-3.5" />Scheduled Checks</div>
          <span className="text-3xl font-bold text-foreground">{scheduledChecks}</span>
          <p className="text-[11px] text-muted-foreground mt-1">{Math.round((scheduledChecks / totalChecks) * 100)}% of total</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><RefreshCw className="w-3.5 h-3.5" />Re-Audit Checks</div>
          <span className="text-3xl font-bold text-foreground">{reAuditChecks}</span>
          <p className="text-[11px] text-muted-foreground mt-1">{Math.round((reAuditChecks / totalChecks) * 100)}% of total</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><TrendingUp className="w-3.5 h-3.5" />Avg Pass Rate</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{avgPassRate}%</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Across all 9 audit sections</p>
        </div>
      </div>

      {/* Checks completed over time — stacked bar */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Checks Completed — by Type</h3>
        <p className="text-xs text-muted-foreground mb-4">Monthly breakdown: Scheduled / Re-Audit / Fail Chase</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip content={<ReportChartTooltip />} />
              <Bar dataKey="scheduled" name="Scheduled" stackId="a" fill="hsl(var(--primary))" />
              <Bar dataKey="reAudit" name="Re-Audit" stackId="a" fill="hsl(var(--primary) / 0.5)" />
              <Bar dataKey="failChase" name="Fail Chase" stackId="a" fill="hsl(var(--destructive) / 0.7)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pass / Fail / Refer by section — 100% stacked horizontal */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Pass / Fail / Refer by Audit Section</h3>
        <p className="text-xs text-muted-foreground mb-4">100% stacked breakdown for each compliance section</p>
        <div className="space-y-3">
          {bySection.map((sec) => {
            const isWorst = sec.sectionId === worstFailSection.sectionId;
            return (
              <div key={sec.sectionId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{sec.name}</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    {isWorst && (
                      <span className="text-destructive font-semibold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Highest fail rate
                      </span>
                    )}
                    <span className="text-outcome-pass font-medium">{sec.passRate}%</span>
                    <span className="text-destructive font-medium">{sec.failRate}%</span>
                    <span className="text-muted-foreground">{sec.referRate}%</span>
                  </div>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden bg-muted/30">
                  <div className="bg-outcome-pass/80 transition-all" style={{ width: `${sec.passRate}%` }} />
                  <div className="bg-destructive/70 transition-all" style={{ width: `${sec.failRate}%` }} />
                  <div className="bg-muted-foreground/40 transition-all" style={{ width: `${sec.referRate}%` }} />
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-outcome-pass/80" /> Pass</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive/70" /> Fail</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" /> Refer</span>
          </div>
        </div>
      </div>

      {/* By Lender — bar chart + table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Checks by Lender</h3>
          <p className="text-xs text-muted-foreground mb-4">Volume with avg score overlay</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={byLender.filter(l => l.checksCompleted > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar yAxisId="left" dataKey="checksCompleted" name="Checks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" name="Avg Score" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Lender Audit Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-2.5 font-medium">Lender</th>
                  <th className="text-right px-3 py-2.5 font-medium">Checks</th>
                  <th className="text-right px-3 py-2.5 font-medium">Avg Score</th>
                  <th className="text-right px-5 py-2.5 font-medium">Pass %</th>
                </tr>
              </thead>
              <tbody>
                {byLender.map((l) => (
                  <tr key={l.lenderId} className="border-b border-border last:border-0">
                    <td className="px-5 py-2.5 font-medium text-foreground">{l.name}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">{l.checksCompleted}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">{l.avgScore ?? "—"}</td>
                    <td className="px-5 py-2.5 text-right">
                      <span className={`font-semibold ${l.passRate && l.passRate >= 85 ? "text-outcome-pass" : l.passRate ? "text-outcome-pending" : "text-muted-foreground"}`}>
                        {l.passRate != null ? `${l.passRate}%` : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Check cadence health snapshot */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Check Cadence Status</h3>
        <p className="text-xs text-muted-foreground mb-4">All dealers, all lenders — platform-wide cadence summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-outcome-pass" /> On schedule (&gt;60 days)
            </div>
            <span className="text-2xl font-bold text-foreground">1,140</span>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Calendar className="w-3.5 h-3.5 text-yellow-500" /> Due soon (&lt;30 days)
            </div>
            <span className="text-2xl font-bold text-foreground">48</span>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Due urgently (&lt;10 days)
            </div>
            <span className="text-2xl font-bold text-destructive">12</span>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Overdue
            </div>
            <span className="text-2xl font-bold text-destructive">4</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Total controls tracked: <span className="font-semibold text-foreground">1,204</span> · Last computed: 04 Mar 2026</span>
          <button
            onClick={() => navigate("/schedule-health")}
            className="text-primary hover:underline flex items-center gap-1 font-medium"
          >
            View full check schedule <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Insight callout */}
      <InsightCallout type="warning">
        Consumer Duty and Communications & Complaints have the highest fail rates (18% and 19%). These sections align with FCA Consumer Duty obligations — recommend monitoring closely.
      </InsightCallout>
    </div>
  );
}
