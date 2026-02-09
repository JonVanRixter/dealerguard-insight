import { PortfolioTrendPoint } from "@/data/trendData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RagDistributionChartProps {
  data: PortfolioTrendPoint[];
}

export function RagDistributionChart({ data }: RagDistributionChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">RAG Distribution Over Time</h3>
      <p className="text-xs text-muted-foreground mb-4">How the portfolio health mix has shifted month to month</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="greenCount" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Green" />
            <Area type="monotone" dataKey="amberCount" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Amber" />
            <Area type="monotone" dataKey="redCount" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Red" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
