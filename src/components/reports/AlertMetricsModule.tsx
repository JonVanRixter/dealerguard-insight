import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Line, ReferenceLine, ComposedChart,
} from "recharts";
import { Bell, CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReportChartTooltip } from "./ReportChartTooltip";
import { InsightCallout } from "./InsightCallout";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const { monthly, byType } = reportMetrics.alertMetrics;

const currentPeriod = monthly[monthly.length - 2]; // Feb 26
const prevPeriod = monthly[monthly.length - 3]; // Jan 26

const totalGenerated = monthly.reduce((s, m) => s + m.generated, 0);
const totalAcknowledged = monthly.reduce((s, m) => s + m.acknowledged, 0);
const overallAckRate = ((totalAcknowledged / totalGenerated) * 100).toFixed(1);

const sortedByType = [...byType].sort((a, b) => b.total - a.total);

function ChangeArrow({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value > 0) return <span className="text-outcome-pass flex items-center gap-0.5 text-xs font-semibold"><TrendingUp className="w-3 h-3" /> +{value}{suffix}</span>;
  if (value < 0) return <span className="text-destructive flex items-center gap-0.5 text-xs font-semibold"><TrendingDown className="w-3 h-3" /> {value}{suffix}</span>;
  return <span className="text-muted-foreground flex items-center gap-0.5 text-xs font-semibold"><Minus className="w-3 h-3" /> 0{suffix}</span>;
}

export function AlertMetricsModule() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><Bell className="w-3.5 h-3.5" />Alerts Generated</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{currentPeriod.generated}</span>
            <ChangeArrow value={currentPeriod.generated - prevPeriod.generated} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">vs {prevPeriod.generated} in Jan 26</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><CheckCircle2 className="w-3.5 h-3.5" />Acknowledged</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{currentPeriod.acknowledged}</span>
            <ChangeArrow value={currentPeriod.acknowledged - prevPeriod.acknowledged} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{((currentPeriod.acknowledged / currentPeriod.generated) * 100).toFixed(1)}% ack rate</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><AlertTriangle className="w-3.5 h-3.5" />Unacknowledged</div>
          <span className="text-3xl font-bold text-foreground">{currentPeriod.generated - currentPeriod.acknowledged}</span>
          <p className="text-[11px] text-muted-foreground mt-1">Pending response</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><Clock className="w-3.5 h-3.5" />Avg Time to Ack</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{currentPeriod.avgHrsToAck}<span className="text-lg">h</span></span>
            <ChangeArrow value={Number((currentPeriod.avgHrsToAck - prevPeriod.avgHrsToAck).toFixed(1))} suffix="h" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">vs {prevPeriod.avgHrsToAck}h in Jan 26</p>
        </div>
      </div>

      {/* Alert volume area chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Alert Volume Trend — Monthly</h3>
        <p className="text-xs text-muted-foreground mb-4">Generated vs acknowledged — shaded gap represents unacknowledged alerts</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip content={<ReportChartTooltip />} />
              <Area type="monotone" dataKey="generated" name="Generated" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              <Area type="monotone" dataKey="acknowledged" name="Acknowledged" stroke="hsl(var(--primary) / 0.6)" fill="hsl(var(--primary) / 0.35)" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary) / 0.6)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert type horizontal bar + table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Alerts by Type</h3>
          <p className="text-xs text-muted-foreground mb-4">Sorted by volume — 6 alert categories</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis dataKey="type" type="category" width={140} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Alert Acknowledgement by Type</h3>
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
                {sortedByType.map((t) => {
                  const isFailChase = t.type === "Fail Chase Triggered";
                  return (
                    <tr key={t.type} className={`border-b border-border last:border-0 ${isFailChase ? "bg-destructive/5" : ""}`}>
                      <td className="px-5 py-2.5 font-medium text-foreground flex items-center gap-1.5">
                        {isFailChase && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                        {t.type}
                      </td>
                      <td className="px-3 py-2.5 text-right text-foreground">{t.total}</td>
                      <td className="px-3 py-2.5 text-right text-foreground">{t.acknowledged}</td>
                      <td className="px-5 py-2.5 text-right">
                        <span className={`font-semibold ${t.ackRate >= 90 ? "text-outcome-pass" : t.ackRate >= 80 ? "text-outcome-pending" : "text-destructive"}`}>
                          {t.ackRate}%
                          {isFailChase && " ⚠️"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Avg time to acknowledge trend */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Average Time to Acknowledge — Monthly</h3>
        <p className="text-xs text-muted-foreground mb-4">Target: within 24 hours</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis domain={[0, 30]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip content={<ReportChartTooltip />} />
              <ReferenceLine y={24} stroke="hsl(var(--destructive) / 0.4)" strokeDasharray="6 4" label={{ value: "24h target", position: "insideTopRight", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <Bar dataKey="avgHrsToAck" name="Avg hrs to ack" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight callout */}
      <InsightCallout type="warning">
        Fail Chase Triggered alerts have the lowest acknowledgement rate across all alert types (78.6%). These are the highest-risk category. Consider escalation workflows.
      </InsightCallout>
    </div>
  );
}
