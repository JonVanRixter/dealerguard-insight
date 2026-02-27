import { useState } from "react";
import { DealerTrend } from "@/data/trendData";
import { dealers } from "@/data/dealers";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DealerTrendChartProps {
  trends: DealerTrend[];
}

export function DealerTrendChart({ trends }: DealerTrendChartProps) {
  const [selected, setSelected] = useState<string[]>([
    trends[0]?.dealerName || "",
  ]);

  const COLORS = [
    "hsl(var(--primary))",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  const handleAdd = (name: string) => {
    if (selected.length < 5 && !selected.includes(name)) {
      setSelected([...selected, name]);
    } else if (selected.includes(name)) {
      // deselect
      setSelected(selected.filter((s) => s !== name));
    }
  };

  // Build unified chart data
  const chartData = trends[0]?.history.map((_, idx) => {
    const point: Record<string, any> = { month: trends[0].history[idx].month };
    selected.forEach((name) => {
      const dt = trends.find((t) => t.dealerName === name);
      if (dt) point[name] = dt.history[idx].score;
    });
    return point;
  }) || [];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Individual Dealer Trends</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Select up to 5 dealers to overlay</p>
        </div>
        <Select onValueChange={handleAdd}>
          <SelectTrigger className="w-full sm:w-56 h-9 bg-background">
            <SelectValue placeholder="Add a dealer…" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {dealers.map((d) => (
              <SelectItem key={d.name} value={d.name} disabled={selected.length >= 5 && !selected.includes(d.name)}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  {d.name}
                  {selected.includes(d.name) && <span className="text-xs text-muted-foreground ml-1">✓</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map((name, i) => (
            <button
              key={name}
              onClick={() => setSelected(selected.filter((s) => s !== name))}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              {name.split(" ").slice(0, 2).join(" ")}
              <span className="text-muted-foreground ml-0.5">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            {selected.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 2.5 }}
                activeDot={{ r: 4 }}
                name={name.split(" ").slice(0, 2).join(" ")}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
