import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { StageIndicator } from "@/components/tcg-onboarding/StageIndicator";
import type { OnboardingApplication, OnboardingPolicy } from "@/hooks/useTcgOnboarding";

interface Stage2Props {
  app: OnboardingApplication;
  onUpdate: (partial: Partial<OnboardingApplication>) => void;
  onBack: () => void;
  onContinue: () => void;
  onNavigate: (stage: 1 | 2) => void;
  saving: boolean;
  onMarkReady?: () => void;
}

const POLICY_CATEGORIES = [
  "Governance", "Consumer Duty", "Financial Crime",
  "Permissions & Conduct", "Financial Promotions", "Insurance (if applicable)",
];

export function OnboardingStage2({ app, onUpdate, onBack, onContinue, onNavigate, saving, onMarkReady }: Stage2Props) {
  const [quickEntry, setQuickEntry] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const policies = app.policies;

  const visiblePolicies = useMemo(() => {
    if (app.distributeInsurance === false) {
      return policies.filter((p) => p.category !== "Insurance (if applicable)");
    }
    return policies;
  }, [policies, app.distributeInsurance]);

  const grouped = useMemo(() => {
    const groups: Record<string, OnboardingPolicy[]> = {};
    for (const p of visiblePolicies) {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    }
    return groups;
  }, [visiblePolicies]);

  const isAnswered = (pol: OnboardingPolicy) => pol.dealerHasIt !== null && pol.notes.trim() !== "";
  const answered = visiblePolicies.filter(isAnswered).length;
  const total = visiblePolicies.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  const allPreScreenDone = app.completionStatus.allPreScreenChecksAnswered;
  const allPoliciesDone = answered === total;
  const bothComplete = allPreScreenDone && allPoliciesDone;

  const updatePolicy = (polId: string, field: keyof OnboardingPolicy, value: unknown) => {
    const updated = policies.map((p) => {
      if (p.policyId !== polId) return p;
      const next = {
        ...p,
        [field]: value,
        answeredBy: "Tom Griffiths",
        answeredAt: new Date().toISOString(),
      };
      return next;
    });
    onUpdate({ policies: updated });

    // Clear validation when notes added
    if (field === "notes" && (value as string).trim()) {
      setValidationErrors(prev => { const n = { ...prev }; delete n[polId]; return n; });
    }
    // Show validation if Y/N set but no notes
    if (field === "dealerHasIt") {
      const pol = policies.find(p => p.policyId === polId);
      if (pol && !pol.notes.trim()) {
        setValidationErrors(prev => ({ ...prev, [polId]: "Please add a note before this policy is marked as answered." }));
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <StageIndicator current={2} onNavigate={onNavigate} allPreScreenDone={allPreScreenDone} allPoliciesDone={allPoliciesDone} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Policies — {app.tradingName || app.dealerName || "New Dealer"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Confirm whether the dealer holds each policy. Yes or No — with a supporting note for each.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Quick Entry</Label>
              <Switch checked={quickEntry} onCheckedChange={setQuickEntry} />
            </div>
            <span className="text-sm text-muted-foreground">
              {saving ? "💾 Saving..." : "✅ Saved"}
            </span>
          </div>
        </div>

        {/* Quick Entry Mode */}
        {quickEntry ? (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Policy Name</TableHead>
                    <TableHead className="w-[100px]">Holds Policy</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[80px]">Answered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visiblePolicies.map((pol) => {
                    const polAnswered = isAnswered(pol);
                    return (
                      <TableRow key={pol.policyId}>
                        <TableCell className="text-sm font-medium">{pol.name}</TableCell>
                        <TableCell>
                          <RadioGroup
                            value={pol.dealerHasIt === null ? "" : pol.dealerHasIt ? "yes" : "no"}
                            onValueChange={(v) => updatePolicy(pol.policyId, "dealerHasIt", v === "yes")}
                            className="flex gap-2"
                          >
                            <div className="flex items-center gap-1">
                              <RadioGroupItem value="yes" id={`q-${pol.policyId}-y`} />
                              <Label htmlFor={`q-${pol.policyId}-y`} className="text-xs">Y</Label>
                            </div>
                            <div className="flex items-center gap-1">
                              <RadioGroupItem value="no" id={`q-${pol.policyId}-n`} />
                              <Label htmlFor={`q-${pol.policyId}-n`} className="text-xs">N</Label>
                            </div>
                          </RadioGroup>
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-7 text-xs"
                            value={pol.notes}
                            onChange={(e) => updatePolicy(pol.policyId, "notes", e.target.value)}
                            placeholder="Notes..."
                          />
                          {validationErrors[pol.policyId] && (
                            <p className="text-[10px] text-destructive mt-0.5">{validationErrors[pol.policyId]}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {polAnswered ? (
                            <CheckCircle2 className="w-4 h-4 text-outcome-pass mx-auto" />
                          ) : (
                            <span className="text-xs text-muted-foreground">☐</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          /* Standard View */
          POLICY_CATEGORIES.filter((cat) => grouped[cat]).map((cat) => {
            const catPolicies = grouped[cat];
            const catAnswered = catPolicies.filter(isAnswered).length;
            return (
              <Collapsible key={cat} defaultOpen>
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ChevronDown className="w-4 h-4" />
                        {cat}
                      </CardTitle>
                      <Badge variant="secondary">{catAnswered} of {catPolicies.length} answered</Badge>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                      {catPolicies.map((pol) => {
                        const polAnswered = isAnswered(pol);
                        const borderColor = polAnswered
                          ? pol.dealerHasIt
                            ? "border-l-4 border-l-outcome-pass"
                            : "border-l-4 border-l-outcome-pending"
                          : "border-l-4 border-l-muted-foreground/30";
                        const bgColor = polAnswered
                          ? pol.dealerHasIt
                            ? "bg-[hsl(140,50%,97%)]"
                            : "bg-[hsl(45,90%,97%)]"
                          : "";

                        return (
                          <div key={pol.policyId} className={`rounded-lg p-4 space-y-3 border ${borderColor} ${bgColor}`}>
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{pol.name}</h4>
                              <span className="text-xs text-muted-foreground">Category: {pol.category}</span>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Does the dealer hold this policy?</Label>
                              <RadioGroup
                                value={pol.dealerHasIt === null ? "" : pol.dealerHasIt ? "yes" : "no"}
                                onValueChange={(v) => updatePolicy(pol.policyId, "dealerHasIt", v === "yes")}
                                className="flex gap-4"
                              >
                                <div className="flex items-center gap-1.5">
                                  <RadioGroupItem value="yes" id={`${pol.policyId}-yes`} />
                                  <Label htmlFor={`${pol.policyId}-yes`} className="text-sm">Yes</Label>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <RadioGroupItem value="no" id={`${pol.policyId}-no`} />
                                  <Label htmlFor={`${pol.policyId}-no`} className="text-sm">No</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Notes</Label>
                              <Textarea
                                rows={2}
                                value={pol.notes}
                                onChange={(e) => updatePolicy(pol.policyId, "notes", e.target.value)}
                                placeholder="Record what was confirmed, who you spoke to..."
                                className="text-sm"
                              />
                              {validationErrors[pol.policyId] && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> {validationErrors[pol.policyId]}
                                </p>
                              )}
                            </div>

                            {polAnswered && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {pol.dealerHasIt ? (
                                  <><CheckCircle2 className="w-3.5 h-3.5 text-outcome-pass" /> Answered by {pol.answeredBy}</>
                                ) : (
                                  <><AlertTriangle className="w-3.5 h-3.5 text-outcome-pending" /> Answered by {pol.answeredBy}</>
                                )}
                                {" · "}{pol.answeredAt ? new Date(pol.answeredAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}

        {/* Completion bar */}
        <Card className="sticky bottom-4 z-10 shadow-lg">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium shrink-0">Policy Checklist:</span>
              <Progress value={pct} className="flex-1" />
              <span className="text-sm font-medium shrink-0">{answered} of {total} answered</span>
              {total - answered > 0 && (
                <Badge className="bg-outcome-pending-bg text-outcome-pending-text">{total - answered} remaining</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {bothComplete && onMarkReady ? (
          <div className="flex items-center justify-between p-4 rounded-lg border border-outcome-pass/30 bg-outcome-pass-bg/30">
            <p className="text-sm font-medium text-outcome-pass-text flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> All policies answered · Both sections complete
            </p>
            <Button onClick={onMarkReady} className="gap-2">
              <Send className="w-4 h-4" /> Mark as Ready to Transfer
            </Button>
          </div>
        ) : (
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Stage 1
            </Button>
            {allPoliciesDone ? (
              <p className="text-sm text-outcome-pass-text flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> All policies answered
              </p>
            ) : (
              <Button onClick={onContinue} variant="outline" className="gap-2">
                Save Progress <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
