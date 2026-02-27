import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, CreditCard } from "lucide-react";

interface CreditSafeData {
  companyName: string;
  companyNumber: string;
  creditScore: number;
  creditRating: string;
  creditLimit: number;
  riskCategory: string;
  paymentIndex: number;
  ccjs: { count: number; totalValue: number; mostRecent: string | null };
  paymentHistory: { period: string; onTimePayments: string; latePayments: string; missedPayments: string }[];
  legalFilings: string[] | { type: string; date: string; status: string }[];
  insolvencyHistory: string[] | { type: string; date: string; status: string }[];
  directorSanctionsScreening: { directorName: string; sanctionsResult: string; pepResult: string; adverseMediaResult: string; screeningDate: string }[];
  overallResult: string;
  flags: string[];
}

interface Props {
  data: CreditSafeData;
  onAddToReviewQueue?: () => void;
}

export function CreditSafePanel({ data, onAddToReviewQueue }: Props) {
  const isPass = data.overallResult === "Pass";
  const hasFlags = data.flags.length > 0;
  const riskColor = data.riskCategory === "Low Risk"
    ? "text-outcome-pass-text"
    : data.riskCategory === "High Risk"
      ? "text-outcome-fail-text"
      : "text-outcome-pending-text";

  return (
    <Card className="border-border relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-5 h-5 text-primary" />
            CREDITSAFE
          </CardTitle>
          <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-muted-foreground/30 bg-muted/50">
            SIMULATED DATA
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{data.companyName} · No. {data.companyNumber}</p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Score & limits */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Credit Score:</span>
            <span className="font-bold text-lg">{data.creditScore} / 100</span>
            <Progress value={data.creditScore} className="w-32 h-2.5" />
            <span className="text-muted-foreground">Rating: <span className="font-semibold text-foreground">{data.creditRating}</span></span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><span className="text-muted-foreground">Credit Limit: </span><span className="font-medium">£{data.creditLimit.toLocaleString()}</span></div>
            <div><span className="text-muted-foreground">Risk Category: </span><span className={`font-medium flex items-center gap-1.5 inline-flex ${riskColor}`}><span className="w-2 h-2 rounded-full bg-current inline-block" />{data.riskCategory}</span></div>
            <div><span className="text-muted-foreground">Payment Index: </span><span className="font-medium">{data.paymentIndex} / 100</span></div>
          </div>
        </div>

        {/* CCJs */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">County Court Judgements</p>
          {data.ccjs.count === 0 ? (
            <p className="text-outcome-pass-text">CCJs on record: 0 ✅ None recorded</p>
          ) : (
            <div className="space-y-1">
              <p className="text-outcome-pending-text font-medium">CCJs on record: {data.ccjs.count}</p>
              <p className="text-muted-foreground">Total value: £{data.ccjs.totalValue.toLocaleString()}</p>
              {data.ccjs.mostRecent && <p className="text-muted-foreground">Most recent: {data.ccjs.mostRecent}</p>}
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment History</p>
          <div className="space-y-1">
            {data.paymentHistory.map((ph, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-32 text-muted-foreground">{ph.period}</span>
                <span>On time: {ph.onTimePayments}</span>
                <span>Late: {ph.latePayments}</span>
                <span>Missed: {ph.missedPayments}</span>
                {ph.missedPayments === "0%" && <span className="text-outcome-pass-text text-xs">✅</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Director Sanctions */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Director Sanctions & AML Screening</p>
          <div className="space-y-1.5">
            {data.directorSanctionsScreening.map((ds, i) => {
              const allClear = ds.sanctionsResult === "Clear" && ds.pepResult === "No PEP" && (ds.adverseMediaResult === "None found" || ds.adverseMediaResult === "None");
              return (
                <div key={i} className="flex items-center gap-3 flex-wrap">
                  <span className="font-medium w-44 shrink-0">{ds.directorName}</span>
                  <span className="text-muted-foreground">Sanctions: {ds.sanctionsResult}</span>
                  <span className="text-muted-foreground">PEP: {ds.pepResult}</span>
                  <span className={ds.adverseMediaResult.includes("Minor") || ds.adverseMediaResult.includes("historical") ? "text-outcome-pending-text" : "text-muted-foreground"}>
                    Media: {ds.adverseMediaResult}
                  </span>
                  {allClear && <span className="text-outcome-pass-text text-xs">✅</span>}
                </div>
              );
            })}
            {data.directorSanctionsScreening.length > 0 && (
              <p className="text-muted-foreground text-xs">Screening date: {data.directorSanctionsScreening[0].screeningDate}</p>
            )}
          </div>
        </div>

        {/* Legal/Insolvency */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Legal Filings & Insolvency</p>
          {data.legalFilings.length === 0 && data.insolvencyHistory.length === 0 ? (
            <p className="text-muted-foreground">None recorded</p>
          ) : (
            <div className="space-y-1">
              {data.insolvencyHistory.map((ih, i) => (
                <div key={i} className="flex items-center gap-2 text-outcome-pending-text text-sm">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {typeof ih === "string" ? ih : `${ih.type} — ${ih.date} (${ih.status})`}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Result */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Result</p>
          {isPass && !hasFlags ? (
            <div className="flex items-center gap-2 text-outcome-pass-text font-medium">
              <CheckCircle2 className="w-4 h-4" /> PASS · {data.riskCategory} · No CCJs · Sanctions clear
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-outcome-pending-text font-medium">
                <AlertTriangle className="w-4 h-4" /> REFER FOR REVIEW
              </div>
              {data.flags.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-outcome-pending-text text-sm">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {f}
                </div>
              ))}
              {onAddToReviewQueue && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={onAddToReviewQueue}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Add to Manual Review Queue ↗
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
