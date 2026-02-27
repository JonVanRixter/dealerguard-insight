import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { KeyAction } from "@/data/auditFramework";

interface ActionStatusChartProps {
  actions: KeyAction[];
}

const STATUS_COLORS: Record<string, string> = {
  Complete: "hsl(var(--rag-green))",
  "In Progress": "hsl(var(--primary))",
  BAU: "hsl(142, 50%, 60%)",
  Pending: "hsl(var(--rag-amber))",
  Planned: "hsl(var(--muted-foreground))",
  Optional: "hsl(var(--border))",
};

export function ActionStatusChart({ actions }: ActionStatusChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    actions.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [actions]);

  const priorityCounts = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    actions.forEach((a) => {
      counts[a.priority] = (counts[a.priority] || 0) + 1;
    });
    return counts;
  }, [actions]);

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex-1 flex flex-col">
      <h3 className="text-sm font-semibold text-foreground mb-2">
        Action Status Overview
      </h3>
      <div className="flex flex-col items-center gap-3 flex-1">
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={54}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name] || "hsl(var(--muted))"}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Status legend */}
        <div className="w-full grid grid-cols-2 gap-x-4 gap-y-1.5">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[entry.name] || "hsl(var(--muted))" }}
              />
              <span className="text-muted-foreground truncate">{entry.name}</span>
              <span className="font-semibold text-foreground ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>

        {/* Priority summary */}
        <div className="w-full border-t border-border pt-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            By Priority
          </p>
          <div className="flex gap-3">
            <span className="text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-rag-red mr-1" />
              High: <span className="font-semibold text-foreground">{priorityCounts.High}</span>
            </span>
            <span className="text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-rag-amber mr-1" />
              Med: <span className="font-semibold text-foreground">{priorityCounts.Medium}</span>
            </span>
            <span className="text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-rag-green mr-1" />
              Low: <span className="font-semibold text-foreground">{priorityCounts.Low}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
