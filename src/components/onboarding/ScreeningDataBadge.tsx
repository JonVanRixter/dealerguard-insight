import { CheckCircle2 } from "lucide-react";

interface Props {
  label: string;
  value: string | null | undefined;
}

export function ScreeningDataBadge({ label, value }: Props) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 mt-1">
      <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
      <div className="text-xs">
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}
