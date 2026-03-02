import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, XCircle, Zap, Clock } from "lucide-react";
import { AuditSection, ControlCheck } from "@/data/auditFramework";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getControlCadence, type CheckCadenceInfo } from "@/utils/auditCheckCadence";
import { cn } from "@/lib/utils";

interface AuditSectionCardProps {
  section: AuditSection;
  defaultExpanded?: boolean;
  dealerName?: string;
}

const ResultIcon = ({ result }: { result: ControlCheck["result"] }) => {
  if (result === "pass") return <CheckCircle2 className="w-4 h-4 text-primary" />;
  if (result === "partial") return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
  return <XCircle className="w-4 h-4 text-destructive" />;
};

const RiskLabel = ({ rating }: { rating: string }) => {
  const labels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    green: { label: "Pass", variant: "secondary" },
    amber: { label: "Attention", variant: "outline" },
    red: { label: "Fail", variant: "destructive" },
  };
  const config = labels[rating] || labels.green;
  return <Badge variant={config.variant} className="text-[10px] px-1.5 py-0">{config.label}</Badge>;
};

const CadenceBadge = ({ cadence }: { cadence: CheckCadenceInfo }) => {
  const label = cadence.daysUntilDue <= 0
    ? `${Math.abs(cadence.daysUntilDue)}d overdue`
    : `${cadence.daysUntilDue}d`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-1.5 py-0.5",
        cadence.status === "red" && "bg-destructive/10 text-destructive",
        cadence.status === "amber" && "bg-rag-amber-bg text-rag-amber-text",
        cadence.status === "neutral" && "bg-muted text-muted-foreground"
      )}
    >
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
};

export function AuditSectionCard({ section, defaultExpanded = false, dealerName }: AuditSectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const sectionStatus = section.summary.fail > 0 ? "Fail" : section.summary.attention > 0 ? "Attention" : "Pass";

  // Pre-compute cadence for all controls
  const cadenceMap = useMemo(() => {
    if (!dealerName) return new Map<string, CheckCadenceInfo>();
    const map = new Map<string, CheckCadenceInfo>();
    for (const control of section.controls) {
      const info = getControlCadence(dealerName, section.name, control.controlArea, control.id);
      if (info) map.set(control.id, info);
    }
    return map;
  }, [dealerName, section]);

  // Count overdue / amber controls
  const overdueCount = Array.from(cadenceMap.values()).filter(c => c.status === "red").length;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">{section.name}</h3>
          <Badge variant={sectionStatus === "Fail" ? "destructive" : sectionStatus === "Attention" ? "outline" : "secondary"} className="text-[10px]">
            {sectionStatus}
          </Badge>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 gap-1">
              <Clock className="w-3 h-3" />
              {overdueCount} check{overdueCount > 1 ? "s" : ""} overdue
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span>Pass: {section.summary.pass}</span>
            <span>Attn: {section.summary.attention}</span>
            <span>Fail: {section.summary.fail}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          <div className="px-5 py-3 bg-muted/30 text-sm text-muted-foreground">
            {section.summary.notes}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px]">Control Area</TableHead>
                  <TableHead className="hidden lg:table-cell">Objective</TableHead>
                  <TableHead className="hidden md:table-cell">Source/Method</TableHead>
                  <TableHead className="text-center w-[80px]">Result</TableHead>
                  <TableHead className="text-center w-[80px]">Risk</TableHead>
                  {dealerName && <TableHead className="hidden lg:table-cell w-[100px]">Last Checked</TableHead>}
                  {dealerName && <TableHead className="hidden md:table-cell text-center w-[100px]">Next Due</TableHead>}
                  <TableHead className="hidden xl:table-cell">Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.controls.map((control) => {
                  const cadence = cadenceMap.get(control.id);
                  return (
                    <TableRow key={control.id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {control.controlArea}
                          {control.automated && (
                            <Zap className="w-3 h-3 text-accent" aria-label="Automated" />
                          )}
                        </div>
                        {cadence && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {cadence.frequency}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                        {control.objective}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs font-normal">
                          {control.sourceMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <ResultIcon result={control.result} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <RiskLabel rating={control.riskRating} />
                      </TableCell>
                      {dealerName && (
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {cadence ? cadence.lastCheckedLabel : "—"}
                        </TableCell>
                      )}
                      {dealerName && (
                        <TableCell className="hidden md:table-cell text-center">
                          {cadence ? <CadenceBadge cadence={cadence} /> : "—"}
                        </TableCell>
                      )}
                      <TableCell className="hidden xl:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                        {control.comments}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
