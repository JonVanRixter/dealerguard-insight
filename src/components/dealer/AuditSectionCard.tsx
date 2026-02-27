import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, XCircle, Zap } from "lucide-react";
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

interface AuditSectionCardProps {
  section: AuditSection;
  defaultExpanded?: boolean;
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

export function AuditSectionCard({ section, defaultExpanded = false }: AuditSectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const sectionStatus = section.summary.red > 0 ? "Fail" : section.summary.amber > 0 ? "Attention" : "Pass";

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
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span>Pass: {section.summary.green}</span>
            <span>Attn: {section.summary.amber}</span>
            <span>Fail: {section.summary.red}</span>
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
                  <TableHead className="hidden xl:table-cell">Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.controls.map((control) => (
                  <TableRow key={control.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {control.controlArea}
                        {control.automated && (
                          <Zap className="w-3 h-3 text-accent" aria-label="Automated" />
                        )}
                      </div>
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
                    <TableCell className="hidden xl:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                      {control.comments}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
