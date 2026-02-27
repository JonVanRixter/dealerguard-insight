import { Info, ShieldAlert, Award, TrendingUp, TrendingDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  if (score >= 6.7) return "text-outcome-pass";
  if (score >= 3.4) return "text-outcome-pending";
  return "text-outcome-fail";
}

function getScoreTextColor(score: number) {
  if (score >= 6.7) return "text-outcome-pass-text";
  if (score >= 3.4) return "text-outcome-pending-text";
  return "text-outcome-fail-text";
}

function getScoreBg(score: number) {
  if (score >= 6.7) return "bg-outcome-pass-bg";
  if (score >= 3.4) return "bg-outcome-pending-bg";
  return "bg-outcome-fail-bg";
}

function getBarHsl(score: number) {
  if (score >= 6.7) return "hsl(var(--outcome-pass))";
  if (score >= 3.4) return "hsl(var(--outcome-pending))";
  return "hsl(var(--outcome-fail))";
}

function getLabel(score: number) {
  if (score >= 8.5) return "Excellent";
  if (score >= 6.7) return "Good";
  if (score >= 5.0) return "Adequate";
  if (score >= 3.4) return "Concerning";
  return "Poor";
}

/** Circular progress ring used for the main score */
function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(score, 0), 10) / 10;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Filled arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getBarHsl(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold leading-none ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">/ 10</span>
      </div>
    </div>
  );
}

/** Mini inline ring for category rows */
function MiniRing({ score, size = 24 }: { score: number; size?: number }) {
  const sw = 3;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 10) / 10;

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={sw} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={getBarHsl(score)} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        className="transition-all duration-500"
      />
    </svg>
  );
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
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
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
      </div>

      {/* Threshold alert */}
      {isOversight && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-outcome-fail-bg border border-outcome-fail/20 mb-4">
          <ShieldAlert className="w-4 h-4 text-outcome-fail shrink-0" />
          <span className="text-xs font-medium text-outcome-fail-text">
            Enhanced Oversight — below {oversightThreshold.toFixed(1)}
          </span>
        </div>
      )}
      {isReward && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-outcome-pass-bg border border-outcome-pass/20 mb-4">
          <Award className="w-4 h-4 text-outcome-pass shrink-0" />
          <span className="text-xs font-medium text-outcome-pass-text">
            Positive Reward — above {rewardThreshold.toFixed(1)}
          </span>
        </div>
      )}

      {/* Main score area */}
      <div className="flex items-center gap-4 mb-3">
        <ScoreRing score={score} />
        <div className="flex flex-col gap-1">
          <span className={`text-sm font-semibold ${getScoreTextColor(score)}`}>
            {getLabel(score)}
          </span>
          <div className={`inline-flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-score-up" : "text-score-down"}`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend >= 0 ? "+" : ""}{trend.toFixed(1)} over {periodDays}d
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {categories.length > 0 && (
        <div className="border-t border-border pt-2">
          <p className="text-xs font-semibold text-foreground mb-2">Breakdown</p>
          <div className="space-y-1.5">
            {categories.map((cat) => (
              <div key={cat.label} className="flex items-center gap-2.5">
                <MiniRing score={cat.score} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {cat.score < oversightThreshold && <ShieldAlert className="w-3 h-3 text-outcome-fail" />}
                      {cat.score >= rewardThreshold && <Award className="w-3 h-3 text-outcome-pass" />}
                      <span className="text-xs text-muted-foreground truncate">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold tabular-nums ${getScoreTextColor(cat.score)}`}>
                        {cat.score.toFixed(1)}
                      </span>
                      <span className={`text-[10px] tabular-nums ${cat.trend >= 0 ? "text-score-up" : "text-score-down"}`}>
                        {cat.trend >= 0 ? "▲" : "▼"}{Math.abs(cat.trend).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
