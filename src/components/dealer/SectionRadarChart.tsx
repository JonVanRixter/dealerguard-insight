import { useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { AuditSection } from "@/data/auditFramework";

interface SectionRadarChartProps {
  sections: AuditSection[];
}

export function SectionRadarChart({ sections }: SectionRadarChartProps) {
  const data = useMemo(() => {
    return sections.map((s) => {
      const total = s.summary.green + s.summary.amber + s.summary.red;
      const score = total > 0 ? Math.round((s.summary.green / total) * 100) : 0;
      // Short label for radar axis
      const shortName =
        s.name.length > 16 ? s.name.slice(0, 14) + "…" : s.name;
      return { name: shortName, fullName: s.name, score };
    });
  }, [sections]);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Section Compliance Profile
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            tickCount={5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value}%`, "Compliance"]}
            labelFormatter={(_label: string, payload: any[]) =>
              payload?.[0]?.payload?.fullName ?? _label
            }
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
