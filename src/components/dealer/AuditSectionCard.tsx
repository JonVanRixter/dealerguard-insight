import { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, XCircle, Zap, Clock, ClipboardCheck } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getControlCadence, type CheckCadenceInfo } from "@/utils/auditCheckCadence";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

/* ── Status rendering for the check schedule table ── */
function StatusCell({ cadence }: { cadence: CheckCadenceInfo }) {
  if (cadence.daysUntilDue <= 0) {
    return (
      <span className="text-xs font-bold text-[hsl(0,84%,60%)]">
        🔴 OVERDUE ({Math.abs(cadence.daysUntilDue)}d past due)
      </span>
    );
  }
  if (cadence.status === "red") {
    return <span className="text-xs font-medium text-[hsl(0,84%,60%)]">🔴 {cadence.daysUntilDue}d</span>;
  }
  if (cadence.status === "amber") {
    return <span className="text-xs font-medium text-[hsl(38,92%,50%)]">🟡 {cadence.daysUntilDue}d</span>;
  }
  return <span className="text-xs text-muted-foreground">✅ {cadence.daysUntilDue}d</span>;
}

function getScheduleRowBg(cadence: CheckCadenceInfo) {
  if (cadence.daysUntilDue <= 0) return "bg-[hsl(0,100%,97%)]";
  if (cadence.status === "red") return "bg-[hsl(0,100%,97%)]";
  if (cadence.status === "amber") return "bg-[hsl(48,100%,97%)]";
  return "";
}

/* ── Inline Mark-as-Checked form ── */
function MarkAsCheckedForm({ controlName, onConfirm, onCancel }: {
  controlName: string;
  onConfirm: (result: string, notes: string) => void;
  onCancel: () => void;
}) {
  const [result, setResult] = useState("Pass");
  const [notes, setNotes] = useState("");

  return (
    <div className="flex flex-col gap-2 py-2 px-3 bg-muted/40 rounded-lg border border-border text-xs">
      <div className="flex items-center gap-4">
        <span className="font-medium text-foreground">Result:</span>
        {["Pass", "Fail", "Refer"].map((r) => (
          <label key={r} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="check-result"
              value={r}
              checked={result === r}
              onChange={() => setResult(r)}
              className="accent-primary"
            />
            <span className={cn(
              r === "Pass" && "text-primary",
              r === "Fail" && "text-destructive",
              r === "Refer" && "text-muted-foreground"
            )}>{r}</span>
          </label>
        ))}
      </div>
      <Textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="h-16 text-xs"
      />
      <div className="flex gap-2">
        <Button size="sm" className="text-xs h-7 gap-1" onClick={() => onConfirm(result, notes)}>
          <CheckCircle2 className="w-3 h-3" /> Confirm Check
        </Button>
        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

/* ── Cadence summary helpers ── */
function getCadenceSummary(cadenceMap: Map<string, CheckCadenceInfo>, controls: ControlCheck[]) {
  const cadences = Array.from(cadenceMap.values());
  if (cadences.length === 0) return null;

  const totalChecks = cadences.length;
  const overdueCount = cadences.filter((c) => c.daysUntilDue <= 0).length;
  const redCount = cadences.filter((c) => c.status === "red" && c.daysUntilDue > 0).length;
  const amberCount = cadences.filter((c) => c.status === "amber").length;
  const onSchedule = totalChecks - overdueCount - redCount - amberCount;

  // Most urgent control (lowest daysUntilDue)
  let mostUrgent: { cadence: CheckCadenceInfo; controlId: string; controlArea: string } | null = null;
  for (const control of controls) {
    const c = cadenceMap.get(control.id);
    if (!c) continue;
    if (!mostUrgent || c.daysUntilDue < mostUrgent.cadence.daysUntilDue) {
      mostUrgent = { cadence: c, controlId: control.id, controlArea: control.controlArea };
    }
  }

  // Most recently checked & most urgently due (for summary line)
  const sorted = [...cadences].sort((a, b) => b.lastChecked.getTime() - a.lastChecked.getTime());
  const lastCheckedCadence = sorted[0];
  const nextDueCadence = [...cadences].sort((a, b) => a.daysUntilDue - b.daysUntilDue)[0];

  return {
    totalChecks,
    overdueCount,
    redCount,
    dueSoonCount: amberCount + redCount,
    onSchedule,
    mostUrgent,
    lastCheckedCadence,
    nextDueCadence,
  };
}

function DaysRemainingText({ days, status }: { days: number; status: CheckCadenceInfo["status"] }) {
  if (days <= 0) {
    return <span className="font-bold text-[hsl(0,84%,60%)]">{Math.abs(days)} days overdue</span>;
  }
  return (
    <span className={cn(
      status === "red" && "text-[hsl(0,84%,60%)]",
      status === "amber" && "text-[hsl(38,92%,50%)]",
      status === "neutral" && "text-muted-foreground"
    )}>
      {days} days remaining
    </span>
  );
}

export function AuditSectionCard({ section, defaultExpanded = false, dealerName }: AuditSectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [markingControlId, setMarkingControlId] = useState<string | null>(null);
  const [cadenceVersion, setCadenceVersion] = useState(0);
  const { toast } = useToast();

  const sectionStatus = section.summary.fail > 0 ? "Fail" : section.summary.attention > 0 ? "Attention" : "Pass";
  const sectionScore = Math.round(
    (section.summary.pass / (section.summary.pass + section.summary.attention + section.summary.fail)) * 100
  );

  // Pre-compute cadence for all controls
  const cadenceMap = useMemo(() => {
    if (!dealerName) return new Map<string, CheckCadenceInfo>();
    const map = new Map<string, CheckCadenceInfo>();
    for (const control of section.controls) {
      const info = getControlCadence(dealerName, section.name, control.controlArea, control.id);
      if (info) map.set(control.id, info);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerName, section, cadenceVersion]);

  const summary = useMemo(() => getCadenceSummary(cadenceMap, section.controls), [cadenceMap, section.controls]);

  const handleMarkChecked = useCallback((controlId: string, controlArea: string, result: string, notes: string) => {
    // In a real app this would persist to the backend. For now we show the toast.
    setMarkingControlId(null);
    setCadenceVersion((v) => v + 1);
    toast({
      title: "✅ Check Recorded",
      description: `${controlArea} marked as ${result}.`,
    });
  }, [toast]);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* ── HEADER (collapsed view) ── */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 text-left hover:bg-muted/50 transition-colors"
      >
        {/* Row 1: Title + Score + Result */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">📋 {section.name}</h3>
            <span className="text-xs font-medium text-muted-foreground">Score: {sectionScore}/100</span>
            <Badge variant={sectionStatus === "Fail" ? "destructive" : sectionStatus === "Attention" ? "outline" : "secondary"} className="text-[10px]">
              Result: {sectionStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Row 2: Cadence summary counts */}
        {summary && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Checks: {summary.totalChecks}</span>
            <span>✅ On schedule: {summary.onSchedule}</span>
            <span className={cn(summary.overdueCount > 0 && "text-[hsl(0,84%,60%)] font-medium")}>
              🔴 Overdue: {summary.overdueCount}
            </span>
            <span className={cn(summary.dueSoonCount > 0 && "text-[hsl(38,92%,50%)] font-medium")}>
              🟡 Due soon: {summary.dueSoonCount}
            </span>
          </div>
        )}

        {/* Row 3: Next due control */}
        {summary?.mostUrgent && (
          <div className="mt-1.5 text-xs text-muted-foreground">
            Next due: <span className="font-medium text-foreground">{summary.mostUrgent.controlId} — {summary.mostUrgent.controlArea}</span>
            {" "}in{" "}
            <DaysRemainingText days={summary.mostUrgent.cadence.daysUntilDue} status={summary.mostUrgent.cadence.status} />
          </div>
        )}

        {/* Row 4: Last checked summary line */}
        {summary?.lastCheckedCadence && summary?.nextDueCadence && (
          <div className="mt-1 text-[11px] text-muted-foreground">
            Last checked: {summary.lastCheckedCadence.lastCheckedLabel}
            {summary.lastCheckedCadence.lastCheckedBy && ` by ${summary.lastCheckedCadence.lastCheckedBy}`}
            {" · "}
            Next review: {summary.nextDueCadence.nextDueDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}
            <DaysRemainingText days={summary.nextDueCadence.daysUntilDue} status={summary.nextDueCadence.status} />
          </div>
        )}
      </button>

      {/* ── EXPANDED VIEW ── */}
      {isExpanded && (
        <div className="border-t border-border">
          {/* Section notes */}
          <div className="px-5 py-3 bg-muted/30 text-sm text-muted-foreground">
            {section.summary.notes}
          </div>

          {/* Audit controls table */}
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

          {/* ── CHECK SCHEDULE ── */}
          {dealerName && cadenceMap.size > 0 && (
            <div className="border-t border-border">
              <div className="px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-wide uppercase bg-muted/20">
                <ClipboardCheck className="w-3.5 h-3.5" />
                Check Schedule
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent text-xs">
                      <TableHead className="w-[220px]">Control Area</TableHead>
                      <TableHead className="w-[100px]">Frequency</TableHead>
                      <TableHead className="w-[110px]">Last Checked</TableHead>
                      <TableHead className="w-[110px]">Checked By</TableHead>
                      <TableHead className="w-[110px]">Next Due</TableHead>
                      <TableHead className="w-[140px]">Status</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.controls.map((control) => {
                      const cadence = cadenceMap.get(control.id);
                      if (!cadence) return null;
                      const isOverdue = cadence.daysUntilDue <= 0;
                      return (
                        <TableRow
                          key={`sched-${control.id}`}
                          className={cn(getScheduleRowBg(cadence), isOverdue && "font-semibold")}
                        >
                          <TableCell className="text-xs font-medium text-foreground">
                            {control.controlArea}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{cadence.frequency}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{cadence.lastCheckedLabel}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {cadence.lastCheckedBy
                              ? cadence.lastCheckedBy.split(" ").map((n, i) => i === 0 ? n.charAt(0) + "." : " " + n).join("")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {cadence.nextDueDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </TableCell>
                          <TableCell>
                            <StatusCell cadence={cadence} />
                          </TableCell>
                          <TableCell>
                            {markingControlId === control.id ? null : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[10px] h-6 px-2 gap-1 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMarkingControlId(control.id);
                                }}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Mark as Checked
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Inline mark-as-checked form (rendered below the table for the active control) */}
                {markingControlId && (() => {
                  const ctrl = section.controls.find((c) => c.id === markingControlId);
                  if (!ctrl) return null;
                  return (
                    <div className="px-5 py-3 border-t border-border">
                      <p className="text-xs font-medium text-foreground mb-2">
                        Mark as Checked: <span className="text-muted-foreground">{ctrl.controlArea}</span>
                      </p>
                      <MarkAsCheckedForm
                        controlName={ctrl.controlArea}
                        onConfirm={(result, notes) => handleMarkChecked(ctrl.id, ctrl.controlArea, result, notes)}
                        onCancel={() => setMarkingControlId(null)}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
