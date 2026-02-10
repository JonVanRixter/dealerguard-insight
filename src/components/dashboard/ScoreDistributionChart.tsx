import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { dealers } from "@/data/dealers";

const BUCKETS = [
  { label: "0–39", min: 0, max: 39, color: "hsl(0, 84%, 60%)" },
  { label: "40–54", min: 40, max: 54, color: "hsl(0, 84%, 60%)" },
  { label: "55–69", min: 55, max: 69, color: "hsl(38, 92%, 50%)" },
  { label: "70–79", min: 70, max: 79, color: "hsl(38, 92%, 50%)" },
  { label: "80–89", min: 80, max: 89, color: "hsl(142, 71%, 45%)" },
  { label: "90–100", min: 90, max: 100, color: "hsl(142, 71%, 45%)" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-foreground">
          {payload[0].payload.label}: {payload[0].value} dealers
        </p>
      </div>
    );
  }
  return null;
};

export function ScoreDistributionChart() {
  const data = useMemo(() => {
    return BUCKETS.map(bucket => ({
      label: bucket.label,
      count: dealers.filter(d => d.score >= bucket.min && d.score <= bucket.max).length,
      color: bucket.color,
    }));
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Score Distribution</h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
