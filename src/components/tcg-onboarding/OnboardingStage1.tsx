import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Pencil, Settings } from "lucide-react";
import { StageIndicator } from "@/components/tcg-onboarding/StageIndicator";
import type { OnboardingApplication, PreScreenCheck } from "@/hooks/useTcgOnboarding";

interface Stage1Props {
  app: OnboardingApplication;
  onUpdate: (partial: Partial<OnboardingApplication>) => void;
  onContinue: () => void;
  onNavigate: (stage: 1 | 2) => void;
  saving: boolean;
  checkDuplicate: (ch: string) => string | null;
}

/* ── Sub-components ─────────────────────────────────────────── */

function CheckIdBadge({ id }: { id: string }) {
  return (
    <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground tracking-wide uppercase border border-border/50">
      {id.replace("_", ".")}
    </span>
  );
}

function RiskBadge({ rating }: { rating: "High" | "Medium" }) {
  if (rating === "High") return (
    <Badge className="bg-destructive/10 text-destructive text-[10px] font-medium gap-1.5 px-2 py-0.5">
      <span className="w-2 h-2 rounded-full bg-destructive inline-block" /> High
    </Badge>
  );
  return (
    <Badge className="bg-outcome-pending-bg text-outcome-pending-text text-[10px] font-medium gap-1.5 px-2 py-0.5">
      <span className="w-2 h-2 rounded-full bg-outcome-pending inline-block" /> Medium
    </Badge>
  );
}

function SectionStatusIcon({ answered, total }: { answered: number; total: number }) {
  if (answered === total) return <CheckCircle2 className="w-4 h-4 text-outcome-pass" />;
  if (answered > 0) return <Settings className="w-4 h-4 text-muted-foreground animate-spin" style={{ animationDuration: "3s" }} />;
  return <span className="w-4 h-4 rounded-full border-2 border-muted-foreground/40 inline-block" />;
}

interface SectionGroup {
  sectionId: string;
  sectionName: string;
  checks: PreScreenCheck[];
  answered: number;
  total: number;
}

/* ── Check Card (collapsed / expanded) ──────────────────────── */

function CheckCard({
  check,
  isExpanded,
  validationError,
  onToggleExpand,
  onUpdateCheck,
}: {
  check: PreScreenCheck;
  isExpanded: boolean;
  validationError?: string;
  onToggleExpand: (id: string, open: boolean) => void;
  onUpdateCheck: (checkId: string, field: "answered" | "finding", value: any) => void;
}) {
  const isAnswered = check.answered;
  const showFull = !isAnswered || isExpanded;

  const borderColor = isAnswered
    ? "border-l-outcome-pass"
    : check.riskRating === "High"
      ? "border-l-destructive/60"
      : "border-l-outcome-pending/60";

  return (
    <div className={`rounded-lg border transition-colors border-l-4 ${borderColor} border-t border-r border-b`}>
      {/* Compact answered state */}
      {isAnswered && !isExpanded && (
        <div className="p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <CheckCircle2 className="w-5 h-5 text-outcome-pass shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CheckIdBadge id={check.checkId} />
                <p className="text-sm font-medium">{check.label}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1 truncate">"{check.finding}"</p>
              <p className="text-xs text-muted-foreground mt-1">
                Answered by {check.answeredBy} · {check.answeredAt ? new Date(check.answeredAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}{" "}
                {check.answeredAt ? new Date(check.answeredAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : ""}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs shrink-0" onClick={() => onToggleExpand(check.checkId, true)}>
            <Pencil className="w-3 h-3" /> Edit
          </Button>
        </div>
      )}

      {/* Full expanded state */}
      {showFull && (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CheckIdBadge id={check.checkId} />
            <RiskBadge rating={check.riskRating} />
          </div>

          <p className="text-sm font-medium">{check.label}</p>

          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">What to check:</p>
            <p className="text-xs text-muted-foreground">{check.objective}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Frequency: {check.frequency}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Finding / Notes</Label>
            <Textarea
              rows={3}
              value={check.finding}
              onChange={(e) => onUpdateCheck(check.checkId, "finding", e.target.value)}
              placeholder="Record what you found — who you spoke to, what was confirmed, any issues..."
            />
            {validationError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {validationError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`mark-${check.checkId}`}
                checked={check.answered}
                onCheckedChange={(checked) => onUpdateCheck(check.checkId, "answered", !!checked)}
              />
              <Label htmlFor={`mark-${check.checkId}`} className="text-sm cursor-pointer">Mark as answered</Label>
            </div>
            {check.answeredBy && (
              <span className="text-xs text-muted-foreground">
                Answered by: {check.answeredBy} · {check.answeredAt ? new Date(check.answeredAt).toLocaleDateString("en-GB") : "—"}
              </span>
            )}
          </div>

          {isAnswered && isExpanded && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => onToggleExpand(check.checkId, false)}>
              Collapse
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */

export function OnboardingStage1({ app, onUpdate, onContinue, onNavigate, saving, checkDuplicate }: Stage1Props) {
  const [duplicateMsg, setDuplicateMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [expandedAnswered, setExpandedAnswered] = useState<Record<string, boolean>>({});

  const handleChChange = (value: string) => {
    onUpdate({ companiesHouseNo: value } as any);
    if (value.length >= 4) {
      const warn = checkDuplicate(value);
      setDuplicateMsg(warn);
    } else {
      setDuplicateMsg(null);
    }
  };

  // Group checks by section
  const sections: SectionGroup[] = useMemo(() => {
    const map = new Map<string, PreScreenCheck[]>();
    for (const check of app.checks) {
      const existing = map.get(check.sectionId) || [];
      existing.push(check);
      map.set(check.sectionId, existing);
    }
    return Array.from(map.entries()).map(([sectionId, checks]) => ({
      sectionId,
      sectionName: checks[0].sectionName,
      checks,
      answered: checks.filter(c => c.answered).length,
      total: checks.length,
    }));
  }, [app.checks]);

  // Find first unanswered section for smart collapse
  const firstUnansweredSectionId = useMemo(() => {
    for (const s of sections) {
      if (s.answered < s.total) return s.sectionId;
    }
    return null;
  }, [sections]);

  const totalChecks = app.checks.length;
  const answeredChecks = app.checks.filter(c => c.answered).length;
  const allChecksAnswered = answeredChecks === totalChecks;
  const checkPct = totalChecks > 0 ? Math.round((answeredChecks / totalChecks) * 100) : 0;

  const allPreScreenDone = app.completionStatus.allPreScreenChecksAnswered;
  const allPoliciesDone = app.completionStatus.allPoliciesAnswered;

  const updateCheck = (checkId: string, field: "answered" | "finding", value: any) => {
    const updated = app.checks.map(c => {
      if (c.checkId !== checkId) return c;

      if (field === "answered" && value === true) {
        if (!c.finding.trim()) {
          setValidationErrors(prev => ({ ...prev, [checkId]: "Please add a finding or note before marking this check as answered." }));
          return c;
        }
        setValidationErrors(prev => { const n = { ...prev }; delete n[checkId]; return n; });
        return { ...c, answered: true, answeredBy: "Tom Griffiths", answeredAt: new Date().toISOString() };
      } else if (field === "answered" && value === false) {
        return { ...c, answered: false, answeredBy: null, answeredAt: null };
      } else {
        const next = { ...c, [field]: value };
        if (field === "finding" && value.trim()) {
          setValidationErrors(prev => { const n = { ...prev }; delete n[checkId]; return n; });
        }
        return next;
      }
    });
    onUpdate({ checks: updated });
  };

  const handleToggleExpand = (id: string, open: boolean) => {
    setExpandedAnswered(prev => {
      if (open) return { ...prev, [id]: true };
      const n = { ...prev }; delete n[id]; return n;
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <StageIndicator current={1} onNavigate={onNavigate} allPreScreenDone={allPreScreenDone} allPoliciesDone={allPoliciesDone} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pre-Screen Checks</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalChecks} checks across {sections.length} sections. Complete every check by recording what you found.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {saving ? "💾 Saving..." : "✅ Saved"}
          </span>
        </div>

        {/* Overall progress bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium shrink-0">Overall progress:</span>
              <Progress value={checkPct} className="flex-1" />
              <span className="text-sm font-medium shrink-0">{answeredChecks} of {totalChecks} answered</span>
            </div>
          </CardContent>
        </Card>

        {duplicateMsg && (
          <div className="bg-outcome-pending-bg border border-outcome-pending rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-outcome-pending-text shrink-0 mt-0.5" />
            <p className="text-sm text-outcome-pending-text">⚠️ {duplicateMsg}</p>
          </div>
        )}

        {/* Basic Dealer Info */}
        <Card>
          <CardHeader><CardTitle>Basic Dealer Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name (legal) *</Label>
                <Input value={app.dealerName} onChange={(e) => onUpdate({ dealerName: e.target.value })} placeholder="Enter legal company name" />
              </div>
              <div className="space-y-2">
                <Label>Companies House Number *</Label>
                <Input value={app.companiesHouseNo} onChange={(e) => handleChChange(e.target.value)} placeholder="e.g. 08421573" maxLength={8} />
              </div>
              <div className="space-y-2">
                <Label>Trading Name *</Label>
                <Input value={app.tradingName} onChange={(e) => onUpdate({ tradingName: e.target.value })} placeholder="Trading name" />
              </div>
              <div className="space-y-2">
                <Label>Website URL *</Label>
                <Input value={app.website} onChange={(e) => onUpdate({ website: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Primary Contact Name *</Label>
                <Input value={app.primaryContact.name} onChange={(e) => onUpdate({ primaryContact: { ...app.primaryContact, name: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Primary Contact Email *</Label>
                <Input type="email" value={app.primaryContact.email} onChange={(e) => onUpdate({ primaryContact: { ...app.primaryContact, email: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Primary Contact Phone *</Label>
                <Input value={app.primaryContact.phone} onChange={(e) => onUpdate({ primaryContact: { ...app.primaryContact, phone: e.target.value } })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Street</Label>
                <Input value={app.registeredAddress.street} onChange={(e) => onUpdate({ registeredAddress: { ...app.registeredAddress, street: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Town</Label>
                <Input value={app.registeredAddress.town} onChange={(e) => onUpdate({ registeredAddress: { ...app.registeredAddress, town: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>County</Label>
                <Input value={app.registeredAddress.county} onChange={(e) => onUpdate({ registeredAddress: { ...app.registeredAddress, county: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Postcode</Label>
                <Input value={app.registeredAddress.postcode} onChange={(e) => onUpdate({ registeredAddress: { ...app.registeredAddress, postcode: e.target.value } })} />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="font-medium">Does the dealer distribute insurance products?</Label>
              <RadioGroup
                value={app.distributeInsurance === null ? "" : app.distributeInsurance ? "yes" : "no"}
                onValueChange={(v) => onUpdate({ distributeInsurance: v === "yes" })}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="ins-yes" />
                  <Label htmlFor="ins-yes">Yes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="ins-no" />
                  <Label htmlFor="ins-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Section-grouped compliance checks */}
        {sections.map((section) => {
          const isComplete = section.answered === section.total;
          const isInProgress = section.answered > 0 && !isComplete;
          const defaultOpen = section.sectionId === firstUnansweredSectionId;

          return (
            <Collapsible key={section.sectionId} defaultOpen={defaultOpen}>
              <Card className={isComplete ? "border-outcome-pass/30" : ""}>
                <CollapsibleTrigger className="w-full group">
                  <CardHeader className={`flex flex-row items-center justify-between cursor-pointer transition-colors ${
                    isComplete ? "bg-outcome-pass-bg/40 hover:bg-outcome-pass-bg/60" : "hover:bg-muted/30"
                  }`}>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 transition-transform group-data-[state=closed]:-rotate-90" />
                      <SectionStatusIcon answered={section.answered} total={section.total} />
                      {section.sectionName}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        isComplete
                          ? "bg-outcome-pass-bg text-outcome-pass-text"
                          : isInProgress
                            ? "bg-muted text-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {section.answered}/{section.total} answered
                    </Badge>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-3">
                    {isComplete && (
                      <div className="bg-outcome-pass-bg/30 border border-outcome-pass/20 rounded-md p-3 text-sm text-outcome-pass-text flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {section.sectionName} — all {section.total} checks answered
                      </div>
                    )}
                    {section.checks.map((check) => (
                      <CheckCard
                        key={check.checkId}
                        check={check}
                        isExpanded={!!expandedAnswered[check.checkId]}
                        validationError={validationErrors[check.checkId]}
                        onToggleExpand={handleToggleExpand}
                        onUpdateCheck={updateCheck}
                      />
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}

        {/* Sticky completion bar */}
        <Card className="sticky bottom-4 z-10 shadow-lg">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium shrink-0">Compliance Checks:</span>
              <Progress value={checkPct} className="flex-1" />
              <span className="text-sm font-medium shrink-0">{answeredChecks} of {totalChecks} answered</span>
              {totalChecks - answeredChecks > 0 && (
                <Badge className="bg-outcome-pending-bg text-outcome-pending-text">{totalChecks - answeredChecks} remaining</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {allChecksAnswered ? (
          <div className="flex items-center justify-between p-4 rounded-lg border border-outcome-pass/30 bg-outcome-pass-bg/30">
            <p className="text-sm font-medium text-outcome-pass-text flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> All {totalChecks} compliance checks answered
            </p>
            <Button onClick={onContinue} className="gap-2">
              Proceed to Policies <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button onClick={onContinue} variant="outline" className="gap-2" disabled>
              Complete all checks to proceed
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
