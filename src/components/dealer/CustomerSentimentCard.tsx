import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CustomerSentimentCardProps {
  score: number;
  trend: number;
  periodDays?: number;
}

const getScoreCategory = (score: number) => {
  if (score >= 6.7) return { label: "Happy", color: "text-rag-green" };
  if (score >= 3.4) return { label: "Attention", color: "text-rag-amber" };
  return { label: "Risk", color: "text-rag-red" };
};

/** Maps a 0–10 score to a rotation angle on the 180° gauge (-90° = 0, +90° = 10) */
const scoreToAngle = (score: number) => -90 + (Math.min(Math.max(score, 0), 10) / 10) * 180;

export function CustomerSentimentCard({ score, trend, periodDays = 90 }: CustomerSentimentCardProps) {
  const category = getScoreCategory(score);
  const needleAngle = scoreToAngle(score);

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
              Data-driven insight into dealer conduct, governance, and customer experience.
              Combines complaint trends, feedback analytics, and post-sale outcomes.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Gauge */}
      <div className="flex justify-center">
        <div className="relative w-56 h-32">
          <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
            {/* Gauge arcs – three 60° segments over 180° */}
            <path d="M 20 100 A 80 80 0 0 1 66.86 30.72" fill="none" stroke="hsl(var(--rag-red))" strokeWidth="18" strokeLinecap="butt" />
            <path d="M 66.86 30.72 A 80 80 0 0 1 133.14 30.72" fill="none" stroke="hsl(var(--rag-amber))" strokeWidth="18" strokeLinecap="butt" />
            <path d="M 133.14 30.72 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--rag-green))" strokeWidth="18" strokeLinecap="butt" />

            {/* Emoji faces */}
            <text x="30" y="80" fontSize="16" textAnchor="middle">😟</text>
            <text x="100" y="18" fontSize="16" textAnchor="middle">😐</text>
            <text x="170" y="80" fontSize="16" textAnchor="middle">😊</text>

            {/* Needle */}
            <g transform={`rotate(${needleAngle}, 100, 100)`}>
              <line x1="100" y1="100" x2="100" y2="28" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
            </g>
            {/* Center dot */}
            <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
          </svg>
        </div>
      </div>

      {/* Score + trend pill */}
      <div className="flex flex-col items-center gap-2 -mt-2">
        <span className={`text-4xl font-bold ${category.color}`}>{score.toFixed(1)}</span>
        <div className="bg-muted rounded-full px-4 py-1 text-xs font-medium text-muted-foreground">
          {trend >= 0 ? "Up" : "Down"} {Math.abs(trend).toFixed(1)} in the last {periodDays} days
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between mt-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rag-red inline-block" /> Risk 0.0–3.3</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rag-amber inline-block" /> Attention 3.4–6.6</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rag-green inline-block" /> Happy 6.7–10.0</span>
      </div>
    </div>
  );
}
