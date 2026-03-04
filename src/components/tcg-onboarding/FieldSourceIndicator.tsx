import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type FieldSource = "api" | "manual" | "pending_automation";

interface Props {
  source: FieldSource;
}

const config: Record<FieldSource, { dot: string; label: string; tip: string }> = {
  api: { dot: "bg-outcome-pass", label: "API", tip: "Populated automatically via external check" },
  manual: { dot: "bg-primary", label: "Manual", tip: "Entered manually by TCG staff" },
  pending_automation: { dot: "bg-outcome-pending", label: "Manual (Phase 1)", tip: "This field will be automated via API in a future release" },
};

export function FieldSourceIndicator({ source }: Props) {
  const c = config[source];
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 ml-1.5 cursor-default">
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            <span className="text-[10px] text-muted-foreground leading-none">{c.label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-52">{c.tip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
