import { DealerBenchmarkData } from "@/pages/Comparison";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ComparisonBarChartProps {
  data: DealerBenchmarkData;
}

export function ComparisonBarChart({ data }: ComparisonBarChartProps) {
  const dealerLabel = data.dealerName.split(" ").slice(0, 2).join(" ");
  const comparisonLabel = data.mode === "dealer" ? data.comparisonName.split(" ").slice(0, 2).join(" ") : "Portfolio Avg";

  const chartData = data.sectionBenchmarks.map((section) => ({
    name: section.shortName,
    [dealerLabel]: section.dealerPassRate,
    [comparisonLabel]: section.comparisonPassRate,
    difference: section.difference,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const diff = payload[0]?.payload?.difference || 0;
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
          <p
            className={`text-xs font-medium mt-1 ${
              diff > 0 ? "text-score-up" : diff < 0 ? "text-score-down" : "text-muted-foreground"
            }`}
          >
            Difference: {diff > 0 ? "+" : ""}{diff}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Pass Rate Comparison by Section
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <Bar
              dataKey={dealerLabel}
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey={comparisonLabel}
              fill="hsl(var(--muted-foreground))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
