interface SentimentGaugeProps {
  score: number;
  /** Compact variant for sub-category gauges */
  size?: "default" | "compact";
}

/** Maps a 0–10 score to a rotation angle on the 180° gauge (-90° = 0, +90° = 10) */
const scoreToAngle = (score: number) =>
  -90 + (Math.min(Math.max(score, 0), 10) / 10) * 180;

const getScoreColor = (score: number) => {
  if (score >= 6.7) return "text-rag-green";
  if (score >= 3.4) return "text-rag-amber";
  return "text-rag-red";
};

export function SentimentGauge({ score, size = "default" }: SentimentGaugeProps) {
  const needleAngle = scoreToAngle(score);
  const isCompact = size === "compact";

  const emojiSize = isCompact ? "12" : "16";
  const needleWidth = isCompact ? "2.5" : "3";
  const dotRadius = isCompact ? "5" : "6";
  const arcWidth = isCompact ? "14" : "18";

  return (
    <div className={`relative ${isCompact ? "w-32 h-[72px]" : "w-56 h-32"}`}>
      <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
        {/* Gauge arcs – three 60° segments over 180° */}
        <path
          d="M 20 100 A 80 80 0 0 1 66.86 30.72"
          fill="none"
          stroke="hsl(var(--rag-red))"
          strokeWidth={arcWidth}
          strokeLinecap="butt"
        />
        <path
          d="M 66.86 30.72 A 80 80 0 0 1 133.14 30.72"
          fill="none"
          stroke="hsl(var(--rag-amber))"
          strokeWidth={arcWidth}
          strokeLinecap="butt"
        />
        <path
          d="M 133.14 30.72 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="hsl(var(--rag-green))"
          strokeWidth={arcWidth}
          strokeLinecap="butt"
        />

        {/* Emoji faces */}
        <text x="30" y="80" fontSize={emojiSize} textAnchor="middle">
          😟
        </text>
        <text x="100" y="18" fontSize={emojiSize} textAnchor="middle">
          😐
        </text>
        <text x="170" y="80" fontSize={emojiSize} textAnchor="middle">
          😊
        </text>

        {/* Needle */}
        <g transform={`rotate(${needleAngle}, 100, 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="28"
            stroke="hsl(var(--foreground))"
            strokeWidth={needleWidth}
            strokeLinecap="round"
          />
        </g>
        {/* Center dot */}
        <circle cx="100" cy="100" r={dotRadius} fill="hsl(var(--foreground))" />
      </svg>

      {/* Score overlay at bottom-center */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1">
        <span
          className={`${isCompact ? "text-lg" : "text-2xl"} font-bold ${getScoreColor(score)} bg-card/80 px-1.5 rounded`}
        >
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
