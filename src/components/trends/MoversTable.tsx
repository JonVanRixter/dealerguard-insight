import { DealerTrend } from "@/data/trendData";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RagBadge } from "@/components/RagBadge";

interface MoversTableProps {
  improvers: DealerTrend[];
  decliners: DealerTrend[];
}

export function MoversTable({ improvers, decliners }: MoversTableProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Improvers */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rag-green" />
            <h3 className="text-sm font-semibold text-foreground">Top Improvers</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Biggest score gains over 12 months</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-5 py-2.5 font-medium">Dealer</th>
                <th className="text-center px-3 py-2.5 font-medium">Current</th>
                <th className="text-center px-3 py-2.5 font-medium">Change</th>
                <th className="text-center px-3 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {improvers.map((d) => (
                <tr key={d.dealerName} className="border-b border-border last:border-0">
                  <td className="px-5 py-2.5 font-medium text-foreground">{d.dealerName}</td>
                  <td className="px-3 py-2.5 text-center font-semibold">{d.currentScore}%</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="text-rag-green font-semibold">+{d.changeFromStart}%</span>
                  </td>
                  <td className="px-3 py-2.5 flex justify-center">
                    <RagBadge status={d.currentRag} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Decliners */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rag-red" />
            <h3 className="text-sm font-semibold text-foreground">Top Decliners</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Biggest score drops over 12 months</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-5 py-2.5 font-medium">Dealer</th>
                <th className="text-center px-3 py-2.5 font-medium">Current</th>
                <th className="text-center px-3 py-2.5 font-medium">Change</th>
                <th className="text-center px-3 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {decliners.map((d) => (
                <tr key={d.dealerName} className="border-b border-border last:border-0">
                  <td className="px-5 py-2.5 font-medium text-foreground">{d.dealerName}</td>
                  <td className="px-3 py-2.5 text-center font-semibold">{d.currentScore}%</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`font-semibold ${d.changeFromStart < 0 ? "text-rag-red" : "text-muted-foreground"}`}>
                      {d.changeFromStart > 0 ? "+" : ""}{d.changeFromStart}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 flex justify-center">
                    <RagBadge status={d.currentRag} size="sm" />
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
