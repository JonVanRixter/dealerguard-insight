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
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Pencil } from "lucide-react";
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

function RiskBadge({ rating }: { rating: "High" | "Medium" }) {
  if (rating === "High") return <Badge className="bg-destructive/10 text-destructive text-[10px] font-medium">🔴 High</Badge>;
  return <Badge className="bg-outcome-pending-bg text-outcome-pending-text text-[10px] font-medium">🟡 Medium</Badge>;
}

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
  const sections = useMemo(() => {
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
        return {
          ...c,
          answered: true,
          answeredBy: "Tom Griffiths",
          answeredAt: new Date().toISOString(),
        };
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <StageIndicator current={1} onNavigate={onNavigate} allPreScreenDone={allPreScreenDone} allPoliciesDone={allPoliciesDone} />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dealer Details & Compliance Checks</h1>
          <span className="text-sm text-muted-foreground">
            {saving ? "💾 Saving..." : "✅ Saved"}
          </span>
        </div>

        {duplicateMsg && (
          <div className="bg-outcome-pending-bg border border-outcome-pending rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-outcome-pending-text shrink-0 mt-0.5" />
            <p className="text-sm text-outcome-pending-text">⚠️ {duplicateMsg}</p>
          </div>
        )}

        {/* Section A — Basic Dealer Info */}
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

        {/* Section B — Compliance Checks grouped by section */}
        {sections.map((section) => (
          <Collapsible key={section.sectionId} defaultOpen>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 transition-transform group-data-[state=closed]:-rotate-90" />
                    {section.sectionName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {section.answered}/{section.total} answered
                    </Badge>
                    {section.answered === section.total && (
                      <CheckCircle2 className="w-4 h-4 text-outcome-pass" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-3">
                  {section.checks.map((check) => {
                    const isAnswered = check.answered;
                    const isExpanded = expandedAnswered[check.checkId];
                    const showFull = !isAnswered || isExpanded;

                    return (
                      <div
                        key={check.checkId}
                        className={`rounded-lg border transition-colors ${
                          isAnswered
                            ? "border-l-4 border-l-outcome-pass border-t border-r border-b"
                            : "border-l-4 border-l-muted-foreground/30 border-t border-r border-b"
                        }`}
                      >
                        {/* Compact answered state */}
                        {isAnswered && !isExpanded && (
                          <div className="p-4 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <CheckCircle2 className="w-5 h-5 text-outcome-pass shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs text-muted-foreground">{check.checkId}</span>
                                  <p className="text-sm font-medium">{check.label}</p>
                                  <RiskBadge rating={check.riskRating} />
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 truncate">
                                  "{check.finding}"
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Answered by {check.answeredBy} · {check.answeredAt ? new Date(check.answeredAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""} {check.answeredAt ? new Date(check.answeredAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : ""}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1 text-xs shrink-0" onClick={() => setExpandedAnswered(prev => ({ ...prev, [check.checkId]: true }))}>
                              <Pencil className="w-3 h-3" /> Edit
                            </Button>
                          </div>
                        )}

                        {/* Full expanded state */}
                        {showFull && (
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-muted-foreground">{check.checkId}</span>
                              <p className="text-sm font-medium">{check.label}</p>
                              <RiskBadge rating={check.riskRating} />
                            </div>

                            <div className="bg-muted/50 rounded-md p-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Objective — what to check:</p>
                              <p className="text-xs text-muted-foreground">{check.objective}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1">Frequency: {check.frequency}</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Finding / Notes</Label>
                              <Textarea
                                rows={3}
                                value={check.finding}
                                onChange={(e) => updateCheck(check.checkId, "finding", e.target.value)}
                                placeholder="Record what you found — who you spoke to, what was confirmed, any issues..."
                              />
                              {validationErrors[check.checkId] && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> {validationErrors[check.checkId]}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`mark-${check.checkId}`}
                                  checked={check.answered}
                                  onCheckedChange={(checked) => updateCheck(check.checkId, "answered", !!checked)}
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
                              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setExpandedAnswered(prev => { const n = { ...prev }; delete n[check.checkId]; return n; })}>
                                Collapse
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}

        {/* Completion indicator */}
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
