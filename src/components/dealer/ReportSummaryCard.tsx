import { RagBadge } from "@/components/RagBadge";
import { AuditSection } from "@/data/auditFramework";
import { RagStatus } from "@/data/dealers";

interface ReportSummaryCardProps {
  sections: AuditSection[];
  overallRag: RagStatus;
  overallScore: number;
}

export function ReportSummaryCard({ sections, overallRag, overallScore }: ReportSummaryCardProps) {
  // Calculate totals
  const totals = sections.reduce(
    (acc, section) => ({
      green: acc.green + section.summary.green,
      amber: acc.amber + section.summary.amber,
      red: acc.red + section.summary.red,
    }),
    { green: 0, amber: 0, red: 0 }
  );

  const totalControls = totals.green + totals.amber + totals.red;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Report Summary</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Overall:</span>
          <RagBadge status={overallRag} />
          <span className="text-sm font-semibold text-foreground">{overallScore}%</span>
        </div>
      </div>

      {/* Section breakdown table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left px-5 py-3 font-medium">Section</th>
              <th className="text-center px-3 py-3 font-medium w-16">
                <span className="inline-block w-2 h-2 rounded-full bg-rag-green" />
              </th>
              <th className="text-center px-3 py-3 font-medium w-16">
                <span className="inline-block w-2 h-2 rounded-full bg-rag-amber" />
              </th>
              <th className="text-center px-3 py-3 font-medium w-16">
                <span className="inline-block w-2 h-2 rounded-full bg-rag-red" />
              </th>
              <th className="text-center px-3 py-3 font-medium w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr
                key={section.id}
                className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
              >
                <td className="px-5 py-3 font-medium text-foreground">{section.name}</td>
                <td className="px-3 py-3 text-center text-rag-green font-semibold">
                  {section.summary.green}
                </td>
                <td className="px-3 py-3 text-center text-rag-amber font-semibold">
                  {section.summary.amber}
                </td>
                <td className="px-3 py-3 text-center text-rag-red font-semibold">
                  {section.summary.red}
                </td>
                <td className="px-3 py-3 text-center">
                  <RagBadge status={section.summary.ragStatus} size="sm" />
                </td>
              </tr>
            ))}
            {/* Totals row */}
            <tr className="bg-muted/50 font-semibold">
              <td className="px-5 py-3 text-foreground">
                Total ({totalControls} controls)
              </td>
              <td className="px-3 py-3 text-center text-rag-green">{totals.green}</td>
              <td className="px-3 py-3 text-center text-rag-amber">{totals.amber}</td>
              <td className="px-3 py-3 text-center text-rag-red">{totals.red}</td>
              <td className="px-3 py-3 text-center">
                <RagBadge status={overallRag} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
