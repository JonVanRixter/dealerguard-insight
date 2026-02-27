import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, ClipboardList } from "lucide-react";
import { format } from "date-fns";

interface FcaData {
  firmName: string;
  firmReference: string;
  status: string;
  statusDate: string;
  tradingNames: string[];
  authorisationType: string;
  regulatoryActivity: { activity: string; status: string; permission: string }[];
  addressOnRegister: string;
  addressMatchesCompaniesHouse: boolean;
  individuals: { name: string; role: string; status: string }[];
  requirements: string[] | { requirement: string; date: string }[];
  variations: string[] | { variation: string; date: string }[];
  overallResult: string;
  flags: string[];
}

interface Props {
  data: FcaData;
}

function fmtDate(d: string) {
  try { return format(new Date(d), "dd MMM yyyy"); } catch { return d; }
}

export function FcaRegisterPanel({ data }: Props) {
  const isPass = data.overallResult === "Pass";
  const hasFlags = data.flags.length > 0;

  return (
    <Card className="border-border relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="w-5 h-5 text-primary" />
            FCA REGISTER
          </CardTitle>
          <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-muted-foreground/30 bg-muted/50">
            SIMULATED DATA
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{data.firmName} · FRN: {data.firmReference}</p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          <div className="flex justify-between"><span className="text-muted-foreground">Status:</span>
            <span className="font-medium flex items-center gap-1.5">
              {data.status.includes("Authorised") && !data.status.includes("Lapsed") && <span className="w-2 h-2 rounded-full bg-outcome-pass inline-block" />}
              {data.status.includes("Lapsed") && <span className="w-2 h-2 rounded-full bg-outcome-pending inline-block" />}
              {data.status} {data.statusDate && `(since ${fmtDate(data.statusDate)})`}
            </span>
          </div>
          <div className="flex justify-between"><span className="text-muted-foreground">Auth Type:</span><span className="font-medium">{data.authorisationType}</span></div>
        </div>
        <div><span className="text-muted-foreground">Trading Names: </span><span className="font-medium">{data.tradingNames.join(", ")}</span></div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Reg. Address:</span>
          <span className="font-medium">{data.addressOnRegister}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Address match CH:</span>
          {data.addressMatchesCompaniesHouse
            ? <span className="text-outcome-pass-text text-xs">✅ Match confirmed</span>
            : <span className="text-outcome-pending-text text-xs">⚠️ Mismatch</span>}
        </div>

        {/* Permissions */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Permissions</p>
          <div className="space-y-1">
            {data.regulatoryActivity.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-medium">{r.activity}</span>
                <span className="text-outcome-pass-text text-xs">✅ {r.permission}</span>
                <span className="text-muted-foreground">{r.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Individuals */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Individuals on Register</p>
          <div className="space-y-1">
            {data.individuals.map((ind, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-medium">{ind.name}</span>
                <span className="text-muted-foreground">{ind.role}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-outcome-pass inline-block" />{ind.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements & Variations */}
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Requirements & Variations</p>
          {data.requirements.length === 0 && data.variations.length === 0 ? (
            <p className="text-muted-foreground">None recorded</p>
          ) : (
            <div className="space-y-1">
              {data.requirements.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-outcome-pending-text text-sm">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {typeof r === "string" ? r : r.requirement}
                </div>
              ))}
              {data.variations.map((v, i) => (
                <div key={i} className="flex items-center gap-2 text-outcome-pending-text text-sm">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {typeof v === "string" ? v : v.variation}
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
              <CheckCircle2 className="w-4 h-4" /> PASS · Authorised · No requirements or variations
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
      </CardContent>
    </Card>
  );
}
