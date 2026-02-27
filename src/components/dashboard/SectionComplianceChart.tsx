import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { dealers } from "@/data/dealers";
import { generateDealerAudit, AUDIT_SECTIONS } from "@/data/auditFramework";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SectionComplianceChart() {
  const data = useMemo(() => {
    const sampleDealers = dealers.slice(0, 50);
    const sectionStats = AUDIT_SECTIONS.map(section => ({
      name: section.name.replace("Communications & Complaints", "Comms & Complaints").replace("Financial Crime / Fraud", "Fin Crime"),
      pass: 0,
      attention: 0,
      fail: 0,
    }));

    sampleDealers.forEach((dealer, idx) => {
      const audit = generateDealerAudit(dealer.name, idx);
      audit.sections.forEach((section, sIdx) => {
        if (sIdx < sectionStats.length) {
          if (section.summary.ragStatus === "green") sectionStats[sIdx].pass++;
          else if (section.summary.ragStatus === "amber") sectionStats[sIdx].attention++;
          else sectionStats[sIdx].fail++;
        }
      });
    });

    return sectionStats;
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Section Compliance Breakdown</h3>
      <p className="text-xs text-muted-foreground mb-4">Score distribution across audit sections (sample of 50 dealers)</p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="pass" name="Pass" stackId="a" fill="hsl(var(--primary))" />
            <Bar dataKey="attention" name="Attention" stackId="a" fill="hsl(var(--muted-foreground))" />
            <Bar dataKey="fail" name="Fail" stackId="a" fill="hsl(var(--border))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
