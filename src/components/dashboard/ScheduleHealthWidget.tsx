import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { getControlCadence } from "@/utils/auditCheckCadence";
import auditCheckSchedule from "@/data/tcg/auditCheckSchedule.json";
import { tcgDealers } from "@/data/tcg/dealers";
import { cn } from "@/lib/utils";

interface StatusBucket {
  dealers: Set<string>;
  controls: number;
}

export function ScheduleHealthWidget() {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const overdue: StatusBucket = { dealers: new Set(), controls: 0 };
    const urgent: StatusBucket = { dealers: new Set(), controls: 0 };
    const dueSoon: StatusBucket = { dealers: new Set(), controls: 0 };
    const onSchedule: StatusBucket = { dealers: new Set(), controls: 0 };

    for (const dealer of tcgDealers) {
      for (const section of auditCheckSchedule) {
        for (const ctrl of section.controls) {
          const cadence = getControlCadence(dealer.name, section.sectionName, ctrl.name, ctrl.id);
          if (!cadence) continue;

          if (cadence.daysUntilDue <= 0) {
            overdue.controls++;
            overdue.dealers.add(dealer.id);
          } else if (cadence.status === "red") {
            urgent.controls++;
            urgent.dealers.add(dealer.id);
          } else if (cadence.status === "amber") {
            dueSoon.controls++;
            dueSoon.dealers.add(dealer.id);
          } else {
            onSchedule.controls++;
            onSchedule.dealers.add(dealer.id);
          }
        }
      }
    }

    return { overdue, urgent, dueSoon, onSchedule };
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Check Schedule Health — All Dealers
        </h3>
      </div>

      <div className="space-y-1.5">
        <Row
          icon="🔴"
          label="Overdue checks:"
          controls={stats.overdue.controls}
          dealers={stats.overdue.dealers.size}
          className="text-[hsl(0,84%,60%)] font-bold"
          onView={stats.overdue.controls > 0 ? () => navigate("/tcg/dealers?schedule=overdue") : undefined}
        />
        <Row
          icon="🔴"
          label="Due within 10 days:"
          controls={stats.urgent.controls}
          dealers={stats.urgent.dealers.size}
          className="text-[hsl(0,84%,60%)]"
          onView={stats.urgent.controls > 0 ? () => navigate("/tcg/dealers?schedule=urgent") : undefined}
        />
        <Row
          icon="🟡"
          label="Due within 30 days:"
          controls={stats.dueSoon.controls}
          dealers={stats.dueSoon.dealers.size}
          className="text-[hsl(38,92%,50%)]"
          onView={stats.dueSoon.controls > 0 ? () => navigate("/tcg/dealers?schedule=due-soon") : undefined}
        />
        <Row
          icon="✅"
          label="On schedule:"
          controls={stats.onSchedule.controls}
          dealers={stats.onSchedule.dealers.size}
        />
      </div>
    </div>
  );
}

function Row({ icon, label, controls, dealers, className, onView }: {
  icon: string;
  label: string;
  controls: number;
  dealers: number;
  className?: string;
  onView?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span>{icon}</span>
      <span className={cn("text-muted-foreground min-w-[160px]", className)}>{label}</span>
      <span className={cn("font-semibold text-foreground", className)}>
        {controls} control{controls !== 1 ? "s" : ""} across {dealers} dealer{dealers !== 1 ? "s" : ""}
      </span>
      {onView && (
        <button
          onClick={onView}
          className="text-xs text-primary hover:underline font-medium ml-auto"
        >
          [View all →]
        </button>
      )}
    </div>
  );
}
