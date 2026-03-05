import { CheckCircle2 } from "lucide-react";

interface StageIndicatorProps {
  current: 1 | 2;
  onNavigate?: (stage: 1 | 2) => void;
  allPreScreenDone?: boolean;
  allPoliciesDone?: boolean;
}

const stages = [
  { num: 1 as const, label: "Pre-Screen" },
  { num: 2 as const, label: "Policies" },
];

export function StageIndicator({ current, onNavigate, allPreScreenDone, allPoliciesDone }: StageIndicatorProps) {
  const bothComplete = allPreScreenDone && allPoliciesDone;

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      {stages.map((s, i) => {
        const isActive = s.num === current;
        const isDone = s.num === 1 ? allPreScreenDone : allPoliciesDone;
        return (
          <div key={s.num} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground">→</span>}
            <button
              onClick={() => onNavigate?.(s.num)}
              disabled={!onNavigate}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : isDone
                  ? "bg-outcome-pass-bg text-outcome-pass-text cursor-pointer"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="font-mono">[{s.num}]</span>
              <span>{s.label}</span>
              {isDone && <CheckCircle2 className="w-4 h-4" />}
            </button>
          </div>
        );
      })}
      {bothComplete && (
        <span className="text-sm font-medium text-outcome-pass-text flex items-center gap-1.5 ml-2">
          🟢 Complete — added to Dealer Portfolio
        </span>
      )}
    </div>
  );
}
