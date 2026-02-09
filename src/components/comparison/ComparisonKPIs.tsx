import { DealerBenchmarkData } from "@/pages/Comparison";
import { TrendingUp, TrendingDown, Minus, Target, BarChart3, Award } from "lucide-react";
import { RagBadge } from "@/components/RagBadge";

interface ComparisonKPIsProps {
  data: DealerBenchmarkData;
}

export function ComparisonKPIs({ data }: ComparisonKPIsProps) {
  const sectionsAbove = data.sectionBenchmarks.filter((s) => s.difference > 0).length;
  const sectionsBelow = data.sectionBenchmarks.filter((s) => s.difference < 0).length;

  const comparisonLabel = data.mode === "dealer" ? data.comparisonName : "Portfolio Avg";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Dealer A Score */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <Target className="w-4 h-4" />
          {data.dealerName.split(" ").slice(0, 2).join(" ")}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-foreground">{data.dealerScore}%</span>
          <RagBadge status={data.dealerRag} size="sm" />
        </div>
      </div>

      {/* Comparison Score */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <BarChart3 className="w-4 h-4" />
          vs {comparisonLabel.split(" ").slice(0, 2).join(" ")}
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground">
            {data.scoreDifference > 0 ? "+" : ""}
            {data.scoreDifference}%
          </span>
          {data.scoreDifference > 0 ? (
            <TrendingUp className="w-5 h-5 text-rag-green mb-1" />
          ) : data.scoreDifference < 0 ? (
            <TrendingDown className="w-5 h-5 text-rag-red mb-1" />
          ) : (
            <Minus className="w-5 h-5 text-muted-foreground mb-1" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {comparisonLabel}: {data.comparisonScore}%
        </p>
      </div>

      {/* Sections Above */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <Award className="w-4 h-4" />
          Sections Ahead
        </div>
        <span className="text-3xl font-bold text-rag-green">{sectionsAbove}</span>
        <span className="text-lg text-muted-foreground ml-1">
          / {data.sectionBenchmarks.length}
        </span>
      </div>

      {/* Sections Below */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <TrendingDown className="w-4 h-4" />
          Sections Behind
        </div>
        <span
          className={`text-3xl font-bold ${
            sectionsBelow > 0 ? "text-rag-red" : "text-foreground"
          }`}
        >
          {sectionsBelow}
        </span>
        <span className="text-lg text-muted-foreground ml-1">
          / {data.sectionBenchmarks.length}
        </span>
      </div>
    </div>
  );
}
