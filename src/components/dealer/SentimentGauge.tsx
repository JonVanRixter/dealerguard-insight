interface SentimentGaugeProps {
  score: number;
  size?: "default" | "compact";
}

const getScoreColor = (score: number) => {
  if (score >= 6.7) return "text-[hsl(var(--rag-green))]";
  if (score >= 3.4) return "text-[hsl(var(--rag-amber))]";
  return "text-[hsl(var(--rag-red))]";
};

const getTrackColor = (score: number) => {
  if (score >= 6.7) return "hsl(var(--rag-green))";
  if (score >= 3.4) return "hsl(var(--rag-amber))";
  return "hsl(var(--rag-red))";
};

export function SentimentGauge({ score, size = "default" }: SentimentGaugeProps) {
  const isCompact = size === "compact";
  const pct = Math.min(Math.max(score, 0), 10) / 10;

  // Semi-circle arc gauge using stroke-dasharray
  const radius = 70;
  const circumference = Math.PI * radius; // half-circle
  const filled = pct * circumference;

  return (
    <div className={`flex flex-col items-center ${isCompact ? "gap-0" : "gap-1"}`}>
      <div className={`relative ${isCompact ? "w-24 h-14" : "w-40 h-[88px]"}`}>
        <svg
          viewBox="0 0 180 95"
          className="w-full h-full"
          style={{ overflow: "visible" }}
        >
          {/* Background track */}
          <path
            d="M 10 90 A 70 70 0 0 1 170 90"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={isCompact ? "10" : "12"}
            strokeLinecap="round"
          />
          {/* Three colored segments underneath */}
          <path
            d="M 10 90 A 70 70 0 0 1 56.36 27.68"
            fill="none"
            stroke="hsl(var(--rag-red))"
            strokeWidth={isCompact ? "10" : "12"}
            strokeLinecap="butt"
            opacity="0.25"
          />
          <path
            d="M 56.36 27.68 A 70 70 0 0 1 123.64 27.68"
            fill="none"
            stroke="hsl(var(--rag-amber))"
            strokeWidth={isCompact ? "10" : "12"}
            strokeLinecap="butt"
            opacity="0.25"
          />
          <path
            d="M 123.64 27.68 A 70 70 0 0 1 170 90"
            fill="none"
            stroke="hsl(var(--rag-green))"
            strokeWidth={isCompact ? "10" : "12"}
            strokeLinecap="butt"
            opacity="0.25"
          />
          {/* Filled arc */}
          <path
            d="M 10 90 A 70 70 0 0 1 170 90"
            fill="none"
            stroke={getTrackColor(score)}
            strokeWidth={isCompact ? "10" : "12"}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
          />
        </svg>
        {/* Score centered inside the arc */}
        <div className="absolute inset-0 flex items-end justify-center pb-0">
          <span className={`${isCompact ? "text-lg" : "text-3xl"} font-bold ${getScoreColor(score)} leading-none`}>
            {score.toFixed(1)}
          </span>
        </div>
      </div>
      {!isCompact && (
        <span className="text-[10px] text-muted-foreground">out of 10</span>
      )}
    </div>
  );
}
