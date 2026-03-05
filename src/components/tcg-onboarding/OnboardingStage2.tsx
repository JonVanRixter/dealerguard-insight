import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";
import { StageIndicator } from "@/components/tcg-onboarding/StageIndicator";
import type { OnboardingApplication, OnboardingPolicy } from "@/hooks/useTcgOnboarding";

interface Stage2Props {
  app: OnboardingApplication;
  onUpdate: (partial: Partial<OnboardingApplication>) => void;
  onBack: () => void;
  onContinue: () => void;
  onNavigate: (stage: 1 | 2 | 3) => void;
  saving: boolean;
}

const POLICY_CATEGORIES = [
  "Core Compliance", "Finance & Credit", "Customer Protection", "Financial Crime",
  "Data & Information", "People & Governance", "Operational", "Insurance (if applicable)",
];

export function OnboardingStage2({ app, onUpdate, onBack, onContinue, onNavigate, saving }: Stage2Props) {
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

  const answered = visiblePolicies.filter((p) => p.dealerHasIt !== null).length;
  const total = visiblePolicies.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  const updatePolicy = (polId: string, field: keyof OnboardingPolicy, value: unknown) => {
    const updated = policies.map((p) => {
      if (p.policyId !== polId) return p;
      return {
        ...p,
        [field]: value,
        answeredBy: "Tom Griffiths",
        answeredAt: new Date().toISOString(),
      };
    });
    onUpdate({ policies: updated });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <StageIndicator current={2} onNavigate={onNavigate} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Policies — {app.tradingName || app.dealerName || "New Dealer"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Confirm whether the dealer holds each policy. Yes or No — no document upload needed here.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {saving ? "💾 Saving..." : "✅ Saved"}
          </span>
        </div>

        {POLICY_CATEGORIES.filter((cat) => grouped[cat]).map((cat) => {
          const catPolicies = grouped[cat];
          const catAnswered = catPolicies.filter((p) => p.dealerHasIt !== null).length;
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
                    {catPolicies.map((pol) => (
                      <div key={pol.policyId} className="border rounded-lg p-4 space-y-3">
                        <h4 className="font-medium text-sm">{pol.name}</h4>

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
              <span className="text-sm font-medium shrink-0">Policy Progress:</span>
              <Progress value={pct} className="flex-1" />
              <span className="text-sm font-medium shrink-0">{answered} of {total} answered</span>
              {total - answered > 0 && (
                <Badge className="bg-outcome-pending-bg text-outcome-pending-text">{total - answered} remaining</Badge>
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
