import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ReportChartTooltip } from "./ReportChartTooltip";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const { monthly, outcomeBreakdown } = reportMetrics.reCheckMetrics;

const OUTCOME_COLORS = ["hsl(var(--muted-foreground))", "hsl(var(--primary))", "hsl(var(--destructive))"];

export function ReCheckMetricsModule() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly trend */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Re-Check Requests</h3>
        <p className="text-xs text-muted-foreground mb-4">Monthly submitted, completed, and fail-chases</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip content={<ReportChartTooltip />} />
              <Bar dataKey="submitted" name="Submitted" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failChases" name="Fail Chases" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Outcome breakdown */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Re-Check Outcomes</h3>
        <div className="h-64 flex items-center">
          <ResponsiveContainer width="55%" height="100%">
            <PieChart>
              <Pie data={outcomeBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="count" nameKey="outcome">
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
      </div>
    </div>
  );
}
