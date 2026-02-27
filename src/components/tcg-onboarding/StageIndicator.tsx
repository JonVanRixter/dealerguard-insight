import { Badge } from "@/components/ui/badge";

interface StageIndicatorProps {
  current: 1 | 2 | 3;
  onNavigate?: (stage: 1 | 2 | 3) => void;
}

const stages = [
  { num: 1, label: "Dealer Details & Pre-Screen" },
  { num: 2, label: "Policy Framework" },
  { num: 3, label: "Review & Approve" },
] as const;

export function StageIndicator({ current, onNavigate }: StageIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {stages.map((s, i) => {
        const isActive = s.num === current;
        const isPast = s.num < current;
        return (
          <div key={s.num} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground">→</span>}
            <button
              onClick={() => onNavigate?.(s.num)}
              disabled={!onNavigate || s.num > current}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : isPast
                  ? "bg-[hsl(var(--rag-green-bg))] text-[hsl(var(--rag-green-text))] cursor-pointer"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="font-mono">[{s.num}]</span>
              <span>{s.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
