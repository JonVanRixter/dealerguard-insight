import { Info, ShieldAlert, Award, TrendingUp, TrendingDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SentimentGauge } from "./SentimentGauge";
import type { SentimentCategory } from "@/data/auditFramework";

interface CustomerSentimentCardProps {
  score: number;
  trend: number;
  periodDays?: number;
  categories?: SentimentCategory[];
  oversightThreshold?: number;
  rewardThreshold?: number;
}

function getScoreColor(score: number) {
  if (score >= 6.7) return "text-[hsl(var(--rag-green-text))]";
  if (score >= 3.4) return "text-[hsl(var(--rag-amber-text))]";
  return "text-[hsl(var(--rag-red-text))]";
}

function getScoreBg(score: number) {
  if (score >= 6.7) return "bg-[hsl(var(--rag-green-bg))]";
  if (score >= 3.4) return "bg-[hsl(var(--rag-amber-bg))]";
  return "bg-[hsl(var(--rag-red-bg))]";
}

export function CustomerSentimentCard({
  score,
  trend,
  periodDays = 90,
  categories = [],
  oversightThreshold = 4.0,
  rewardThreshold = 8.5,
}: CustomerSentimentCardProps) {
  const isOversight = score < oversightThreshold;
  const isReward = score >= rewardThreshold;

  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Customer Sentiment</h3>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px]">
              <p className="text-xs">
                Data-driven insight into dealer conduct, governance, and customer
                experience. Combines complaint trends, feedback analytics, and
                post-sale outcomes.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        {/* Trend indicator */}
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-[hsl(var(--rag-green-text))]" : "text-[hsl(var(--rag-red-text))]"}`}>
          {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {trend >= 0 ? "+" : ""}{trend.toFixed(1)} ({periodDays}d)
        </div>
      </div>

      {/* Threshold alert */}
      {isOversight && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--rag-red-bg))] border border-[hsl(var(--rag-red))]/20 mb-4">
          <ShieldAlert className="w-4 h-4 text-[hsl(var(--rag-red))] shrink-0" />
          <span className="text-xs font-medium text-[hsl(var(--rag-red-text))]">
            Enhanced Oversight — below {oversightThreshold.toFixed(1)}
          </span>
        </div>
      )}
      {isReward && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--rag-green-bg))] border border-[hsl(var(--rag-green))]/20 mb-4">
          <Award className="w-4 h-4 text-[hsl(var(--rag-green))] shrink-0" />
          <span className="text-xs font-medium text-[hsl(var(--rag-green-text))]">
            Positive Reward — above {rewardThreshold.toFixed(1)}
          </span>
        </div>
      )}

      {/* Main score + gauge */}
      <div className="flex items-center justify-center mb-2">
        <SentimentGauge score={score} size="default" />
      </div>

      {/* Legend row */}
      <div className="flex justify-center gap-4 text-[10px] text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--rag-red))]" /> 0–3.3
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--rag-amber))]" /> 3.4–6.6
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--rag-green))]" /> 6.7–10
        </span>
      </div>

      {/* Category breakdown */}
      {categories.length > 0 && (
        <div className="border-t border-border pt-3 mt-auto">
          <p className="text-xs font-semibold text-foreground mb-2">Breakdown</p>
          <div className="space-y-2">
            {categories.map((cat) => {
              const pct = (cat.score / 10) * 100;
              const catOversight = cat.score < oversightThreshold;
              const catReward = cat.score >= rewardThreshold;
              return (
                <div key={cat.label} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {catOversight && <ShieldAlert className="w-3 h-3 text-[hsl(var(--rag-red))]" />}
                      {catReward && <Award className="w-3 h-3 text-[hsl(var(--rag-green))]" />}
                      <span className="text-xs text-muted-foreground">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${getScoreColor(cat.score)}`}>
                        {cat.score.toFixed(1)}
                      </span>
                      <span className={`text-[10px] ${cat.trend >= 0 ? "text-[hsl(var(--rag-green-text))]" : "text-[hsl(var(--rag-red-text))]"}`}>
                        {cat.trend >= 0 ? "▲" : "▼"} {Math.abs(cat.trend).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getScoreBg(cat.score)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
