import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  className?: string;
  size?: "sm" | "default";
}

export function ScoreBadge({ score, className, size = "default" }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold bg-score-badge text-score-badge-foreground",
        size === "sm" ? "px-2 py-0.5 text-[11px] min-w-[28px]" : "px-3 py-1 text-sm min-w-[36px]",
        className
      )}
    >
      {score}
    </span>
  );
}
