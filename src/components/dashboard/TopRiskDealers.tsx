import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { dealers } from "@/data/dealers";
import { RagBadge } from "@/components/RagBadge";
import { ShieldAlert, ChevronRight } from "lucide-react";

export function TopRiskDealers() {
  const navigate = useNavigate();

  const topRisk = useMemo(
    () => [...dealers].sort((a, b) => a.score - b.score).slice(0, 5),
    []
  );

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-rag-red" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Highest-Risk Dealers</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Bottom 5 by compliance score</p>
        </div>
      </div>
      <div className="divide-y divide-border">
        {topRisk.map((dealer, i) => (
          <button
            key={dealer.name}
            onClick={() => navigate(`/dealer/${encodeURIComponent(dealer.name)}`)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors text-left opacity-0 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{dealer.name}</p>
                <p className="text-xs text-muted-foreground">{dealer.region}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold text-foreground">{dealer.score}%</span>
              <RagBadge status={dealer.rag} size="sm" />
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
