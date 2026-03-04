import {
  ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Building2, Users } from "lucide-react";
import { InsightCallout } from "./InsightCallout";
import { ReportChartTooltip } from "./ReportChartTooltip";
import reportMetrics from "@/data/tcg/reportMetrics.json";

const { lenders, dealers } = reportMetrics.platformGrowth;
const health = reportMetrics.platformHealthSnapshot;

// Dealer distribution by lender (current snapshot)
const dealersByLender = [
  { name: "Broadstone Motor Credit", count: 14, status: "active" },
  { name: "Apex Motor Finance", count: 11, status: "active" },
  { name: "Meridian Vehicle Finance", count: 8, status: "active" },
  { name: "NR Motor Finance", count: 5, status: "active" },
  { name: "Solent Asset Finance", count: 0, status: "pending" },
];

const scoreBands = [
  { band: "0–24 (Critical)", count: health.scoreDistribution["0_24"], pct: ((health.scoreDistribution["0_24"] / health.totalDealers) * 100).toFixed(1), color: "bg-red-500" },
  { band: "25–49 (Red)", count: health.scoreDistribution["25_49"], pct: ((health.scoreDistribution["25_49"] / health.totalDealers) * 100).toFixed(1), color: "bg-orange-500" },
  { band: "50–74 (Amber)", count: health.scoreDistribution["50_74"], pct: ((health.scoreDistribution["50_74"] / health.totalDealers) * 100).toFixed(1), color: "bg-yellow-500" },
  { band: "75–100 (Green)", count: health.scoreDistribution["75_100"], pct: ((health.scoreDistribution["75_100"] / health.totalDealers) * 100).toFixed(1), color: "bg-emerald-500" },
];

// Period aggregates (using full dataset for now)
const totalLendersAdded = lenders.reduce((s, l) => s + l.added, 0);
const totalLendersDeactivated = lenders.reduce((s, l) => s + l.deactivated, 0);
const totalDealersAdded = dealers.reduce((s, d) => s + d.added, 0);
const totalDealersDeactivated = dealers.reduce((s, d) => s + d.deactivated, 0);

function ChangeArrow({ value }: { value: number }) {
  if (value > 0) return <span className="text-outcome-pass flex items-center gap-0.5 text-xs font-semibold"><TrendingUp className="w-3 h-3" /> +{value}</span>;
  if (value < 0) return <span className="text-destructive flex items-center gap-0.5 text-xs font-semibold"><TrendingDown className="w-3 h-3" /> {value}</span>;
  return <span className="text-muted-foreground flex items-center gap-0.5 text-xs font-semibold"><Minus className="w-3 h-3" /> 0</span>;
}

export function PlatformGrowthModule() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><Building2 className="w-3.5 h-3.5" />Total Lenders</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{health.totalLenders}</span>
            <ChangeArrow value={totalLendersAdded - totalLendersDeactivated} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{health.activeLenders} Active · {health.pendingLenders} Pending</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><Building2 className="w-3.5 h-3.5" />Lenders Added</div>
          <span className="text-3xl font-bold text-foreground">{totalLendersAdded}</span>
          <p className="text-[11px] text-muted-foreground mt-1">{totalLendersDeactivated} deactivated</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" />Total Dealers</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{health.totalDealers}</span>
            <ChangeArrow value={totalDealersAdded - totalDealersDeactivated} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{health.activeDealers} Active · {health.deactivatedDealers} Deactivated</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" />Dealers Added</div>
          <span className="text-3xl font-bold text-foreground">{totalDealersAdded}</span>
          <p className="text-[11px] text-muted-foreground mt-1">{totalDealersDeactivated} deactivated</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lender Growth */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Lender Growth — Monthly</h3>
          <p className="text-xs text-muted-foreground mb-4">Stacked additions/deactivations with cumulative total</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lenders}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar yAxisId="left" dataKey="added" name="Added" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="deactivated" name="Deactivated" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="total" name="Cumulative Total" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dealer Growth */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Dealer Growth — Monthly</h3>
          <p className="text-xs text-muted-foreground mb-4">Stacked additions/deactivations with cumulative total</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dealers}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar yAxisId="left" dataKey="added" name="Added" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="deactivated" name="Deactivated" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="total" name="Cumulative Total" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dealer distribution by lender */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Dealer Distribution by Lender</h3>
          <p className="text-xs text-muted-foreground mb-4">Current snapshot of dealer counts per lender</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealersByLender} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={160} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip content={<ReportChartTooltip />} />
                <Bar dataKey="count" name="Dealers" radius={[0, 4, 4, 0]}>
                  {dealersByLender.map((entry, i) => (
                    <rect key={i} fill={entry.status === "pending" ? "hsl(var(--muted-foreground) / 0.3)" : "hsl(var(--primary))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score distribution table */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Score Distribution</h3>
            <p className="text-xs text-muted-foreground">Current portfolio health snapshot</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-2.5 font-medium">Score Band</th>
                  <th className="text-right px-3 py-2.5 font-medium">Count</th>
                  <th className="text-right px-3 py-2.5 font-medium">% of Total</th>
                  <th className="text-center px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {scoreBands.map((b) => (
                  <tr key={b.band} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground">{b.band}</td>
                    <td className="px-3 py-3 text-right text-foreground font-semibold">{b.count}</td>
                    <td className="px-3 py-3 text-right text-muted-foreground">{b.pct}%</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block w-3 h-3 rounded-full ${b.color}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Avg portfolio score across all active dealers: <span className="font-semibold text-foreground">{health.avgPortfolioScore} / 100</span>
            </p>
          </div>
        </div>
      </div>

      {/* Insight callout */}
      <InsightCallout type="positive">
        Dealer count grew by 36% from Q4 2025 to Q1 2026. Growth is accelerating month-on-month as new lenders onboard.
      </InsightCallout>
    </div>
  );
}
