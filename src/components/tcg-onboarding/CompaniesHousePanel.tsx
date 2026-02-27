import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Building2, AlertTriangle, CheckCircle2, ArrowDownToLine } from "lucide-react";
import { format } from "date-fns";

interface CompaniesHouseData {
  companyName: string;
  companyNumber: string;
  companyStatus: string;
  companyType: string;
  incorporationDate: string;
  registeredAddress: string;
  sicCodes: string[];
  confirmationStatementDue: string;
  confirmationStatementOverdue: boolean;
  accountsDue: string;
  accountsOverdue: boolean;
  directors: { name: string; role: string; appointedDate: string; nationality: string; countryOfResidence: string; idCheckDate: string; idCheckStatus: string }[];
  pscs: { name: string; naturesOfControl: string[]; notifiedDate: string }[];
  previousNames: string[];
  filingHistory: { date: string; type: string; description: string }[];
  overallResult: string;
  flags: string[];
}

interface Props {
  data: CompaniesHouseData;
  onPrefill: () => void;
}

function fmtDate(d: string) {
  try { return format(new Date(d), "dd MMM yyyy"); } catch { return d; }
}

export function CompaniesHousePanel({ data, onPrefill }: Props) {
  const hasFlags = data.flags.length > 0;
  const isPass = data.overallResult === "Pass";

  return (
    <Card className="border-border relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-5 h-5 text-primary" />
            COMPANIES HOUSE
          </CardTitle>
          <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-muted-foreground/30 bg-muted/50">
            SIMULATED DATA
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{data.companyName} · No. {data.companyNumber}</p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span className="font-medium flex items-center gap-1.5">{data.companyStatus === "Active" && <span className="w-2 h-2 rounded-full bg-outcome-pass inline-block" />}{data.companyStatus}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="font-medium">{data.companyType}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Incorporated:</span><span className="font-medium">{fmtDate(data.incorporationDate)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Reg. Address:</span><span className="font-medium text-right">{data.registeredAddress}</span></div>
        </div>
        <div>
          <span className="text-muted-foreground">SIC Code: </span>
          <span className="font-medium">{data.sicCodes.join(", ")}</span>
        </div>

        {/* Filings */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Filings</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Confirmation Statement:</span>
              <span>Due {fmtDate(data.confirmationStatementDue)}</span>
              {data.confirmationStatementOverdue
                ? <Badge className="bg-outcome-fail-bg text-outcome-fail-text text-xs">⚠️ Overdue</Badge>
                : <span className="text-outcome-pass-text text-xs">✅ Up to date</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Accounts:</span>
              <span>Due {fmtDate(data.accountsDue)}</span>
              {data.accountsOverdue
                ? <Badge className="bg-outcome-fail-bg text-outcome-fail-text text-xs">⚠️ Overdue</Badge>
                : <span className="text-outcome-pass-text text-xs">✅ Up to date</span>}
            </div>
          </div>
        </div>

        {/* Directors */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Directors</p>
          <div className="space-y-1.5">
            {data.directors.map((d, i) => (
              <div key={i} className="flex items-center gap-3 flex-wrap">
                <span className="font-medium">{d.name}</span>
                <span className="text-muted-foreground">{d.role}</span>
                <span className="text-muted-foreground">Appointed {fmtDate(d.appointedDate)}</span>
                <span>🇬🇧 {d.nationality}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PSCs */}
        {data.pscs.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">PSCs</p>
            <div className="space-y-1.5">
              {data.pscs.map((p, i) => (
                <div key={i} className="flex items-center gap-3 flex-wrap">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.naturesOfControl.join(", ")}</span>
                  <span className="text-muted-foreground">Notified {fmtDate(p.notifiedDate)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Result</p>
          {isPass && !hasFlags ? (
            <div className="flex items-center gap-2 text-outcome-pass-text font-medium">
              <CheckCircle2 className="w-4 h-4" /> PASS · No flags identified
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
            </div>
          )}
        </div>

        {/* Pre-fill button */}
        <div className="flex justify-end pt-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onPrefill} className="gap-1.5">
                  <ArrowDownToLine className="w-3.5 h-3.5" /> Pre-fill form
                </Button>
              </TooltipTrigger>
              <TooltipContent>Auto-populate dealer details from Companies House data</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
