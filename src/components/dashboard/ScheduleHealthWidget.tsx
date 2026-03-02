import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { getControlCadence } from "@/utils/auditCheckCadence";
import auditCheckSchedule from "@/data/tcg/auditCheckSchedule.json";
import { tcgDealers } from "@/data/tcg/dealers";
import { cn } from "@/lib/utils";

interface ControlDetail {
  dealerId: string;
  dealerName: string;
  sectionName: string;
  controlName: string;
  daysUntilDue: number;
  frequency: string;
}

interface StatusBucket {
  dealers: Set<string>;
  controls: number;
  details: ControlDetail[];
}

type BucketKey = "overdue" | "urgent" | "dueSoon";

export function ScheduleHealthWidget() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<BucketKey | null>(null);

  const stats = useMemo(() => {
    const overdue: StatusBucket = { dealers: new Set(), controls: 0, details: [] };
    const urgent: StatusBucket = { dealers: new Set(), controls: 0, details: [] };
    const dueSoon: StatusBucket = { dealers: new Set(), controls: 0, details: [] };
    const onSchedule: StatusBucket = { dealers: new Set(), controls: 0, details: [] };

    for (const dealer of tcgDealers) {
      for (const section of auditCheckSchedule) {
        for (const ctrl of section.controls) {
          const cadence = getControlCadence(dealer.name, section.sectionName, ctrl.name, ctrl.id);
          if (!cadence) continue;

          const detail: ControlDetail = {
            dealerId: dealer.id,
            dealerName: dealer.name,
            sectionName: section.sectionName,
            controlName: ctrl.name.split("—")[0].trim(),
            daysUntilDue: cadence.daysUntilDue,
            frequency: cadence.frequency,
          };

          if (cadence.daysUntilDue <= 0) {
            overdue.controls++;
            overdue.dealers.add(dealer.id);
            overdue.details.push(detail);
          } else if (cadence.status === "red") {
            urgent.controls++;
            urgent.dealers.add(dealer.id);
            urgent.details.push(detail);
          } else if (cadence.status === "amber") {
            dueSoon.controls++;
            dueSoon.dealers.add(dealer.id);
            dueSoon.details.push(detail);
          } else {
            onSchedule.controls++;
            onSchedule.dealers.add(dealer.id);
          }
        }
      }
    }

    // Sort details by urgency
    overdue.details.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    urgent.details.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    dueSoon.details.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    return { overdue, urgent, dueSoon, onSchedule };
  }, []);

  function toggleExpand(key: BucketKey) {
    setExpanded((prev) => (prev === key ? null : key));
  }

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
          expandable={stats.overdue.controls > 0}
          isExpanded={expanded === "overdue"}
          onToggle={() => toggleExpand("overdue")}
        />
        {expanded === "overdue" && (
          <DetailsList details={stats.overdue.details} navigate={navigate} labelClass="text-[hsl(0,84%,60%)]" />
        )}

        <Row
          icon="🔴"
          label="Due within 10 days:"
          controls={stats.urgent.controls}
          dealers={stats.urgent.dealers.size}
          className="text-[hsl(0,84%,60%)]"
          expandable={stats.urgent.controls > 0}
          isExpanded={expanded === "urgent"}
          onToggle={() => toggleExpand("urgent")}
        />
        {expanded === "urgent" && (
          <DetailsList details={stats.urgent.details} navigate={navigate} labelClass="text-[hsl(0,84%,60%)]" />
        )}

        <Row
          icon="🟡"
          label="Due within 30 days:"
          controls={stats.dueSoon.controls}
          dealers={stats.dueSoon.dealers.size}
          className="text-[hsl(38,92%,50%)]"
          expandable={stats.dueSoon.controls > 0}
          isExpanded={expanded === "dueSoon"}
          onToggle={() => toggleExpand("dueSoon")}
        />
        {expanded === "dueSoon" && (
          <DetailsList details={stats.dueSoon.details} navigate={navigate} labelClass="text-[hsl(38,92%,50%)]" />
        )}

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

function Row({ icon, label, controls, dealers, className, expandable, isExpanded, onToggle }: {
  icon: string;
  label: string;
  controls: number;
  dealers: number;
  className?: string;
  expandable?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  const Chevron = isExpanded ? ChevronUp : ChevronDown;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span>{icon}</span>
      <span className={cn("text-muted-foreground min-w-[160px]", className)}>{label}</span>
      <span className={cn("font-semibold text-foreground", className)}>
        {controls} control{controls !== 1 ? "s" : ""} across {dealers} dealer{dealers !== 1 ? "s" : ""}
      </span>
      {expandable && onToggle && (
        <button
          onClick={onToggle}
          className="text-xs text-primary hover:underline font-medium ml-auto flex items-center gap-1"
        >
          [View all <Chevron className="w-3 h-3" />]
        </button>
      )}
    </div>
  );
}

function DetailsList({ details, navigate, labelClass }: {
  details: ControlDetail[];
  navigate: ReturnType<typeof useNavigate>;
  labelClass?: string;
}) {
  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, ControlDetail[]>();
    for (const d of details) {
      const key = d.sectionName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return Array.from(map.entries());
  }, [details]);

  return (
    <div className="ml-8 mb-2 space-y-2 border-l-2 border-border pl-4">
      {grouped.map(([section, items]) => (
        <div key={section}>
          <p className={cn("text-xs font-semibold mb-1", labelClass)}>{section}</p>
          <div className="space-y-0.5">
            {items.map((item, i) => (
              <div key={`${item.dealerId}-${item.controlName}-${i}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate max-w-[180px]">{item.controlName}</span>
                <span className="text-foreground/50">·</span>
                <button
                  onClick={() => navigate(`/tcg/dealers/${item.dealerId}`)}
                  className="text-primary hover:underline truncate max-w-[160px]"
                >
                  {item.dealerName}
                </button>
                <span className="text-foreground/50">·</span>
                <span className={cn("font-medium", labelClass)}>
                  {item.daysUntilDue <= 0
                    ? `${Math.abs(item.daysUntilDue)}d overdue`
                    : `${item.daysUntilDue}d left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
