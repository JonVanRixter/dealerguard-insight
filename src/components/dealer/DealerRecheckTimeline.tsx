import { useMemo } from "react";
import { CalendarCheck, AlertTriangle, Clock, CheckCircle2, Check, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDealerRechecks, RecheckItem } from "@/utils/recheckSchedule";
import { useCompletedRechecks } from "@/hooks/useCompletedRechecks";

interface DealerRecheckTimelineProps {
  dealerName: string;
  dealerRag: string;
}

export const DealerRecheckTimeline = ({ dealerName, dealerRag }: DealerRecheckTimelineProps) => {
  const rechecks = useMemo(() => getDealerRechecks(dealerName), [dealerName]);
  const { isCompleted, markComplete, undoComplete } = useCompletedRechecks();

  if (dealerRag !== "green" || rechecks.length === 0) return null;

  const overdueCount = rechecks.filter((r) => r.isOverdue && !isCompleted(dealerName, r.recheckMonth)).length;

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
          <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />
          <div className="space-y-4">
            {rechecks
              .sort((a, b) => a.recheckMonth - b.recheckMonth)
              .map((item) => {
                const completed = isCompleted(dealerName, item.recheckMonth);
                return (
                  <div key={item.recheckMonth} className="flex items-start gap-4 relative">
                    <div className="relative z-10 shrink-0">
                      {completed ? (
                        <div className="w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                      ) : item.status === "overdue" ? (
                        <div className="w-6 h-6 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center">
                          <AlertTriangle className="w-3 h-3 text-destructive" />
                        </div>
                      ) : item.status === "due-soon" ? (
                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-muted-foreground flex items-center justify-center">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {item.recheckMonth}-Month Re-Check
                        </span>
                        {completed && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">
                            Completed
                          </Badge>
                        )}
                        {!completed && item.status === "overdue" && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            {item.daysOverdue}d overdue
                          </Badge>
                        )}
                        {!completed && item.status === "due-soon" && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-muted-foreground text-muted-foreground">
                            {Math.abs(item.daysOverdue)}d remaining
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due: {item.recheckDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {completed ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground"
                          onClick={() => undoComplete(dealerName, item.recheckMonth)}
                        >
                          <Undo2 className="w-3 h-3 mr-1" /> Undo
                        </Button>
                      ) : (item.status === "overdue" || item.status === "due-soon") ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => markComplete(dealerName, item.recheckMonth)}
                        >
                          <Check className="w-3 h-3 mr-1" /> Complete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
