import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ReportChartTooltip } from "./ReportChartTooltip";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const { monthly, byPriority, byTCGUser } = reportMetrics.slaPerformance;

export function SLAPerformanceModule() {
  return (
    <div className="space-y-6">
      {/* SLA Met % trend */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">SLA Performance Trend</h3>
        <p className="text-xs text-muted-foreground mb-4">Monthly SLA met percentage and breach count</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip content={<ReportChartTooltip />} />
              <Bar yAxisId="left" dataKey="metSLA" name="Met SLA" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="breached" name="Breached" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="slaMetPct" name="SLA Met %" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Priority */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">SLA by Priority</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-2.5 font-medium">Priority</th>
                  <th className="text-right px-3 py-2.5 font-medium">Total</th>
                  <th className="text-right px-3 py-2.5 font-medium">Met</th>
                  <th className="text-right px-3 py-2.5 font-medium">Breached</th>
                  <th className="text-right px-3 py-2.5 font-medium">SLA %</th>
                  <th className="text-right px-5 py-2.5 font-medium">Avg Hrs</th>
                </tr>
              </thead>
              <tbody>
                {byPriority.map((p) => (
                  <tr key={p.priority} className="border-b border-border last:border-0">
                    <td className="px-5 py-2.5 font-medium text-foreground">{p.priority}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">{p.totalItems}</td>
                    <td className="px-3 py-2.5 text-right text-outcome-pass font-semibold">{p.metSLA}</td>
                    <td className="px-3 py-2.5 text-right text-destructive font-semibold">{p.breached}</td>
                    <td className="px-3 py-2.5 text-right font-semibold">{p.slaMetPct}%</td>
                    <td className="px-5 py-2.5 text-right text-muted-foreground">{p.avgResolutionHrs}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By TCG User */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">SLA by Analyst</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-2.5 font-medium">Analyst</th>
                  <th className="text-right px-3 py-2.5 font-medium">Total</th>
                  <th className="text-right px-3 py-2.5 font-medium">Met</th>
                  <th className="text-right px-3 py-2.5 font-medium">Breached</th>
                  <th className="text-right px-3 py-2.5 font-medium">SLA %</th>
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
    </div>
  );
}
