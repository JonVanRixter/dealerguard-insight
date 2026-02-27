import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AuditSection } from "@/data/auditFramework";

interface ControlsBreakdownChartProps {
  sections: AuditSection[];
}

export function ControlsBreakdownChart({ sections }: ControlsBreakdownChartProps) {
  const data = useMemo(() => {
    return sections.map((s) => {
      const shortName =
        s.name.length > 14 ? s.name.slice(0, 12) + "…" : s.name;
      return {
        name: shortName,
        fullName: s.name,
        Pass: s.summary.green,
        Attention: s.summary.amber,
        Fail: s.summary.red,
      };
    });
  }, [sections]);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Controls Breakdown by Section
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 16, top: 4, bottom: 4 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis
            type="category"
            dataKey="name"
            width={95}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: 12,
            }}
            labelFormatter={(_label: string, payload: any[]) =>
              payload?.[0]?.payload?.fullName ?? _label
            }
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Bar dataKey="Pass" stackId="a" fill="hsl(var(--outcome-pass))" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Attention" stackId="a" fill="hsl(var(--outcome-pending))" />
          <Bar dataKey="Fail" stackId="a" fill="hsl(var(--outcome-fail))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
