import { useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CalendarDays, ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getControlCadence, type CheckCadenceInfo } from "@/utils/auditCheckCadence";
import auditCheckSchedule from "@/data/tcg/auditCheckSchedule.json";
import { tcgDealers } from "@/data/tcg/dealers";
import { cn } from "@/lib/utils";

interface ControlRow {
  dealerId: string;
  dealerName: string;
  sectionName: string;
  controlName: string;
  frequency: string;
  lastCheckedLabel: string;
  daysUntilDue: number;
  status: CheckCadenceInfo["status"];
}

const FILTER_CONFIG: Record<string, { label: string; description: string; icon: string; match: (c: CheckCadenceInfo) => boolean; className: string }> = {
  overdue: {
    label: "Overdue Checks",
    description: "Controls that have passed their due date and require immediate attention.",
    icon: "🔴",
    match: (c) => c.daysUntilDue <= 0,
    className: "text-[hsl(0,84%,60%)]",
  },
  urgent: {
    label: "Due Within 10 Days",
    description: "Controls approaching their deadline that should be prioritised this week.",
    icon: "🔴",
    match: (c) => c.daysUntilDue > 0 && c.status === "red",
    className: "text-[hsl(0,84%,60%)]",
  },
  "due-soon": {
    label: "Due Within 30 Days",
    description: "Controls due in the next month — plan these into upcoming review cycles.",
    icon: "🟡",
    match: (c) => c.status === "amber",
    className: "text-[hsl(38,92%,50%)]",
  },
};

const ScheduleHealthDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "overdue";
  const config = FILTER_CONFIG[filter] || FILTER_CONFIG.overdue;

  const rows = useMemo(() => {
    const result: ControlRow[] = [];
    for (const dealer of tcgDealers) {
      for (const section of auditCheckSchedule) {
        for (const ctrl of section.controls) {
          const cadence = getControlCadence(dealer.name, section.sectionName, ctrl.name, ctrl.id);
          if (!cadence || !config.match(cadence)) continue;
          result.push({
            dealerId: dealer.id,
            dealerName: dealer.name,
            sectionName: section.sectionName,
            controlName: ctrl.name.split("—")[0].trim(),
            frequency: cadence.frequency,
            lastCheckedLabel: cadence.lastCheckedLabel,
            daysUntilDue: cadence.daysUntilDue,
            status: cadence.status,
          });
        }
      }
    }
    result.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    return result;
  }, [filter]);

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, ControlRow[]>();
    for (const r of rows) {
      if (!map.has(r.sectionName)) map.set(r.sectionName, []);
      map.get(r.sectionName)!.push(r);
    }
    return Array.from(map.entries());
  }, [rows]);

  const uniqueDealers = new Set(rows.map((r) => r.dealerId)).size;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                {config.icon} {config.label}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Summary strip */}
        <div className="flex gap-4">
          <div className="bg-card rounded-xl border border-border px-5 py-3 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Controls</span>
            <span className={cn("text-2xl font-bold", config.className)}>{rows.length}</span>
          </div>
          <div className="bg-card rounded-xl border border-border px-5 py-3 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Dealers affected</span>
            <span className={cn("text-2xl font-bold", config.className)}>{uniqueDealers}</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {Object.entries(FILTER_CONFIG).map(([key, cfg]) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              size="sm"
              onClick={() => navigate(`/schedule-health?filter=${key}`)}
              className="gap-1.5"
            >
              <span>{cfg.icon}</span>
              {cfg.label}
            </Button>
          ))}
        </div>

        {/* Grouped sections */}
        {grouped.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No controls match this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([section, items]) => (
              <div key={section} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{section}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {items.length} control{items.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left px-4 py-2.5 font-medium">Control</th>
                        <th className="text-left px-4 py-2.5 font-medium">Dealer</th>
                        <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Frequency</th>
                        <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">Last Checked</th>
                        <th className="text-right px-4 py-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr
                          key={`${item.dealerId}-${item.controlName}-${i}`}
                          className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/tcg/dealers/${item.dealerId}`)}
                        >
                          <td className="px-4 py-2.5 font-medium text-foreground">{item.controlName}</td>
                          <td className="px-4 py-2.5">
                            <span className="text-primary hover:underline flex items-center gap-1">
                              {item.dealerName}
                              <ExternalLink className="w-3 h-3 opacity-50" />
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{item.frequency}</td>
                          <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell">{item.lastCheckedLabel}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                item.daysUntilDue <= 0
                                  ? "bg-[hsl(0,84%,60%)]/10 text-[hsl(0,84%,60%)] border-[hsl(0,84%,60%)]/20"
                                  : item.status === "red"
                                    ? "bg-[hsl(0,84%,60%)]/10 text-[hsl(0,84%,60%)] border-[hsl(0,84%,60%)]/20"
                                    : "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%)]/20"
                              )}
                            >
                              {item.daysUntilDue <= 0
                                ? `${Math.abs(item.daysUntilDue)}d overdue`
                                : `${item.daysUntilDue}d remaining`}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ScheduleHealthDetail;
