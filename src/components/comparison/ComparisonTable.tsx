import { DealerBenchmarkData } from "@/pages/Comparison";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparisonTableProps {
  data: DealerBenchmarkData;
}

export function ComparisonTable({ data }: ComparisonTableProps) {
  const comparisonLabel = data.mode === "dealer" ? data.comparisonName.split(" ").slice(0, 2).join(" ") : "Portfolio Avg";

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          Detailed Section Comparison
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pass rates compared against {data.mode === "dealer" ? comparisonLabel : "portfolio average"} for each audit section
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left px-5 py-3 font-medium">Section</th>
              <th className="text-center px-3 py-3 font-medium">{data.dealerName.split(" ").slice(0, 2).join(" ")}</th>
              <th className="text-center px-3 py-3 font-medium">{comparisonLabel}</th>
              <th className="text-center px-3 py-3 font-medium">Difference</th>
              <th className="text-center px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.sectionBenchmarks.map((section) => (
              <tr key={section.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-foreground">{section.name}</td>
                <td className="px-3 py-3 text-center">
                  <span className="font-semibold text-foreground">{section.dealerPassRate}%</span>
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {section.comparisonPassRate}%
                </td>
                <td className="px-3 py-3 text-center">
                  <span
                    className={`font-semibold ${
                      section.difference > 0
                        ? "text-rag-green"
                        : section.difference < 0
                        ? "text-rag-red"
                        : "text-muted-foreground"
                    }`}
                  >
                    {section.difference > 0 ? "+" : ""}{section.difference}%
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-center">
                    {section.difference > 5 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-rag-green/10 text-rag-green">
                        <TrendingUp className="w-3 h-3" />
                        Ahead
                      </span>
                    ) : section.difference < -5 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-rag-red/10 text-rag-red">
                        <TrendingDown className="w-3 h-3" />
                        Behind
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        <Minus className="w-3 h-3" />
                        On Par
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
