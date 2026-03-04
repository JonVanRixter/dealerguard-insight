import {
  ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart,
  ReferenceLine, ReferenceArea,
} from "recharts";
import { Clock, AlertTriangle, TrendingUp, TrendingDown, Minus, CheckCircle2, Users } from "lucide-react";
import { ReportChartTooltip } from "./ReportChartTooltip";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const { monthly, byPriority, byTCGUser } = reportMetrics.slaPerformance;

const currentPeriod = monthly[monthly.length - 2]; // Feb 26
const prevPeriod = monthly[monthly.length - 3]; // Jan 26

function ChangeArrow({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value > 0) return <span className="text-outcome-pass flex items-center gap-0.5 text-xs font-semibold"><TrendingUp className="w-3 h-3" /> +{value}{suffix}</span>;
  if (value < 0) return <span className="text-destructive flex items-center gap-0.5 text-xs font-semibold"><TrendingDown className="w-3 h-3" /> {value}{suffix}</span>;
  return <span className="text-muted-foreground flex items-center gap-0.5 text-xs font-semibold"><Minus className="w-3 h-3" /> 0{suffix}</span>;
}

// Custom dot for SLA trend - amber if below 90
function SLATrendDot(props: any) {
  const { cx, cy, payload } = props;
  const below = payload.slaMetPct < 90;
  return <circle cx={cx} cy={cy} r={5} fill={below ? "hsl(var(--destructive))" : "hsl(var(--primary))"} stroke="hsl(var(--background))" strokeWidth={2} />;
}

export function SLAPerformanceModule() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><CheckCircle2 className="w-3.5 h-3.5" />SLA Met Rate</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{currentPeriod.slaMetPct}%</span>
            <ChangeArrow value={Number((currentPeriod.slaMetPct - prevPeriod.slaMetPct).toFixed(1))} suffix="%" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">vs {prevPeriod.slaMetPct}% in Jan 26</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><AlertTriangle className="w-3.5 h-3.5 text-destructive" />SLA Breaches</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-destructive">{currentPeriod.breached}</span>
            <ChangeArrow value={currentPeriod.breached - prevPeriod.breached} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">vs {prevPeriod.breached} in Jan 26</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><Clock className="w-3.5 h-3.5" />Avg Resolution Time</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{currentPeriod.avgResolutionHrs}h</span>
            <ChangeArrow value={Number((currentPeriod.avgResolutionHrs - prevPeriod.avgResolutionHrs).toFixed(1))} suffix="h" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">vs {prevPeriod.avgResolutionHrs}h in Jan 26</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" />Open Items</div>
          <span className="text-3xl font-bold text-foreground">{reportMetrics.platformHealthSnapshot.openManualReviewItems}</span>
          <p className="text-[11px] text-muted-foreground mt-1">{reportMetrics.platformHealthSnapshot.slaBreachedItems} overdue <span className="text-destructive">🔴</span></p>
        </div>
      </div>

      {/* SLA met % trend */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">SLA Performance Trend — Monthly</h3>
        <p className="text-xs text-muted-foreground mb-4">Points below 90% target are highlighted</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis domain={[60, 105]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip content={<ReportChartTooltip />} />
              <ReferenceLine y={90} stroke="hsl(var(--destructive) / 0.4)" strokeDasharray="6 4" label={{ value: "Target: 90%", position: "insideTopRight", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="slaMetPct"
                name="SLA Met %"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={<SLATrendDot />}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* By Priority — chart + table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">SLA by Priority</h3>
          <p className="text-xs text-muted-foreground mb-4">Met vs breached per priority level</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="priority" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar dataKey="metSLA" name="Met SLA" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="breached" name="Breached" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">SLA Performance by Priority</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-2.5 font-medium">Priority</th>
                  <th className="text-right px-2 py-2.5 font-medium">Window</th>
                  <th className="text-right px-2 py-2.5 font-medium">Items</th>
                  <th className="text-right px-2 py-2.5 font-medium">Met</th>
                  <th className="text-right px-2 py-2.5 font-medium">Breach</th>
                  <th className="text-right px-2 py-2.5 font-medium">Met %</th>
                  <th className="text-right px-4 py-2.5 font-medium">Avg Res.</th>
                </tr>
              </thead>
              <tbody>
                {byPriority.map((p) => {
                  const status = p.slaMetPct >= 90 ? "text-outcome-pass" : p.slaMetPct >= 80 ? "text-yellow-500" : "text-destructive";
                  const icon = p.slaMetPct >= 90 ? "✅" : p.slaMetPct >= 80 ? "🟡" : "🔴";
                  return (
                    <tr key={p.priority} className="border-b border-border last:border-0">
                      <td className="px-5 py-2.5 font-medium text-foreground">{p.priority}</td>
                      <td className="px-2 py-2.5 text-right text-muted-foreground">{p.slaWindowHrs}h</td>
                      <td className="px-2 py-2.5 text-right text-foreground">{p.totalItems}</td>
                      <td className="px-2 py-2.5 text-right text-outcome-pass font-semibold">{p.metSLA}</td>
                      <td className="px-2 py-2.5 text-right text-destructive font-semibold">{p.breached}</td>
                      <td className="px-2 py-2.5 text-right"><span className={`font-semibold ${status}`}>{p.slaMetPct}% {icon}</span></td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{p.avgResolutionHrs}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-destructive/5 rounded-b-xl">
            <p className="text-xs text-foreground flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
              <span><span className="font-semibold">Critical SLA performance (75%)</span> is below the 90% target. With 3 breaches in the period, capacity for high-priority items should be reviewed as the platform scales.</span>
            </p>
          </div>
        </div>
      </div>

      {/* By TCG User */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">SLA by Analyst</h3>
          <p className="text-xs text-muted-foreground mb-4">Workload and performance per TCG operator</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTCGUser} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar dataKey="metSLA" name="Met SLA" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="breached" name="Breached" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Analyst Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-2.5 font-medium">Analyst</th>
                  <th className="text-right px-3 py-2.5 font-medium">Handled</th>
                  <th className="text-right px-3 py-2.5 font-medium">Met</th>
                  <th className="text-right px-3 py-2.5 font-medium">Breach</th>
                  <th className="text-right px-3 py-2.5 font-medium">Met %</th>
                  <th className="text-right px-5 py-2.5 font-medium">Avg Hrs</th>
                </tr>
              </thead>
              <tbody>
                {byTCGUser.map((u) => (
                  <tr key={u.userId} className="border-b border-border last:border-0">
                    <td className="px-5 py-2.5 font-medium text-foreground">{u.name}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">{u.totalItems}</td>
                    <td className="px-3 py-2.5 text-right text-outcome-pass font-semibold">{u.metSLA}</td>
                    <td className="px-3 py-2.5 text-right text-destructive font-semibold">{u.breached}</td>
                    <td className="px-3 py-2.5 text-right font-semibold">{u.slaMetPct}%</td>
                    <td className="px-5 py-2.5 text-right text-muted-foreground">{u.avgResolutionHrs}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Avg resolution time trend */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Average Resolution Time — Monthly</h3>
        <p className="text-xs text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-outcome-pass" /> &lt;24h good</span>
          <span className="mx-2">·</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> 24–36h amber</span>
          <span className="mx-2">·</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> &gt;36h red</span>
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis domain={[0, 40]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip content={<ReportChartTooltip />} />
              {/* Reference bands */}
              <ReferenceArea y1={0} y2={24} fill="hsl(142 76% 36% / 0.06)" />
              <ReferenceArea y1={24} y2={36} fill="hsl(45 93% 47% / 0.06)" />
              <ReferenceArea y1={36} y2={40} fill="hsl(0 84% 60% / 0.06)" />
              <ReferenceLine y={24} stroke="hsl(var(--muted-foreground) / 0.3)" strokeDasharray="4 4" />
              <ReferenceLine y={36} stroke="hsl(var(--destructive) / 0.3)" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="avgResolutionHrs"
                name="Avg Resolution (hrs)"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
