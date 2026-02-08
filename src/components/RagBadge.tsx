import { cn } from "@/lib/utils";

type RagStatus = "green" | "amber" | "red";

interface RagBadgeProps {
  status: RagStatus;
  label?: string;
  className?: string;
}

const statusConfig: Record<RagStatus, { bg: string; text: string; defaultLabel: string }> = {
  green: { bg: "bg-rag-green-bg", text: "text-rag-green-text", defaultLabel: "GREEN" },
  amber: { bg: "bg-rag-amber-bg", text: "text-rag-amber-text", defaultLabel: "AMBER" },
  red: { bg: "bg-rag-red-bg", text: "text-rag-red-text", defaultLabel: "RED" },
};

export function RagBadge({ status, label, className }: RagBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        config.bg,
        config.text,
        className
      )}
    >
      {label || config.defaultLabel}
    </span>
  );
}
