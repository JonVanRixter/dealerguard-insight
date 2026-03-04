import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportChartTooltip } from "./ReportChartTooltip";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const { lenders, dealers } = reportMetrics.platformGrowth;

export function PlatformGrowthModule() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Platform Growth</h3>
      <p className="text-xs text-muted-foreground mb-4">Cumulative lender and dealer counts over time</p>
      <Tabs defaultValue="dealers">
        <TabsList className="mb-4">
          <TabsTrigger value="dealers">Dealers</TabsTrigger>
          <TabsTrigger value="lenders">Lenders</TabsTrigger>
        </TabsList>
        <TabsContent value="dealers">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealers}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar dataKey="total" name="Total Dealers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="added" name="Added" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        <TabsContent value="lenders">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lenders}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Line type="monotone" dataKey="total" name="Total Lenders" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
