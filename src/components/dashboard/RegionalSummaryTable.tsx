import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { dealers } from "@/data/dealers";
import { RagBadge } from "@/components/RagBadge";
import type { RagStatus } from "@/data/dealers";

interface RegionStat {
  region: string;
  count: number;
  avgScore: number;
  rag: RagStatus;
  green: number;
  amber: number;
  red: number;
}

function getRag(score: number): RagStatus {
  if (score >= 80) return "green";
  if (score >= 55) return "amber";
  return "red";
}

export function RegionalSummaryTable() {
  const navigate = useNavigate();
  const regions = useMemo<RegionStat[]>(() => {
    const map = new Map<string, typeof dealers>();
    dealers.forEach(d => {
      const arr = map.get(d.region) || [];
      arr.push(d);
      map.set(d.region, arr);
    });

    return [...map.entries()]
      .map(([region, dls]) => {
        const avgScore = Math.round(dls.reduce((s, d) => s + d.score, 0) / dls.length);
        return {
          region,
          count: dls.length,
          avgScore,
          rag: getRag(avgScore),
          green: dls.filter(d => d.rag === "green").length,
          amber: dls.filter(d => d.rag === "amber").length,
          red: dls.filter(d => d.rag === "red").length,
        };
      })
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 10);
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Lowest Scoring Regions</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Bottom 10 regions by average compliance score</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left px-4 py-2.5 font-medium text-xs">Region</th>
              <th className="text-center px-3 py-2.5 font-medium text-xs">Dealers</th>
              <th className="text-center px-3 py-2.5 font-medium text-xs">Avg Score</th>
              <th className="text-center px-3 py-2.5 font-medium text-xs">Status</th>
              <th className="text-center px-3 py-2.5 font-medium text-xs hidden sm:table-cell">G / A / R</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((r, i) => (
              <tr
                key={r.region}
                className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors opacity-0 animate-fade-in"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "forwards" }}
                onClick={() => navigate(`/dealers?region=${encodeURIComponent(r.region)}`)}
              >
                <td className="px-4 py-2.5 font-medium text-foreground">{r.region}</td>
                <td className="px-3 py-2.5 text-center text-muted-foreground">{r.count}</td>
                <td className="px-3 py-2.5 text-center font-semibold text-foreground">{r.avgScore}%</td>
                <td className="px-3 py-2.5 text-center"><RagBadge status={r.rag} size="sm" /></td>
                <td className="px-3 py-2.5 text-center text-xs hidden sm:table-cell">
                  <span className="text-rag-green">{r.green}</span>
                  {" / "}
                  <span className="text-rag-amber">{r.amber}</span>
                  {" / "}
                  <span className="text-rag-red">{r.red}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
