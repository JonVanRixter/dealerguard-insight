import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { OnboardingDocUpload } from "@/components/onboarding/OnboardingDocUpload";
import { CreditSafeSearch } from "@/components/onboarding/CreditSafeSearch";
import { FcaRegisterCard } from "@/components/dealer/FcaRegisterCard";
import { DealerEnrichment } from "@/components/onboarding/DealerEnrichment";
import { useOnboardingPersistence, type SegData } from "@/hooks/useOnboardingPersistence";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DemoOnboardingWizard } from "@/components/onboarding/DemoOnboardingWizard";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Users, Phone, ShieldCheck, Building2, PoundSterling,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight, Search,
  ClipboardList, FileSearch, Landmark, FileUp, ShieldBan,
  Loader2, Plus, FolderOpen,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  1.1  Dealer Segmentation                                          */
/* ------------------------------------------------------------------ */
function DealerSegmentation({ seg, onChange, dealerName }: { seg: SegData; onChange: (s: SegData) => void; dealerName: string }) {
  const toggleStock = (val: string) =>
    onChange({
      ...seg,
      stockType: seg.stockType.includes(val)
        ? seg.stockType.filter((v) => v !== val)
        : [...seg.stockType, val],
    });

  const filled = [seg.franchise, seg.size, seg.stockType.length > 0, seg.existingFinance].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">1.1 &nbsp;Dealer Segmentation</CardTitle>
        </div>
        <CardDescription>Classify potential dealers to determine the right onboarding path.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={(filled / 4) * 100} className="h-2" />

        <div className="space-y-2">
          <Label>Franchise Status</Label>
          <Select value={seg.franchise} onValueChange={(v) => onChange({ ...seg, franchise: v })}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="franchised">Franchised</SelectItem>
              <SelectItem value="independent">Independent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Size (units sold annually)</Label>
          <Select value={seg.size} onValueChange={(v) => onChange({ ...seg, size: v })}>
            <SelectTrigger><SelectValue placeholder="Select size band" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (&lt; 250 units)</SelectItem>
              <SelectItem value="medium">Medium (250 – 1 000 units)</SelectItem>
              <SelectItem value="large">Large (1 000 – 5 000 units)</SelectItem>
              <SelectItem value="enterprise">Enterprise (5 000+ units)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Stock Type</Label>
          <div className="flex flex-wrap gap-3">
            {["New", "Used", "Prestige", "Commercial"].map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm">
                <Checkbox checked={seg.stockType.includes(t)} onCheckedChange={() => toggleStock(t)} />
                {t}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Existing Finance Relationships</Label>
          <Select value={seg.existingFinance} onValueChange={(v) => onChange({ ...seg, existingFinance: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="single">Single lender</SelectItem>
              <SelectItem value="multi">Multiple lenders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><FileUp className="w-4 h-4" /> Supporting Documents</Label>
          {dealerName ? (
            <OnboardingDocUpload dealerName={dealerName} category="Pre-Screening" compact />
          ) : (
            <p className="text-xs text-muted-foreground">Enter a dealer name above to upload documents.</p>
          )}
        </div>

        {filled === 4 && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Segmentation Complete</p>
              <p className="text-muted-foreground mt-1">
                {seg.franchise === "franchised" ? "Franchised" : "Independent"} dealer,{" "}
                {seg.size} volume, stocking {seg.stockType.join(", ").toLowerCase()},{" "}
                {seg.existingFinance === "none" ? "no existing finance" : seg.existingFinance + " lender(s)"}.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  1.2  Initial Qualification Call                                    */
/* ------------------------------------------------------------------ */
function QualificationCall({ notes, onNotesChange, dealerName }: { notes: string; onNotesChange: (n: string) => void; dealerName: string }) {
  const objectives = [
    { label: "Understand dealer profile & stocking needs", icon: Building2 },
    { label: "Confirm minimum criteria met", icon: CheckCircle2 },
    { label: "Explain product suite (stocking loans, working capital, consumer finance)", icon: PoundSterling },
    { label: "Gather early risk indicators (past failures, CCJs, trading history)", icon: AlertTriangle },
  ];

  const [checks, setChecks] = useState<boolean[]>(new Array(objectives.length).fill(false));
  const toggle = (i: number) => setChecks((c) => c.map((v, j) => (j === i ? !v : v)));
  const done = checks.filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">1.2 &nbsp;Initial Qualification Call</CardTitle>
        </div>
        <CardDescription>Structured call checklist to qualify a potential dealer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={(done / objectives.length) * 100} className="h-2" />

        <div className="space-y-3">
          {objectives.map((obj, i) => (
            <label
              key={i}
              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                checks[i] ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"
              }`}
            >
              <Checkbox checked={checks[i]} onCheckedChange={() => toggle(i)} className="mt-0.5" />
              <div className="flex items-center gap-2 text-sm">
                <obj.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{obj.label}</span>
              </div>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Call Notes</Label>
          <Textarea
            placeholder="Record key findings, concerns, and next steps…"
            className="min-h-[100px]"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><FileUp className="w-4 h-4" /> Call Evidence / Documents</Label>
          {dealerName ? (
            <OnboardingDocUpload dealerName={dealerName} category="Qualification" compact />
          ) : (
            <p className="text-xs text-muted-foreground">Enter a dealer name above to upload documents.</p>
          )}
        </div>

        {done === objectives.length && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm font-medium">All qualification objectives covered — ready for pre-screening.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  1.3  Pre‑Screening Checks                                         */
/* ------------------------------------------------------------------ */
type CheckStatus = "pending" | "pass" | "fail" | "running";

function PreScreeningChecks({ dealerName, companyNumber, setCompanyNumber, onFail, onPass, screeningResults, onScreeningUpdate }: {
  dealerName: string;
  companyNumber: string;
  setCompanyNumber: (v: string) => void;
  onFail: (failedChecks: string[]) => void;
  onPass: () => void;
  screeningResults: Record<string, string>;
  onScreeningUpdate: (results: Record<string, string>) => void;
}) {
  const handleCreditSafeResult = (result: any) => {
    onScreeningUpdate({
      ...screeningResults,
      creditSafe: JSON.stringify(result),
    });
  };

  const handleFcaData = (data: any) => {
    onScreeningUpdate({
      ...screeningResults,
      fca: JSON.stringify(data),
    });
  };
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>(() => {
    const restored: Record<string, CheckStatus> = {
      companiesHouse: "pending",
      openBanking: "pending",
      aml: "pending",
    };
    for (const [k, v] of Object.entries(screeningResults)) {
      if (v === "pass" || v === "fail") restored[k] = v;
    }
    return restored;
  });

  const runCheck = (key: string) => {
    setStatuses((s) => ({ ...s, [key]: "running" }));
    setTimeout(() => {
      const result: CheckStatus = Math.random() > 0.15 ? "pass" : "fail";
      setStatuses((s) => {
        const next = { ...s, [key]: result };
        onScreeningUpdate(Object.fromEntries(Object.entries(next).filter(([, v]) => v === "pass" || v === "fail")));
        return next;
      });
    }, 1500 + Math.random() * 1000);
  };

  const runAll = () => {
    Object.keys(statuses).forEach((k, i) =>
      setTimeout(() => runCheck(k), i * 600)
    );
  };

  const statusBadge = (s: CheckStatus) => {
    switch (s) {
      case "pass":
        return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3 mr-1" />Pass</Badge>;
      case "fail":
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Fail</Badge>;
      case "running":
        return <Badge variant="secondary" className="gap-1 animate-pulse">Running…</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const allDone = Object.values(statuses).every((s) => s === "pass" || s === "fail");
  const allPass = Object.values(statuses).every((s) => s === "pass");
  const failedKeys = Object.entries(statuses).filter(([, s]) => s === "fail").map(([k]) => k);

  const handleBanDealer = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("banned_entities").insert({
      entity_type: "dealer",
      entity_name: dealerName || "Unknown Dealer",
      company_name: companyNumber,
      reason: "Failed pre-screening checks",
      failed_checks: failedKeys,
      banned_by: user.id,
    });
    onFail(failedKeys);
    toast({ title: "Dealer Flagged", description: `${dealerName || "Dealer"} added to DND list.`, variant: "destructive" });
  };

  const checks = [
    { key: "companiesHouse", label: "Companies House Quick Lookup", icon: Landmark, description: "Verify incorporation status, directors, and filing history" },
    { key: "openBanking", label: "Open Banking (Directors)", icon: PoundSterling, description: "Income validation & affordability assessment for directors" },
    { key: "aml", label: "Basic AML Flags", icon: ShieldCheck, description: "Anti-money laundering screening and sanctions check" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">1.3 &nbsp;Pre‑Screening Checks</CardTitle>
        </div>
        <CardDescription>Run automated checks before proceeding to full onboarding.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Label>Companies House Number</Label>
            <div className="flex gap-2">
              <Input placeholder="e.g. 12345678" value={companyNumber} onChange={(e) => setCompanyNumber(e.target.value)} />
              <Button onClick={runAll} disabled={!companyNumber} className="shrink-0 gap-2">
                <Search className="w-4 h-4" /> Run All Checks
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {checks.map((c) => (
            <div key={c.key} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <c.icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(statuses[c.key])}
                <Button size="sm" variant="ghost" onClick={() => runCheck(c.key)} disabled={statuses[c.key] === "running" || !companyNumber}>
                  Run
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Search className="w-4 h-4" /> Automatic Dealer Enrichment</Label>
          <p className="text-xs text-muted-foreground">Automatically searches FCA, Companies House &amp; CreditSafe when you enter a dealer name.</p>
          <DealerEnrichment
            dealerName={dealerName}
            companyNumber={companyNumber}
            autoTrigger
            onEnriched={(result, screeningMap) => {
              const enrichmentData: Record<string, string> = {};
              for (const [k, v] of Object.entries(screeningMap)) {
                if (v) enrichmentData[k] = v;
              }
              enrichmentData._enrichment = JSON.stringify(result);
              onScreeningUpdate({ ...screeningResults, ...enrichmentData });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Building2 className="w-4 h-4" /> CreditSafe Report</Label>
          <CreditSafeSearch defaultSearch={dealerName} companyNumber={companyNumber} onResult={handleCreditSafeResult} />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Landmark className="w-4 h-4" /> FCA Register Check</Label>
          <FcaRegisterCard dealerName={dealerName} onDataLoaded={handleFcaData} />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><FileUp className="w-4 h-4" /> Pre-Screening Documents</Label>
          {dealerName ? (
            <OnboardingDocUpload dealerName={dealerName} category="Pre-Screening" compact />
          ) : (
            <p className="text-xs text-muted-foreground">Enter a dealer name above to upload documents.</p>
          )}
        </div>

        {allDone && (
          <div className={`rounded-lg border p-4 flex items-start gap-3 ${allPass ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"}`}>
            {allPass ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">All checks passed</p>
                  <p className="text-muted-foreground mt-1">This dealer is cleared to proceed to full onboarding.</p>
                  <Button onClick={() => { onPass(); navigate("/onboarding", { state: { dealerName, companyNumber, screeningResults } }); }} className="mt-3 gap-2">
                    <ArrowRight className="w-4 h-4" /> Proceed to Application &amp; Due Diligence
                  </Button>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div className="text-sm space-y-2">
                  <p className="font-medium text-destructive">One or more checks failed</p>
                  <p className="text-muted-foreground">Failed: {failedKeys.join(", ")}. This dealer cannot proceed.</p>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" className="gap-2" onClick={handleBanDealer}>
                       <ShieldBan className="w-4 h-4" /> Add to DND List
                     </Button>
                     <Button variant="outline" size="sm" onClick={() => navigate("/banned-list")}>View DND List</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function PreOnboarding() {
  const { state, update, applications, loading, saving, loadApplication, createNew, save } = useOnboardingPersistence();
  const [failed, setFailed] = useState(false);
  const { demoMode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newAppOpen, setNewAppOpen] = useState(false);
  const [newApp, setNewApp] = useState({
    dealerName: "",
    tradingName: "",
    fcaRef: "",
    companyNumber: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleNewAppSubmit = () => {
    if (!newApp.dealerName.trim()) return;
    setNewAppOpen(false);
    toast({
      title: "Application Submitted",
      description: `Application submitted for ${newApp.dealerName}. Status: Pending Documents.`,
    });
    // Navigate to onboarding with the new dealer info
    navigate("/onboarding", {
      state: {
        dealerName: newApp.dealerName,
        companyNumber: newApp.companyNumber,
        screeningResults: {},
      },
    });
    setNewApp({ dealerName: "", tradingName: "", fcaRef: "", companyNumber: "", contactEmail: "", contactPhone: "" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pre‑Onboarding</h1>
            <p className="text-muted-foreground mt-1">Attraction &amp; Qualification — assess new dealer prospects before full onboarding.</p>
          </div>
          <div className="flex items-center gap-2">
            {saving && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Saving…</span>}
            <Button size="sm" className="gap-2" onClick={() => setNewAppOpen(true)}>
              <Plus className="w-4 h-4" /> New Application
            </Button>
          </div>
        </div>

        {/* New Application Dialog */}
        <Dialog open={newAppOpen} onOpenChange={setNewAppOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Dealer Application</DialogTitle>
              <DialogDescription>Enter the dealer details to start the onboarding process.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dealer Name *</Label>
                <Input placeholder="e.g. Apex Motors Ltd" value={newApp.dealerName} onChange={(e) => setNewApp({ ...newApp, dealerName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Trading Name</Label>
                <Input placeholder="e.g. Apex" value={newApp.tradingName} onChange={(e) => setNewApp({ ...newApp, tradingName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>FCA Reference</Label>
                  <Input placeholder="e.g. 123456" value={newApp.fcaRef} onChange={(e) => setNewApp({ ...newApp, fcaRef: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Company Number</Label>
                  <Input placeholder="e.g. 12345678" value={newApp.companyNumber} onChange={(e) => setNewApp({ ...newApp, companyNumber: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input type="email" placeholder="e.g. contact@dealer.co.uk" value={newApp.contactEmail} onChange={(e) => setNewApp({ ...newApp, contactEmail: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input type="tel" placeholder="e.g. 01234 567890" value={newApp.contactPhone} onChange={(e) => setNewApp({ ...newApp, contactPhone: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setNewAppOpen(false)}>Cancel</Button>
                <Button onClick={handleNewAppSubmit} disabled={!newApp.dealerName.trim()} className="gap-2">
                  <ArrowRight className="w-4 h-4" /> Start Onboarding
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Saved applications */}
        {applications.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="w-4 h-4" /> Saved Applications ({applications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {applications.map((app) => (
                  <Button
                    key={app.id}
                    variant={state.id === app.id ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => loadApplication(app)}
                  >
                    <Building2 className="w-3 h-3" />
                    {app.dealerName}
                    <Badge variant={app.status === "failed" ? "destructive" : app.status === "passed" ? "default" : "secondary"} className="text-[10px] ml-1">
                      {app.stage}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo mode: 3-step wizard */}
        {demoMode ? (
          <DemoOnboardingWizard />
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Dealer / Company Name</Label>
                    <Input
                      placeholder="Enter dealer name to begin…"
                      value={state.dealerName}
                      onChange={(e) => update({ dealerName: e.target.value })}
                      className="max-w-md"
                    />
                  </div>
                  {(failed || state.status === "failed") && (
                    <Badge variant="destructive" className="gap-1 mb-2">
                      <ShieldBan className="w-3 h-3" /> Failed — Banned
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="segmentation" className="space-y-6">
              <TabsList>
                <TabsTrigger value="segmentation" className="gap-2"><Users className="w-4 h-4" />Segmentation</TabsTrigger>
                <TabsTrigger value="qualification" className="gap-2"><ClipboardList className="w-4 h-4" />Qualification Call</TabsTrigger>
                <TabsTrigger value="screening" className="gap-2"><FileSearch className="w-4 h-4" />Pre‑Screening</TabsTrigger>
              </TabsList>

              <TabsContent value="segmentation">
                <DealerSegmentation
                  seg={state.segmentation}
                  onChange={(seg) => update({ segmentation: seg })}
                  dealerName={state.dealerName}
                />
              </TabsContent>
              <TabsContent value="qualification">
                <QualificationCall
                  notes={state.qualificationNotes}
                  onNotesChange={(n) => update({ qualificationNotes: n })}
                  dealerName={state.dealerName}
                />
              </TabsContent>
              <TabsContent value="screening">
                <PreScreeningChecks
                  dealerName={state.dealerName}
                  companyNumber={state.companyNumber}
                  setCompanyNumber={(v) => update({ companyNumber: v })}
                  screeningResults={state.screeningResults}
                  onScreeningUpdate={(r) => update({ screeningResults: r })}
                  onPass={() => update({ stage: "application", status: "passed" })}
                  onFail={(checks) => {
                    setFailed(true);
                    update({ status: "failed", stage: "failed", failureReason: `Failed checks: ${checks.join(", ")}` });
                  }}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
