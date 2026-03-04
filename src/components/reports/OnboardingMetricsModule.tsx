import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ReportChartTooltip } from "./ReportChartTooltip";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const { monthly, byStage, rejectionReasons, byLender } = reportMetrics.onboardingMetrics;

const STAGE_COLORS = [
  "hsl(var(--muted-foreground))",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.65)",
  "hsl(var(--primary) / 0.85)",
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
];

export function OnboardingMetricsModule() {
  return (
    <div className="space-y-6">
      {/* Monthly trend */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Onboarding Volume</h3>
        <p className="text-xs text-muted-foreground mb-4">Monthly applications initiated vs approved vs rejected</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip content={<ReportChartTooltip />} />
              <Bar dataKey="initiated" name="Initiated" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approved" name="Approved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by stage donut */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Current Pipeline by Stage</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={byStage} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="count">
                  {byStage.map((_, i) => (
                    <Cell key={i} fill={STAGE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<ReportChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 pl-2">
              {byStage.map((s, i) => (
                <div key={s.stage} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STAGE_COLORS[i] }} />
                  <span className="text-muted-foreground">{s.stage}</span>
                  <span className="font-semibold text-foreground ml-auto">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Lender table */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Onboarding by Lender</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-2.5 font-medium">Lender</th>
                  <th className="text-right px-3 py-2.5 font-medium">Initiated</th>
                  <th className="text-right px-3 py-2.5 font-medium">Approved</th>
                  <th className="text-right px-3 py-2.5 font-medium">Rejected</th>
                  <th className="text-right px-5 py-2.5 font-medium">Avg Days</th>
                </tr>
              </thead>
              <tbody>
                {byLender.map((l) => (
                  <tr key={l.lenderId} className="border-b border-border last:border-0">
                    <td className="px-5 py-2.5 font-medium text-foreground">{l.name}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">{l.initiated}</td>
                    <td className="px-3 py-2.5 text-right text-outcome-pass font-semibold">{l.approved}</td>
                    <td className="px-3 py-2.5 text-right text-destructive font-semibold">{l.rejected}</td>
                    <td className="px-5 py-2.5 text-right text-muted-foreground">{l.avgDays ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rejectionReasons.length > 0 && (
            <div className="px-5 py-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Rejection Reasons</p>
              {rejectionReasons.map((r) => (
                <p key={r.reason} className="text-xs text-foreground">• {r.reason} ({r.count})</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
