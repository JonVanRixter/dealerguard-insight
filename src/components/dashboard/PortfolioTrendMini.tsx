import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { portfolioTrend } from "@/data/trendData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-medium text-foreground mb-1">{label}</p>
        <p>Avg Score: <span className="font-semibold">{d.avgScore}%</span></p>
        <div className="flex gap-2 mt-1 text-muted-foreground">
          <span>80–100: {d.greenCount}</span>
          <span>55–79: {d.amberCount}</span>
          <span>0–54: {d.redCount}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function PortfolioTrendMini() {
  const data = useMemo(() => portfolioTrend, []);
  const scoreRange = useMemo(() => {
    const scores = data.map(d => d.avgScore);
    return { min: Math.max(0, Math.min(...scores) - 5), max: Math.min(100, Math.max(...scores) + 5) };
  }, [data]);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Portfolio Score Trend</h3>
      <p className="text-xs text-muted-foreground mb-4">12-month average compliance score</p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => v.split(" ")[0].slice(0, 3)}
            />
            <YAxis
              domain={[scoreRange.min, scoreRange.max]}
              tick={{ fontSize: 9 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="avgScore"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
