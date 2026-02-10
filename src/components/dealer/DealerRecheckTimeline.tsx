import { useMemo } from "react";
import { CalendarCheck, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDealerRechecks, RecheckItem } from "@/utils/recheckSchedule";

interface DealerRecheckTimelineProps {
  dealerName: string;
  dealerRag: string;
}

export const DealerRecheckTimeline = ({ dealerName, dealerRag }: DealerRecheckTimelineProps) => {
  const rechecks = useMemo(() => getDealerRechecks(dealerName), [dealerName]);

  // Only show for Green-status dealers
  if (dealerRag !== "green" || rechecks.length === 0) return null;

  const overdueCount = rechecks.filter((r) => r.isOverdue).length;

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Re-Check Schedule</h3>
        </div>
        {overdueCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {overdueCount} overdue
          </Badge>
        )}
      </div>
      <div className="px-5 py-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />

          <div className="space-y-4">
            {rechecks
              .sort((a, b) => a.recheckMonth - b.recheckMonth)
              .map((item) => (
                <div key={item.recheckMonth} className="flex items-start gap-4 relative">
                  {/* Timeline dot */}
                  <div className="relative z-10 shrink-0">
                    {item.status === "overdue" ? (
                      <div className="w-6 h-6 rounded-full bg-rag-red/10 border-2 border-rag-red flex items-center justify-center">
                        <AlertTriangle className="w-3 h-3 text-rag-red" />
                      </div>
                    ) : item.status === "due-soon" ? (
                      <div className="w-6 h-6 rounded-full bg-rag-amber/10 border-2 border-rag-amber flex items-center justify-center">
                        <Clock className="w-3 h-3 text-rag-amber" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {item.recheckMonth}-Month Re-Check
                      </span>
                      {item.status === "overdue" && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          {item.daysOverdue}d overdue
                        </Badge>
                      )}
                      {item.status === "due-soon" && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-rag-amber text-rag-amber">
                          {Math.abs(item.daysOverdue)}d remaining
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due: {item.recheckDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
