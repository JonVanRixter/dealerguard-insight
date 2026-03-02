import { useMemo } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { getControlCadence, type CheckCadenceInfo } from "@/utils/auditCheckCadence";
import auditCheckSchedule from "@/data/tcg/auditCheckSchedule.json";
import { cn } from "@/lib/utils";

interface CheckScheduleHealthProps {
  dealerName: string;
  /** Optional callback: scroll to a section by sectionName and auto-expand it */
  onScrollToSection?: (sectionName: string) => void;
}

interface ControlEntry {
  controlId: string;
  controlArea: string;
  sectionName: string;
  cadence: CheckCadenceInfo;
}

export function CheckScheduleHealth({ dealerName, onScrollToSection }: CheckScheduleHealthProps) {
  const entries = useMemo(() => {
    const result: ControlEntry[] = [];
    for (const section of auditCheckSchedule) {
      for (const ctrl of section.controls) {
        const cadence = getControlCadence(dealerName, section.sectionName, ctrl.name, ctrl.id);
        if (cadence) {
          result.push({
            controlId: ctrl.id,
            controlArea: ctrl.name.split("—")[0].trim(),
            sectionName: section.sectionName,
            cadence,
          });
        }
      }
    }
    return result;
  }, [dealerName]);

  const total = entries.length;
  const overdue = entries.filter((e) => e.cadence.daysUntilDue <= 0);
  const urgent = entries.filter((e) => e.cadence.daysUntilDue > 0 && e.cadence.status === "red");
  const dueSoon = entries.filter((e) => e.cadence.status === "amber");
  const onSchedule = total - overdue.length - urgent.length - dueSoon.length;

  // Most urgent = lowest daysUntilDue
  const sorted = [...entries].sort((a, b) => a.cadence.daysUntilDue - b.cadence.daysUntilDue);
  const mostUrgent = sorted[0] ?? null;
  // Next due after most urgent (first non-overdue)
  const nextDue = sorted.find((e) => e.cadence.daysUntilDue > 0) ?? null;

  if (total === 0) return null;

  function handleView(list: ControlEntry[]) {
    if (list.length > 0 && onScrollToSection) {
      onScrollToSection(list[0].sectionName);
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Check Schedule Health</h3>
      </div>

      {/* Total */}
      <p className="text-sm text-muted-foreground">
        Total controls monitored: <span className="font-semibold text-foreground">{total}</span>
      </p>

      {/* Status rows */}
      <div className="space-y-1.5">
        <StatusRow
          icon="✅"
          label="On schedule (>60 days)"
          count={onSchedule}
        />
        <StatusRow
          icon="🟡"
          label="Due soon (<30 days)"
          count={dueSoon.length}
          className={dueSoon.length > 0 ? "text-[hsl(38,92%,50%)]" : undefined}
          onView={dueSoon.length > 0 ? () => handleView(dueSoon) : undefined}
        />
        <StatusRow
          icon="🔴"
          label="Due urgently (<10 days)"
          count={urgent.length}
          className={urgent.length > 0 ? "text-[hsl(0,84%,60%)]" : undefined}
          onView={urgent.length > 0 ? () => handleView(urgent) : undefined}
        />
        <StatusRow
          icon="🔴"
          label="Overdue"
          count={overdue.length}
          className={overdue.length > 0 ? "text-[hsl(0,84%,60%)] font-bold" : undefined}
          onView={overdue.length > 0 ? () => handleView(overdue) : undefined}
        />
      </div>

      {/* Most urgent */}
      {mostUrgent && (
        <div className="pt-2 border-t border-border space-y-1">
          <p className="text-xs text-muted-foreground">
            Most urgent:{" "}
            <span className="font-medium text-foreground">{mostUrgent.controlArea} ({mostUrgent.cadence.frequency})</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Last checked: {mostUrgent.cadence.lastCheckedLabel}
            {mostUrgent.cadence.lastCheckedBy && ` by ${mostUrgent.cadence.lastCheckedBy}`}
            {" · "}
            {mostUrgent.cadence.daysUntilDue <= 0 ? (
              <span className="font-bold text-[hsl(0,84%,60%)]">
                Overdue by {Math.abs(mostUrgent.cadence.daysUntilDue)} days
              </span>
            ) : (
              <span className={cn(
                mostUrgent.cadence.status === "red" && "text-[hsl(0,84%,60%)]",
                mostUrgent.cadence.status === "amber" && "text-[hsl(38,92%,50%)]",
                mostUrgent.cadence.status === "neutral" && "text-muted-foreground"
              )}>
                {mostUrgent.cadence.daysUntilDue} days remaining
              </span>
            )}
          </p>
        </div>
      )}

      {/* Next due (if different from most urgent and not overdue) */}
      {nextDue && nextDue !== mostUrgent && (
        <p className="text-xs text-muted-foreground">
          Next due:{" "}
          <span className="font-medium text-foreground">{nextDue.controlArea} ({nextDue.cadence.frequency})</span>
          {" "}in{" "}
          <span className={cn(
            nextDue.cadence.status === "red" && "text-[hsl(0,84%,60%)]",
            nextDue.cadence.status === "amber" && "text-[hsl(38,92%,50%)]",
            nextDue.cadence.status === "neutral" && "text-muted-foreground"
          )}>
            {nextDue.cadence.daysUntilDue} days{" "}
            {nextDue.cadence.status === "red" ? "🔴" : nextDue.cadence.status === "amber" ? "🟡" : ""}
          </span>
        </p>
      )}
    </div>
  );
}

function StatusRow({ icon, label, count, className, onView }: {
  icon: string;
  label: string;
  count: number;
  className?: string;
  onView?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span>{icon}</span>
      <span className={cn("text-muted-foreground", className)}>
        {label}
      </span>
      <span className={cn("font-semibold text-foreground", className)}>
        {count} control{count !== 1 ? "s" : ""}
      </span>
      {onView && (
        <button
          onClick={onView}
          className="text-[10px] text-primary hover:underline font-medium"
        >
          [View]
        </button>
      )}
    </div>
  );
}
