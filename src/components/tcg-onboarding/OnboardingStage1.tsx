import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, ChevronDown, Save, ArrowRight, ShieldBan, Info } from "lucide-react";
import { StageIndicator } from "@/components/tcg-onboarding/StageIndicator";
import { RunExternalChecks } from "@/components/tcg-onboarding/RunExternalChecks";
import type { TcgOnboardingApp, PreScreenCheck, PreScreenResult } from "@/hooks/useTcgOnboarding";

interface Stage1Props {
  app: TcgOnboardingApp;
  onUpdate: (partial: Partial<TcgOnboardingApp>) => void;
  onContinue: () => void;
  onNavigate: (stage: 1 | 2 | 3) => void;
  saving: boolean;
  checkDuplicate: (ch: string) => string | null;
}

export function OnboardingStage1({ app, onUpdate, onContinue, onNavigate, saving, checkDuplicate }: Stage1Props) {
  const [duplicateMsg, setDuplicateMsg] = useState<string | null>(app.duplicateWarning);

  const handleChChange = (value: string) => {
    onUpdate({ companiesHouseNumber: value });
    if (value.length >= 4) {
      const warn = checkDuplicate(value);
      setDuplicateMsg(warn);
      onUpdate({ companiesHouseNumber: value, duplicateWarning: warn });
    } else {
      setDuplicateMsg(null);
    }
  };

  const updateCheck = (checkId: string, field: "result" | "notes", value: string) => {
    const updated = app.preScreenChecks.map((c) =>
      c.id === checkId ? { ...c, [field]: field === "result" ? value as PreScreenResult : value } : c
    );
    onUpdate({ preScreenChecks: updated });
  };

  const resultPill = (result: PreScreenResult) => {
    if (!result) return null;
    if (result === "pass") return <Badge className="bg-outcome-pass-bg text-outcome-pass-text">Pass</Badge>;
    if (result === "fail") return <Badge className="bg-outcome-fail-bg text-outcome-fail-text">Fail</Badge>;
    return <Badge className="bg-outcome-pending-bg text-outcome-pending-text">Refer</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <StageIndicator current={1} onNavigate={onNavigate} />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dealer Details & Pre-Screen</h1>
          <span className="text-sm text-muted-foreground">
            {saving ? "💾 Saving..." : "✅ Saved"}
          </span>
        </div>

        {/* DND Warning */}
        {app.dndWarning && (
          <div className="bg-outcome-fail-bg border border-outcome-fail rounded-lg p-4 flex items-start gap-3">
            <ShieldBan className="w-5 h-5 text-outcome-fail-text shrink-0 mt-0.5" />
            <p className="text-sm text-outcome-fail-text font-medium">{app.dndWarning}</p>
          </div>
        )}

        {/* Duplicate Warning */}
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
                <Input value={app.companyName} onChange={(e) => onUpdate({ companyName: e.target.value })} placeholder="Enter legal company name" />
              </div>
              <div className="space-y-2">
                <Label>Companies House Number *</Label>
                <Input value={app.companiesHouseNumber} onChange={(e) => handleChChange(e.target.value)} placeholder="e.g. 08421573" maxLength={8} />
              </div>
              <div className="space-y-2">
                <Label>Trading Name *</Label>
                <Input value={app.tradingName} onChange={(e) => onUpdate({ tradingName: e.target.value })} placeholder="Trading name" />
              </div>
              <div className="space-y-2">
                <Label>Website URL *</Label>
                <Input value={app.websiteUrl} onChange={(e) => onUpdate({ websiteUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Primary Contact Name *</Label>
                <Input value={app.primaryContactName} onChange={(e) => onUpdate({ primaryContactName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Primary Contact Email *</Label>
                <Input type="email" value={app.primaryContactEmail} onChange={(e) => onUpdate({ primaryContactEmail: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Primary Contact Phone *</Label>
                <Input value={app.primaryContactPhone} onChange={(e) => onUpdate({ primaryContactPhone: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Street</Label>
                <Input value={app.addressStreet} onChange={(e) => onUpdate({ addressStreet: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Town</Label>
                <Input value={app.addressTown} onChange={(e) => onUpdate({ addressTown: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>County</Label>
                <Input value={app.addressCounty} onChange={(e) => onUpdate({ addressCounty: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Postcode</Label>
                <Input value={app.addressPostcode} onChange={(e) => onUpdate({ addressPostcode: e.target.value })} />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="font-medium">Does the dealer distribute insurance products (GAP, warranties, etc.)?</Label>
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

        {/* External Checks */}
        <RunExternalChecks
          companiesHouseNumber={app.companiesHouseNumber}
          app={app}
          onUpdate={onUpdate}
        />

        {/* Section B — Pre-Screen Checks */}
        <Card>
          <CardHeader><CardTitle>Pre-Screen Checks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {app.preScreenChecks.map((check) => (
              <Collapsible key={check.id}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{check.label}</span>
                  </div>
                  {resultPill(check.result)}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 px-3 pb-1 space-y-3">
                  <p className="text-sm text-muted-foreground">{check.description}</p>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Result</Label>
                    <RadioGroup
                      value={check.result || ""}
                      onValueChange={(v) => updateCheck(check.id, "result", v)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="pass" id={`${check.id}-pass`} />
                        <Label htmlFor={`${check.id}-pass`} className="text-sm">Pass</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="fail" id={`${check.id}-fail`} />
                        <Label htmlFor={`${check.id}-fail`} className="text-sm">Fail</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="refer" id={`${check.id}-refer`} />
                        <Label htmlFor={`${check.id}-refer`} className="text-sm">Refer for Manual Review</Label>
                      </div>
                    </RadioGroup>
                    {check.notes === "Auto-filled from simulated check" && check.id !== "web" && (
                      <p className="text-xs text-primary/70 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Auto-filled from simulated check — review and confirm
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Notes</Label>
                    <Textarea
                      rows={2}
                      value={check.notes === "Auto-filled from simulated check" ? "" : check.notes}
                      onChange={(e) => updateCheck(check.id, "notes", e.target.value)}
                      placeholder="Add notes..."
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onContinue} className="gap-2">
            Save & Continue to Policy Framework
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
