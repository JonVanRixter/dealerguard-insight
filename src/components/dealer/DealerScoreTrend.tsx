import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { dealerTrends } from "@/data/trendData";

interface DealerScoreTrendProps {
  dealerName: string;
}

export function DealerScoreTrend({ dealerName }: DealerScoreTrendProps) {
  const trend = useMemo(
    () => dealerTrends.find((t) => t.dealerName === dealerName),
    [dealerName]
  );

  if (!trend) return null;

  const change = trend.changeFromStart;
  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          12-Month Score Trend
        </h3>
        <div className="flex items-center gap-2">
          {isUp && <TrendingUp className="w-4 h-4 text-score-up" />}
          {isDown && <TrendingDown className="w-4 h-4 text-score-down" />}
          {!isUp && !isDown && <Minus className="w-4 h-4 text-score-neutral" />}
          <span className="text-sm font-semibold text-foreground">
            {isUp ? "+" : ""}
            {change}pts
          </span>
          <span className="text-sm text-muted-foreground">
            ({trend.currentScore} / 100)
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={trend.history} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="scoreTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={["dataMin - 5", "dataMax + 5"]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value}%`, "Score"]}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#scoreTrendGrad)"
            dot={(props: any) => {
              const { cx, cy, index } = props;
              if (index === 0 || index === trend.history.length - 1) {
                return (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="hsl(var(--primary))"
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  />
                );
              }
              return <circle key={index} cx={cx} cy={cy} r={0} />;
            }}
            activeDot={{ r: 5, fill: "hsl(var(--primary))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
