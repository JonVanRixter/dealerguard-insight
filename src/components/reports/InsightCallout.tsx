import { Lightbulb, AlertTriangle, BarChart3 } from "lucide-react";

type CalloutType = "positive" | "warning" | "neutral";

interface InsightCalloutProps {
  type: CalloutType;
  children: React.ReactNode;
}

const config: Record<CalloutType, { icon: typeof Lightbulb; bg: string; iconColor: string }> = {
  positive: { icon: Lightbulb, bg: "bg-primary/5", iconColor: "text-primary" },
  warning: { icon: AlertTriangle, bg: "bg-destructive/5", iconColor: "text-destructive" },
  neutral: { icon: BarChart3, bg: "bg-muted/40", iconColor: "text-muted-foreground" },
};

export function InsightCallout({ type, children }: InsightCalloutProps) {
  const { icon: Icon, bg, iconColor } = config[type];
  return (
    <div className={`${bg} rounded-lg px-4 py-3 flex items-start gap-2`}>
      <Icon className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} />
      <p className="text-xs text-foreground leading-relaxed">{children}</p>
    </div>
  );
}
