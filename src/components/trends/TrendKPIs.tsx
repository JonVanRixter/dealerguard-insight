import { portfolioTrend } from "@/data/trendData";
import { TrendingUp, TrendingDown, Minus, Activity, ArrowUp, ArrowDown } from "lucide-react";

export function TrendKPIs() {
  const first = portfolioTrend[0];
  const last = portfolioTrend[portfolioTrend.length - 1];
  const scoreChange = last.avgScore - first.avgScore;
  const highScoreChange = last.highCount - first.highCount;
  const lowScoreChange = last.lowCount - first.lowCount;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <Activity className="w-4 h-4" />
          Current Avg
        </div>
        <span className="text-3xl font-bold text-foreground">{last.avgScore}%</span>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          {scoreChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          12-Month Change
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground">
            {scoreChange > 0 ? "+" : ""}{scoreChange}%
          </span>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <ArrowUp className="w-4 h-4" />
          High Scorers Δ
        </div>
        <span className="text-3xl font-bold text-foreground">
          {highScoreChange > 0 ? "+" : ""}{highScoreChange}
        </span>
        <span className="text-lg text-muted-foreground ml-1">dealers</span>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <ArrowDown className="w-4 h-4" />
          Low Scorers Δ
        </div>
        <span className="text-3xl font-bold text-foreground">
          {lowScoreChange > 0 ? "+" : ""}{lowScoreChange}
        </span>
        <span className="text-lg text-muted-foreground ml-1">dealers</span>
      </div>
    </div>
  );
}
