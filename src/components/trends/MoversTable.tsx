import { useNavigate } from "react-router-dom";
import { DealerTrend } from "@/data/trendData";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface MoversTableProps {
  improvers: DealerTrend[];
  decliners: DealerTrend[];
}

export function MoversTable({ improvers, decliners }: MoversTableProps) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Compliance Leaders */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Compliance Leaders</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Dealerships with biggest score improvements over 12 months</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-semibold text-foreground">Dealership Name</th>
                <th className="text-center px-3 py-3 font-semibold text-foreground">Current</th>
                <th className="text-center px-3 py-3 font-semibold text-foreground">Change</th>
              </tr>
            </thead>
            <tbody>
              {improvers.map((d) => (
                <tr key={d.dealerName} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-2.5 font-medium">
                    <button
                      onClick={() => navigate(`/dealer/${encodeURIComponent(d.dealerName)}`)}
                      className="text-primary hover:underline text-left"
                    >
                      {d.dealerName}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold">{d.currentScore}%</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="text-foreground font-semibold flex items-center justify-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +{d.changeFromStart}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dealerships Requiring Attention */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Dealerships Requiring Attention</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Dealerships with declining compliance scores over 12 months</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-semibold text-foreground">Dealership Name</th>
                <th className="text-center px-3 py-3 font-semibold text-foreground">Current</th>
                <th className="text-center px-3 py-3 font-semibold text-foreground">Change</th>
              </tr>
            </thead>
            <tbody>
              {decliners.map((d) => (
                <tr key={d.dealerName} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-2.5 font-medium">
                    <button
                      onClick={() => navigate(`/dealer/${encodeURIComponent(d.dealerName)}`)}
                      className="text-primary hover:underline text-left"
                    >
                      {d.dealerName}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold">{d.currentScore}%</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="font-semibold flex items-center justify-center gap-1 text-muted-foreground">
                      {d.changeFromStart < 0 && <TrendingDown className="w-3.5 h-3.5" />}
                      {d.changeFromStart > 0 ? "+" : ""}{d.changeFromStart}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
