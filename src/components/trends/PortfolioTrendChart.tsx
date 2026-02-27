import { PortfolioTrendPoint } from "@/data/trendData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PortfolioTrendChartProps {
  data: PortfolioTrendPoint[];
}

export function PortfolioTrendChart({ data }: PortfolioTrendChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const point = payload[0]?.payload as PortfolioTrendPoint;
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <p className="text-xs text-primary">Avg Score: {point.avgScore}%</p>
          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
            <span>80–100: {point.greenCount}</span>
            <span>55–79: {point.amberCount}</span>
            <span>0–54: {point.redCount}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Portfolio Average Score</h3>
      <p className="text-xs text-muted-foreground mb-4">12-month compliance score trend across all dealers</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="avgScore"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 5 }}
              name="Avg Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
