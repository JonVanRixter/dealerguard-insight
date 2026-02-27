import { PortfolioTrendPoint } from "@/data/trendData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RagDistributionChartProps {
  data: PortfolioTrendPoint[];
}

export function RagDistributionChart({ data }: RagDistributionChartProps) {
  const chartData = data.map((d) => ({
    month: d.month,
    "80–100": d.highCount,
    "55–79": d.midCount,
    "0–54": d.lowCount,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-xs text-muted-foreground">
              {entry.name}: {entry.value} dealers
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Score Distribution Over Time</h3>
      <p className="text-xs text-muted-foreground mb-4">How the portfolio score mix has shifted month to month</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="80–100" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name="80–100" />
            <Area type="monotone" dataKey="55–79" stackId="1" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.4} name="55–79" />
            <Area type="monotone" dataKey="0–54" stackId="1" stroke="hsl(var(--border))" fill="hsl(var(--border))" fillOpacity={0.6} name="0–54" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
