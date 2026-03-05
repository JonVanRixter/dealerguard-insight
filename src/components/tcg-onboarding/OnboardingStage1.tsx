import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, ChevronDown, ArrowRight, ShieldBan, Info, CheckCircle2 } from "lucide-react";
import { StageIndicator } from "@/components/tcg-onboarding/StageIndicator";
import type { OnboardingApplication, PreScreenCheck } from "@/hooks/useTcgOnboarding";

interface Stage1Props {
  app: OnboardingApplication;
  onUpdate: (partial: Partial<OnboardingApplication>) => void;
  onContinue: () => void;
  onNavigate: (stage: 1 | 2 | 3) => void;
  saving: boolean;
  checkDuplicate: (ch: string) => string | null;
}

export function OnboardingStage1({ app, onUpdate, onContinue, onNavigate, saving, checkDuplicate }: Stage1Props) {
  const [duplicateMsg, setDuplicateMsg] = useState<string | null>(null);

  const handleChChange = (value: string) => {
    onUpdate({ companiesHouseNo: value } as any);
    if (value.length >= 4) {
      const warn = checkDuplicate(value);
      setDuplicateMsg(warn);
    } else {
      setDuplicateMsg(null);
    }
  };

  const checks = Object.entries(app.preScreenChecks);

  const updateCheck = (key: string, field: "answered" | "finding", value: any) => {
    const updated = { ...app.preScreenChecks };
    updated[key] = {
      ...updated[key],
      [field]: value,
      ...(field === "answered" && value === true
        ? { answeredBy: "Tom Griffiths", answeredAt: new Date().toISOString() }
        : {}),
    };
    onUpdate({ preScreenChecks: updated });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <StageIndicator current={1} onNavigate={onNavigate} />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dealer Details & Pre-Screen Checks</h1>
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

        {/* Section B — Pre-Screen Checks */}
        <Card>
          <CardHeader>
            <CardTitle>Pre-Screen Checks</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Record what you found for each check. Every check needs a finding — this is the record of the work done.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {checks.map(([key, check]) => (
              <Collapsible key={key} defaultOpen={!check.answered}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{check.label}</span>
                  </div>
                  {check.answered ? (
                    <Badge className="bg-outcome-pass-bg text-outcome-pass-text">✓ Answered</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 px-3 pb-1 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Finding / Notes</Label>
                    <Textarea
                      rows={3}
                      value={check.finding}
                      onChange={(e) => updateCheck(key, "finding", e.target.value)}
                      placeholder="Record what you found — who you spoke to, what was confirmed, any issues..."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant={check.answered ? "default" : "outline"}
                      onClick={() => updateCheck(key, "answered", !check.answered)}
                      className="gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {check.answered ? "Answered ✓" : "Mark as Answered"}
                    </Button>
                    {check.answeredBy && (
                      <span className="text-xs text-muted-foreground">
                        by {check.answeredBy} · {check.answeredAt ? new Date(check.answeredAt).toLocaleDateString("en-GB") : ""}
                      </span>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onContinue} className="gap-2">
            Save & Continue to Policies
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
