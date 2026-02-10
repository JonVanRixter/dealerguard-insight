import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, AlertTriangle, CalendarCheck, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getUrgentRechecks, RecheckItem } from "@/utils/recheckSchedule";

export const RecheckWidget = () => {
  const navigate = useNavigate();

  const items = useMemo(() => getUrgentRechecks(new Date(), 8), []);
  const overdueCount = items.filter((i) => i.status === "overdue").length;
  const dueSoonCount = items.filter((i) => i.status === "due-soon").length;

  if (items.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Re-Check Schedule</h3>
        </div>
        <div className="flex gap-1.5">
          {overdueCount > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              {overdueCount} overdue
            </Badge>
          )}
          {dueSoonCount > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-rag-amber text-rag-amber">
              {dueSoonCount} due soon
            </Badge>
          )}
        </div>
      </div>
      <div className="divide-y divide-border">
        {items.map((item, i) => (
          <div
            key={`${item.dealerName}-${item.recheckMonth}`}
            className="px-5 py-3 flex items-center gap-3 opacity-0 animate-fade-in cursor-pointer hover:bg-muted/50 transition-colors"
            style={{ animationDelay: `${i * 40}ms`, animationFillMode: "forwards" }}
            onClick={() => navigate(`/dealer/${encodeURIComponent(item.dealerName)}`)}
          >
            <div className="shrink-0">
              {item.status === "overdue" ? (
                <AlertTriangle className="w-4 h-4 text-rag-red" />
              ) : (
                <Clock className="w-4 h-4 text-rag-amber" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {item.dealerName}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.recheckMonth}-month re-check · {item.recheckDate.toLocaleDateString()}
              </p>
            </div>
            <div className="shrink-0 text-right">
              {item.status === "overdue" ? (
                <span className="text-xs font-medium text-rag-red">
                  {item.daysOverdue}d overdue
                </span>
              ) : (
                <span className="text-xs text-rag-amber">
                  {Math.abs(item.daysOverdue)}d left
                </span>
              )}
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
