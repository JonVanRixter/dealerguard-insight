import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ArrowLeft, ArrowRight, Upload, Trash2 } from "lucide-react";
import { StageIndicator } from "@/components/tcg-onboarding/StageIndicator";
import type { TcgOnboardingApp, PolicyEntry } from "@/hooks/useTcgOnboarding";

interface Stage2Props {
  app: TcgOnboardingApp;
  onUpdate: (partial: Partial<TcgOnboardingApp>) => void;
  onBack: () => void;
  onContinue: () => void;
  onNavigate: (stage: 1 | 2 | 3) => void;
  saving: boolean;
}

const POLICY_CATEGORIES = [
  "Core Compliance",
  "Finance & Credit",
  "Customer Protection",
  "Financial Crime",
  "Data & Information",
  "People & Governance",
  "Operational",
  "Insurance (if applicable)",
];

export function OnboardingStage2({ app, onUpdate, onBack, onContinue, onNavigate, saving }: Stage2Props) {
  const policies = app.policies;

  // Filter insurance policies if not distributing
  const visiblePolicies = useMemo(() => {
    if (app.distributeInsurance === false) {
      return policies.filter((p) => p.category !== "Insurance (if applicable)");
    }
    return policies;
  }, [policies, app.distributeInsurance]);

  const grouped = useMemo(() => {
    const groups: Record<string, PolicyEntry[]> = {};
    for (const p of visiblePolicies) {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    }
    return groups;
  }, [visiblePolicies]);

  // Stats
  const confirmed = visiblePolicies.filter((p) => p.exists === "yes" || p.exists === "na").length;
  const notHeld = visiblePolicies.filter((p) => p.exists === "no").length;
  const unanswered = visiblePolicies.filter((p) => p.exists === null).length;
  const total = visiblePolicies.length;
  const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  const updatePolicy = (polId: string, field: keyof PolicyEntry, value: unknown) => {
    const updated = policies.map((p) => {
      if (p.id !== polId) return p;
      const next = { ...p, [field]: value };
      // Clear downstream fields when exists changes
      if (field === "exists") {
        if (value === "no" || value === "na") {
          next.documentUploaded = false;
          next.fileName = null;
          next.lastUpdated = null;
          next.dateUnknown = false;
        }
      }
      if (field === "dateUnknown" && value === true) {
        next.lastUpdated = null;
      }
      return next;
    });
    onUpdate({ policies: updated });
  };

  const handleFileUpload = (polId: string) => {
    // Simulate file upload
    updatePolicy(polId, "documentUploaded", true);
    updatePolicy(polId, "fileName", "uploaded_document.pdf");
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <StageIndicator current={2} onNavigate={onNavigate} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Policy Framework — {app.tradingName || app.companyName || "New Dealer"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Confirm which policies the dealer holds. Request copies where available. These records are shared with all lenders — collect once, use everywhere.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {saving ? "💾 Saving..." : "✅ Saved"}
          </span>
        </div>

        {/* Category groups */}
        {POLICY_CATEGORIES.filter((cat) => grouped[cat]).map((cat) => {
          const catPolicies = grouped[cat];
          const catConfirmed = catPolicies.filter((p) => p.exists === "yes" || p.exists === "na").length;
          return (
            <Collapsible key={cat} defaultOpen>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ChevronDown className="w-4 h-4" />
                      {cat}
                    </CardTitle>
                    <Badge variant="secondary">{catConfirmed} of {catPolicies.length} confirmed</Badge>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    {catPolicies.map((pol) => (
                      <div key={pol.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-medium text-sm">{pol.name}</h4>
                        </div>

                        {/* Exists radio */}
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Policy Exists?</Label>
                          <RadioGroup
                            value={pol.exists || ""}
                            onValueChange={(v) => updatePolicy(pol.id, "exists", v)}
                            className="flex gap-4"
                          >
                            <div className="flex items-center gap-1.5">
                              <RadioGroupItem value="yes" id={`${pol.id}-yes`} />
                              <Label htmlFor={`${pol.id}-yes`} className="text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <RadioGroupItem value="no" id={`${pol.id}-no`} />
                              <Label htmlFor={`${pol.id}-no`} className="text-sm">No</Label>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <RadioGroupItem value="na" id={`${pol.id}-na`} />
                              <Label htmlFor={`${pol.id}-na`} className="text-sm">N/A</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* If exists=yes: doc upload + date */}
                        {pol.exists === "yes" && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4 border-l-2 border-primary/20">
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Document</Label>
                              {pol.documentUploaded ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">{pol.fileName}</Badge>
                                  <button
                                    onClick={() => {
                                      updatePolicy(pol.id, "documentUploaded", false);
                                      updatePolicy(pol.id, "fileName", null);
                                    }}
                                    className="text-destructive hover:text-destructive/80"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleFileUpload(pol.id)}
                                  className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-md text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  Upload (PDF/DOCX/JPG, max 10MB)
                                </button>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Last Updated</Label>
                              {!pol.dateUnknown ? (
                                <Input
                                  type="date"
                                  value={pol.lastUpdated || ""}
                                  onChange={(e) => updatePolicy(pol.id, "lastUpdated", e.target.value)}
                                  className="text-sm"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Date not provided</span>
                              )}
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={pol.dateUnknown}
                                  onCheckedChange={(v) => updatePolicy(pol.id, "dateUnknown", !!v)}
                                  id={`${pol.id}-dateunk`}
                                />
                                <Label htmlFor={`${pol.id}-dateunk`} className="text-xs text-muted-foreground">Date unknown</Label>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* If exists=no: amber highlight */}
                        {pol.exists === "no" && (
                          <div className="p-2 rounded bg-[hsl(var(--rag-amber-bg))] text-[hsl(var(--rag-amber-text))] text-xs">
                            Policy not held — note reason below
                          </div>
                        )}

                        {/* Notes always */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Notes</Label>
                          <Textarea
                            rows={2}
                            value={pol.notes}
                            onChange={(e) => updatePolicy(pol.id, "notes", e.target.value)}
                            placeholder="Add notes..."
                            className="text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}

        {/* Completion bar */}
        <Card className="sticky bottom-4 z-10 shadow-lg">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium shrink-0">Policy Framework Completion:</span>
              <Progress value={pct} className="flex-1" />
              <span className="text-sm font-medium shrink-0">{confirmed} of {total} confirmed</span>
              {unanswered > 0 && (
                <Badge className="bg-[hsl(var(--rag-red-bg))] text-[hsl(var(--rag-red-text))]">{unanswered} unanswered</Badge>
              )}
              {notHeld > 0 && (
                <Badge className="bg-[hsl(var(--rag-amber-bg))] text-[hsl(var(--rag-amber-text))]">{notHeld} not held</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Stage 1
          </Button>
          <Button onClick={onContinue} className="gap-2">
            Save & Continue to Review <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
