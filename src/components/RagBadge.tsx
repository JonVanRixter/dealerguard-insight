import { cn } from "@/lib/utils";

type RagStatus = "green" | "amber" | "red";

export interface RagBadgeProps {
  status: RagStatus;
  label?: string;
  className?: string;
  size?: "sm" | "default";
}

const statusConfig: Record<RagStatus, { bg: string; text: string; defaultLabel: string }> = {
  green: { bg: "bg-rag-green-bg", text: "text-rag-green-text", defaultLabel: "GREEN" },
  amber: { bg: "bg-rag-amber-bg", text: "text-rag-amber-text", defaultLabel: "AMBER" },
  red: { bg: "bg-rag-red-bg", text: "text-rag-red-text", defaultLabel: "RED" },
};

export function RagBadge({ status, label, className, size = "default" }: RagBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        config.bg,
        config.text,
        className
      )}
    >
      {label || config.defaultLabel}
    </span>
  );
}
