import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ReportChartTooltip } from "./ReportChartTooltip";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const { monthly, byType } = reportMetrics.alertMetrics;

export function AlertMetricsModule() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Alert Volume Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Generated vs acknowledged per month</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar dataKey="generated" name="Generated" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="acknowledged" name="Acknowledged" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Type table */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Alerts by Type</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-2.5 font-medium">Type</th>
                  <th className="text-right px-3 py-2.5 font-medium">Total</th>
                  <th className="text-right px-3 py-2.5 font-medium">Ack'd</th>
                  <th className="text-right px-5 py-2.5 font-medium">Ack %</th>
                </tr>
              </thead>
              <tbody>
                {byType.map((t) => (
                  <tr key={t.type} className="border-b border-border last:border-0">
                    <td className="px-5 py-2.5 font-medium text-foreground">{t.type}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">{t.total}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">{t.acknowledged}</td>
                    <td className="px-5 py-2.5 text-right">
                      <span className={`font-semibold ${t.ackRate >= 90 ? "text-outcome-pass" : t.ackRate >= 80 ? "text-outcome-pending" : "text-destructive"}`}>
                        {t.ackRate}%
                      </span>
                    </td>
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
