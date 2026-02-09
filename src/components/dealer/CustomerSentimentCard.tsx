import { Info, ShieldAlert, Award } from "lucide-react";
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
    <div className="bg-card rounded-xl border border-border p-5">
      {/* Title */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
        Customer Sentiment Score (CSS)
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-3.5 h-3.5" />
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

      {/* Threshold alert banners */}
      {isOversight && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rag-red/10 border border-rag-red/20 mb-3">
          <ShieldAlert className="w-4 h-4 text-rag-red shrink-0" />
          <span className="text-xs font-medium text-rag-red">
            Enhanced Oversight — CSS below {oversightThreshold.toFixed(1)} threshold
          </span>
        </div>
      )}
      {isReward && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 mb-3">
          <Award className="w-4 h-4 text-accent shrink-0" />
          <span className="text-xs font-medium text-accent">
            Positive Reward — CSS above {rewardThreshold.toFixed(1)} threshold
          </span>
        </div>
      )}

      {/* Main gauge */}
      <div className="flex justify-center">
        <SentimentGauge score={score} size="default" />
      </div>

      {/* Trend pill */}
      <div className="flex justify-center -mt-1 mb-4">
        <div className="bg-muted rounded-full px-4 py-1 text-xs font-medium text-muted-foreground">
          {trend >= 0 ? "Up" : "Down"} {Math.abs(trend).toFixed(1)} in the last{" "}
          {periodDays} days
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between text-[10px] text-muted-foreground mb-5">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-rag-red inline-block" /> Risk
          0.0–3.3
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-rag-amber inline-block" />{" "}
          Attention 3.4–6.6
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-rag-green inline-block" />{" "}
          Happy 6.7–10.0
        </span>
      </div>

      {/* Category breakdown */}
      {categories.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold text-foreground mb-3">
            Category Breakdown
          </p>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => {
              const catOversight = cat.score < oversightThreshold;
              const catReward = cat.score >= rewardThreshold;
              return (
                <div
                  key={cat.label}
                  className={`flex flex-col items-center gap-1 rounded-lg p-2 ${
                    catOversight
                      ? "bg-rag-red/5 ring-1 ring-rag-red/20"
                      : catReward
                        ? "bg-accent/5 ring-1 ring-accent/20"
                        : ""
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {catOversight && <ShieldAlert className="w-3 h-3 text-rag-red" />}
                    {catReward && <Award className="w-3 h-3 text-accent" />}
                    <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
                      {cat.label}
                    </p>
                  </div>
                  <SentimentGauge score={cat.score} size="compact" />
                  <div className="bg-muted rounded-full px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground mt-1">
                    {cat.trend >= 0 ? "Up" : "Down"}{" "}
                    {Math.abs(cat.trend).toFixed(1)} in {periodDays}d
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
