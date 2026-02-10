import { useNavigate } from "react-router-dom";
import { Copy, XCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DuplicateGroup, MATCH_TYPE_LABELS } from "@/utils/duplicateDetection";
import { useDismissedDuplicates } from "@/hooks/useDismissedDuplicates";

interface DuplicateFlagsBannerProps {
  /** Maximum groups to show */
  limit?: number;
  /** Compact mode for Alerts page */
  compact?: boolean;
}

export const DuplicateFlagsBanner = ({ limit = 10, compact = false }: DuplicateFlagsBannerProps) => {
  const navigate = useNavigate();
  const { activeDuplicates, dismiss } = useDismissedDuplicates();

  if (activeDuplicates.length === 0) return null;

  const displayed = activeDuplicates.slice(0, limit);

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Copy className="w-4 h-4 text-rag-amber" />
          <h3 className="text-sm font-semibold text-foreground">Potential Duplicates</h3>
        </div>
        <Badge variant="outline" className="text-xs border-rag-amber text-rag-amber">
          {activeDuplicates.length} flagged
        </Badge>
      </div>
      <div className="divide-y divide-border">
        {displayed.map((group) => (
          <div key={group.key} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px]">
                  {MATCH_TYPE_LABELS[group.matchType]}
                </Badge>
                <span className="text-xs text-muted-foreground truncate">
                  {group.matchValue}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {group.dealers.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => navigate(`/dealer/${encodeURIComponent(d.name)}`)}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {d.name}
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismiss(group.key)}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> Dismiss
            </Button>
          </div>
        ))}
      </div>
      {activeDuplicates.length > limit && (
        <div className="px-5 py-3 border-t border-border text-center">
          <span className="text-xs text-muted-foreground">
            +{activeDuplicates.length - limit} more duplicate flags
          </span>
        </div>
      )}
    </div>
  );
};
