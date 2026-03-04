import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportChartTooltip } from "./ReportChartTooltip";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const { weekly, monthly, quarterly, bySection, byLender } = reportMetrics.auditsCompleted;

export function AuditsCompletedModule() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "quarterly">("monthly");

  const periodData = period === "weekly" ? weekly : period === "monthly" ? monthly : quarterly;
  const labelKey = period === "weekly" ? "label" : "label";

  return (
    <div className="space-y-6">
      {/* Volume chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Audits Completed</h3>
            <p className="text-xs text-muted-foreground">Breakdown by scheduled, re-audit, and fail-chase</p>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={periodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip content={<ReportChartTooltip />} />
              <Bar dataKey="scheduled" name="Scheduled" stackId="a" fill="hsl(var(--primary))" />
              <Bar dataKey="reAudit" name="Re-Audit" stackId="a" fill="hsl(var(--primary) / 0.6)" />
              <Bar dataKey="failChase" name="Fail Chase" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Section radar */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Pass Rate by Audit Section</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={bySection}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Pass %" dataKey="passRate" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Lender table */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Audits by Lender</h3>
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
    </div>
  );
}
