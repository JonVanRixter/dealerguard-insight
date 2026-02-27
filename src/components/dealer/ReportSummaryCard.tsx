import { AuditSection } from "@/data/auditFramework";

interface ReportSummaryCardProps {
  sections: AuditSection[];
  overallScore: number;
}

export function ReportSummaryCard({ sections, overallScore }: ReportSummaryCardProps) {
  const totals = sections.reduce(
    (acc, section) => ({
      pass: acc.pass + section.summary.pass,
      attention: acc.attention + section.summary.attention,
      fail: acc.fail + section.summary.fail,
    }),
    { pass: 0, attention: 0, fail: 0 }
  );

  const totalControls = totals.pass + totals.attention + totals.fail;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Report Summary</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Section-by-section compliance breakdown</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Overall:</span>
          <span className="text-sm font-semibold text-foreground">{overallScore} / 100</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left px-5 py-3.5 font-medium">Section</th>
              <th className="text-center px-3 py-3.5 font-medium w-16">Pass</th>
              <th className="text-center px-3 py-3.5 font-medium w-16">Attention</th>
              <th className="text-center px-3 py-3.5 font-medium w-16">Fail</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr
                key={section.id}
                className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
              >
                <td className="px-5 py-3.5 font-medium text-foreground">{section.name}</td>
                <td className="px-3 py-3.5 text-center text-foreground font-semibold">
                  {section.summary.pass}
                </td>
                <td className="px-3 py-3.5 text-center text-muted-foreground font-semibold">
                  {section.summary.attention}
                </td>
                <td className="px-3 py-3.5 text-center text-muted-foreground font-semibold">
                  {section.summary.fail}
                </td>
              </tr>
            ))}
            <tr className="bg-muted/50 font-semibold">
              <td className="px-5 py-3.5 text-foreground">
                Total ({totalControls} controls)
              </td>
              <td className="px-3 py-3.5 text-center text-foreground">{totals.pass}</td>
              <td className="px-3 py-3.5 text-center text-muted-foreground">{totals.attention}</td>
              <td className="px-3 py-3.5 text-center text-muted-foreground">{totals.fail}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
