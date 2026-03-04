import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb } from "lucide-react";
import { InsightCallout } from "./InsightCallout";
import { ReportChartTooltip } from "./ReportChartTooltip";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const { monthly, byStage, rejectionReasons, byLender } = reportMetrics.onboardingMetrics;

const currentPeriod = monthly[monthly.length - 2]; // Feb 26
const prevPeriod = monthly[monthly.length - 3]; // Jan 26

const totalInitiated = monthly.reduce((s, m) => s + m.initiated, 0);
const totalApproved = monthly.reduce((s, m) => s + m.approved, 0);
const totalRejected = monthly.reduce((s, m) => s + m.rejected, 0);

// Funnel data
const funnelData = [
  { stage: "Initiated", count: 54, dropoff: null },
  { stage: "Reached Stage 2", count: 48, dropoff: "6 did not progress past Stage 1" },
  { stage: "Reached Stage 3", count: 39, dropoff: "9 did not progress past Stage 2" },
  { stage: "Approved", count: 37, dropoff: "2 rejected at final review" },
];

const STAGE_COLORS = [
  "hsl(var(--muted-foreground) / 0.5)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.65)",
  "hsl(var(--primary) / 0.85)",
];

const REJECT_COLORS = ["hsl(var(--destructive))", "hsl(var(--destructive) / 0.6)"];

const totalStageDays = byStage.filter(s => s.avgDaysInStage != null).reduce((s, st) => s + (st.avgDaysInStage ?? 0), 0);

function ChangeArrow({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value > 0) return <span className="text-outcome-pass flex items-center gap-0.5 text-xs font-semibold"><TrendingUp className="w-3 h-3" /> +{value}{suffix}</span>;
  if (value < 0) return <span className="text-destructive flex items-center gap-0.5 text-xs font-semibold"><TrendingDown className="w-3 h-3" /> {value}{suffix}</span>;
  return <span className="text-muted-foreground flex items-center gap-0.5 text-xs font-semibold"><Minus className="w-3 h-3" /> 0{suffix}</span>;
}

export function OnboardingMetricsModule() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><ClipboardCheck className="w-3.5 h-3.5" />Applications Initiated</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{currentPeriod.initiated}</span>
            <ChangeArrow value={currentPeriod.initiated - prevPeriod.initiated} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">vs {prevPeriod.initiated} in Jan 26</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><CheckCircle2 className="w-3.5 h-3.5" />Approved</div>
          <span className="text-3xl font-bold text-foreground">{currentPeriod.approved}</span>
          <p className="text-[11px] text-muted-foreground mt-1">{currentPeriod.initiated > 0 ? ((currentPeriod.approved / currentPeriod.initiated) * 100).toFixed(1) : 0}% approve rate</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><XCircle className="w-3.5 h-3.5 text-destructive" />Rejected</div>
          <span className="text-3xl font-bold text-foreground">{currentPeriod.rejected}</span>
          <p className="text-[11px] text-muted-foreground mt-1">{currentPeriod.initiated > 0 ? ((currentPeriod.rejected / currentPeriod.initiated) * 100).toFixed(1) : 0}% reject rate</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><Clock className="w-3.5 h-3.5" />Avg Time to Approval</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{currentPeriod.avgDaysToApprove ?? "—"}<span className="text-lg"> days</span></span>
          </div>
          {currentPeriod.avgDaysToApprove && prevPeriod.avgDaysToApprove && (
            <ChangeArrow value={Number((currentPeriod.avgDaysToApprove - prevPeriod.avgDaysToApprove).toFixed(1))} suffix="d" />
          )}
        </div>
      </div>

      {/* Onboarding funnel */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Onboarding Funnel</h3>
        <p className="text-xs text-muted-foreground mb-4">All {totalInitiated} applications ever initiated across the platform</p>
        <div className="space-y-3">
          {funnelData.map((step, i) => {
            const widthPct = (step.count / funnelData[0].count) * 100;
            return (
              <div key={step.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{step.stage}</span>
                  <span className="text-xs font-bold text-foreground">{step.count}</span>
                </div>
                <div className="h-7 rounded-md overflow-hidden bg-muted/30">
                  <div
                    className="h-full rounded-md transition-all"
                    style={{
                      width: `${widthPct}%`,
                      background: `linear-gradient(90deg, hsl(var(--primary) / ${0.4 + i * 0.2}), hsl(var(--primary) / ${0.5 + i * 0.15}))`,
                    }}
                  />
                </div>
                {step.dropoff && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 ml-1">↳ {step.dropoff}</p>
                )}
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground pt-1">Currently active in pipeline: <span className="font-semibold text-foreground">23</span></p>
        </div>
      </div>

      {/* Monthly volume + Avg days per stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Onboarding Volume — Monthly</h3>
          <p className="text-xs text-muted-foreground mb-4">Initiated / Approved / Rejected / In Progress</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar dataKey="initiated" name="Initiated" fill="hsl(var(--primary) / 0.35)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="Approved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" name="Rejected" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" name="In Progress" fill="hsl(var(--primary) / 0.6)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Average Days per Pipeline Stage</h3>
          <p className="text-xs text-muted-foreground mb-4">Time spent in each stage before progression</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStage.filter(s => s.avgDaysInStage != null)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" width={150} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar dataKey="avgDaysInStage" name="Avg Days" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 px-3 py-2.5 bg-primary/5 rounded-lg">
            <p className="text-xs text-foreground flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span><span className="font-semibold">Stage 2 (Policies)</span> accounts for {totalStageDays > 0 ? Math.round((5.4 / totalStageDays) * 100) : 0}% of total pipeline time (5.4 days avg). Consider proactive chasing at 3 days to prevent applications stalling.</span>
            </p>
          </div>
        </div>
      </div>

      {/* By Lender table + Rejection donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Onboarding by Lender</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-2.5 font-medium">Lender</th>
                  <th className="text-right px-2 py-2.5 font-medium">Initiated</th>
                  <th className="text-right px-2 py-2.5 font-medium">Approved</th>
                  <th className="text-right px-2 py-2.5 font-medium">Rejected</th>
                  <th className="text-right px-2 py-2.5 font-medium">Pipeline</th>
                  <th className="text-right px-4 py-2.5 font-medium">Avg Days</th>
                </tr>
              </thead>
              <tbody>
                {byLender.map((l) => {
                  const inPipeline = l.initiated - l.approved - l.rejected;
                  return (
                    <tr key={l.lenderId} className="border-b border-border last:border-0">
                      <td className="px-5 py-2.5 font-medium text-foreground">{l.name}</td>
                      <td className="px-2 py-2.5 text-right text-foreground">{l.initiated}</td>
                      <td className="px-2 py-2.5 text-right text-outcome-pass font-semibold">{l.approved}</td>
                      <td className="px-2 py-2.5 text-right text-destructive font-semibold">{l.rejected}</td>
                      <td className="px-2 py-2.5 text-right text-foreground">{inPipeline}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{l.avgDays ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rejection reasons donut */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Rejection Reasons</h3>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rejectionReasons} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="count" nameKey="reason">
                  {rejectionReasons.map((_, i) => (
                    <Cell key={i} fill={REJECT_COLORS[i % REJECT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ReportChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {rejectionReasons.map((r, i) => (
              <div key={r.reason} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: REJECT_COLORS[i % REJECT_COLORS.length] }} />
                <span className="text-muted-foreground flex-1">{r.reason}</span>
                <span className="font-semibold text-foreground">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Insight callout */}
      <InsightCallout type="positive">
        Average time to approval has reduced from 9.4 days in Dec 25 to 8.4 days in Feb 26 — process efficiency is improving. Stage 2 (Policies) remains the primary bottleneck.
      </InsightCallout>
    </div>
  );
}
