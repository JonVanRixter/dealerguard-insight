import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CustomerSentimentCardProps {
  score: number;
  trend: number;
  periodDays?: number;
}

const getScoreCategory = (score: number) => {
  if (score >= 6.7) return { label: "Happy", color: "text-rag-green", bg: "bg-rag-green" };
  if (score >= 3.4) return { label: "Attention", color: "text-rag-amber", bg: "bg-rag-amber" };
  return { label: "Risk", color: "text-rag-red", bg: "bg-rag-red" };
};

export function CustomerSentimentCard({ score, trend, periodDays = 90 }: CustomerSentimentCardProps) {
  const category = getScoreCategory(score);
  
  const TrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-rag-green" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-rag-red" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          Customer Sentiment Score (CSS)
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3.5 h-3.5" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px]">
              <p className="text-xs">
                Data-driven insight into dealer conduct, governance, and customer experience.
                Combines complaint trends, feedback analytics, and post-sale outcomes.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <span className={`text-5xl font-bold ${category.color}`}>{score.toFixed(1)}</span>
        <div className="flex items-center gap-1 mb-2 text-sm">
          <TrendIcon />
          <span className={trend >= 0 ? "text-rag-green" : "text-rag-red"}>
            {trend >= 0 ? "+" : ""}{trend.toFixed(1)}
          </span>
          <span className="text-muted-foreground">in {periodDays} days</span>
        </div>
      </div>

      {/* Score scale */}
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-muted overflow-hidden flex">
          <div className="h-full bg-rag-red" style={{ width: "33.3%" }} />
          <div className="h-full bg-rag-amber" style={{ width: "33.4%" }} />
          <div className="h-full bg-rag-green" style={{ width: "33.3%" }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0.0 - 3.3 Risk</span>
          <span>3.4 - 6.6 Attention</span>
          <span>6.7 - 10.0 Happy</span>
        </div>
      </div>

      {/* Current category indicator */}
      <div className={`mt-4 px-3 py-2 rounded-lg ${category.bg}/10 border ${category.bg}/20`}>
        <span className={`text-sm font-medium ${category.color}`}>
          Current Status: {category.label}
        </span>
      </div>
    </div>
  );
}
