import { DealerBenchmarkData } from "@/pages/Comparison";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ComparisonRadarProps {
  data: DealerBenchmarkData;
}

export function ComparisonRadar({ data }: ComparisonRadarProps) {
  const radarData = data.sectionBenchmarks.map((section) => ({
    section: section.shortName,
    dealer: section.dealerPassRate,
    portfolio: section.portfolioPassRate,
    fullMark: 100,
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Section Performance Comparison
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="section"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              name="Dealer"
              dataKey="dealer"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.4}
            />
            <Radar
              name="Portfolio Avg"
              dataKey="portfolio"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.2}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
