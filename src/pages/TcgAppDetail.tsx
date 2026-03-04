import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { masterPolicyList } from "@/data/tcg/dealerPolicies";
import {
  seederApplications,
  type OnboardingApplication,
  type PreScreenResults,
  type HistoryEntry,
} from "@/data/tcg/onboardingApplications";
import {
  ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Pencil, Save, Loader2,
  Search, ChevronDown, ChevronRight, FileText, Zap, Plus, Calendar, Clock,
  Users, Building2, Shield,
} from "lucide-react";

type PreScreenKey = "companiesHouse" | "fcaRegister" | "financialStanding" | "sanctionsAml" | "websiteCheck";
type PreScreenVal = "Pass" | "Fail" | "Refer for Manual Review" | "Not started" | "In progress";

interface PolicyState {
  id: string;
  name: string;
  category: string;
  exists: "yes" | "no" | "na" | null;
  documentUploaded: boolean;
  documentRequested: boolean;
  fileName: string | null;
  lastUpdated: string;
  notes: string;
}

/* ── Stage stepper ────────────────────────────────────────── */
function StageStepper({ current, s1Done, s2Done, s3Done, onClick }: {
  current: number; s1Done: boolean; s2Done: boolean; s3Done: boolean; onClick: (s: number) => void;
}) {
  const stages = [
    { n: 1, label: "Pre-Screen & Details", done: s1Done },
    { n: 2, label: "Policy Framework", done: s2Done },
    { n: 3, label: "Review & Approve", done: s3Done },
  ];
  return (
    <div className="flex items-center gap-1">
      {stages.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <button
            onClick={() => onClick(s.n)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              current === s.n
                ? "bg-primary text-primary-foreground"
                : s.done
                  ? "bg-outcome-pass-bg text-outcome-pass-text hover:bg-outcome-pass-bg/80"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.done ? <CheckCircle2 className="w-4 h-4" /> : current === s.n ? <Loader2 className="w-4 h-4" /> : <span className="w-4 h-4 rounded-full border border-current inline-block" />}
            {s.n} {s.label}
          </button>
          {i < 2 && <span className="text-muted-foreground mx-1">→</span>}
        </div>
      ))}
    </div>
  );
}

/* ── Inline editable field ────────────────────────────────── */
function InlineField({ label, value, onChange, mono, autoFilled }: {
  label: string; value: string; onChange: (v: string) => void; mono?: boolean; autoFilled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);

  useEffect(() => { setLocal(value); }, [value]);

  const save = () => {
    setEditing(false);
    if (local !== value) onChange(local);
  };

  return (
    <div className="flex items-start gap-2 py-1.5">
      <Label className="text-sm text-muted-foreground w-40 shrink-0 pt-1">{label}</Label>
      {editing ? (
        <Input
          value={local}
          onChange={e => setLocal(e.target.value)}
          onBlur={save}
          onKeyDown={e => e.key === "Enter" && save()}
          autoFocus
          className={`h-8 text-sm flex-1 ${mono ? "font-mono" : ""}`}
        />
      ) : (
        <div className="flex items-center gap-2 flex-1 min-h-[32px]">
          <span className={`text-sm ${mono ? "font-mono" : ""} ${value ? "text-foreground" : "text-muted-foreground italic"}`}>
            {value || "Not entered"}
          </span>
          {autoFilled && <Badge variant="secondary" className="text-[9px] h-4">Auto-filled</Badge>}
          <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground ml-1">
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Pre-screen check card ────────────────────────────────── */
const CHECK_LABELS: Record<PreScreenKey, { label: string; desc: string }> = {
  companiesHouse: { label: "Companies House Status", desc: "Confirm company is active, directors listed, PSCs disclosed" },
  fcaRegister: { label: "FCA Authorisation", desc: "Authorised, permissions correct, not lapsed" },
  financialStanding: { label: "Initial Financial Standing", desc: "Credit score, CCJs, accounts filed" },
  sanctionsAml: { label: "Sanctions & AML Initial Screen", desc: "Sanctions clear, no PEPs, adverse media check" },
  websiteCheck: { label: "Website & Initial Trading Check", desc: "Active website, APR visible, risk warnings present" },
};

function PreScreenCard({ checkKey, result, notes, onResult, onNotes, index }: {
  checkKey: PreScreenKey; result: PreScreenVal; notes: string;
  onResult: (v: PreScreenVal) => void; onNotes: (v: string) => void; index: number;
}) {
  const info = CHECK_LABELS[checkKey];
  const isRefer = result === "Refer for Manual Review";
  return (
    <Card className={isRefer ? "border-outcome-pending/40" : result === "Fail" ? "border-destructive/40" : ""}>
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold">{index + 1}. {info.label}</p>
          <p className="text-xs text-muted-foreground">{info.desc}</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground">Result:</Label>
          <div className="flex gap-2">
            {(["Pass", "Fail", "Refer for Manual Review"] as PreScreenVal[]).map(v => (
              <Button
                key={v}
                variant={result === v ? "default" : "outline"}
                size="sm"
                className={`text-xs h-7 ${
                  result === v && v === "Pass" ? "bg-outcome-pass text-white" :
                  result === v && v === "Fail" ? "bg-outcome-fail text-white" :
                  result === v && v === "Refer for Manual Review" ? "bg-outcome-pending text-white" : ""
                }`}
                onClick={() => onResult(v)}
              >
                {v === "Pass" ? "✅ Pass" : v === "Fail" ? "❌ Fail" : "⚠️ Refer"}
              </Button>
            ))}
          </div>
        </div>
        {isRefer && (
          <div className="rounded-lg bg-outcome-pending-bg border border-outcome-pending/30 p-3 space-y-2">
            <p className="text-xs text-outcome-pending-text font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> This check will be added to the Manual Review Queue. Describe the issue:
            </p>
            <Textarea value={notes} onChange={e => onNotes(e.target.value)} placeholder="Required: Describe the issue..." className="text-sm min-h-[60px]" />
          </div>
        )}
        {!isRefer && (
          <Textarea value={notes} onChange={e => onNotes(e.target.value)} placeholder="Notes (optional)" className="text-sm min-h-[40px]" />
        )}
        {result !== "Not started" && result !== "In progress" && (
          <p className="text-[10px] text-muted-foreground">
            Checked by: Tom Griffiths · {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Main page ────────────────────────────────────────────── */
export default function TcgAppDetail() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const seedApp = useMemo(() => seederApplications.find(a => a.id === appId), [appId]);

  // Local mutable state initialized from seeder
  const [app, setApp] = useState<OnboardingApplication | null>(null);
  const [activeStage, setActiveStage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [autoFilled, setAutoFilled] = useState<Set<string>>(new Set());

  // Policy state
  const [policies, setPolicies] = useState<PolicyState[]>([]);
  const [quickMode, setQuickMode] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  // Stage 3 state
  const [validityDays, setValidityDays] = useState("92");
  const [confirmChecks, setConfirmChecks] = useState([false, false, false, false]);
  const [referBackOpen, setReferBackOpen] = useState(false);
  const [referStage, setReferStage] = useState("1");
  const [referReason, setReferReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectCategory, setRejectCategory] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  // Sidebar
  const [noteText, setNoteText] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    if (seedApp) {
      setApp({ ...seedApp });
      setActiveStage(seedApp.stage || 1);

      // Init policies from seeder data
      const initPolicies: PolicyState[] = masterPolicyList
        .filter(p => seedApp.distributeInsurance !== false || p.category !== "Insurance (if applicable)")
        .map(p => {
          const confirmed = seedApp.policyCompletion.confirmed;
          const total = seedApp.policyCompletion.total;
          const idx = masterPolicyList.indexOf(p);
          const isConfirmed = idx < confirmed;
          return {
            id: p.id, name: p.name, category: p.category,
            exists: isConfirmed ? "yes" : null,
            documentUploaded: isConfirmed && Math.random() > 0.3,
            documentRequested: false,
            fileName: null, lastUpdated: "", notes: "",
          };
        });
      setPolicies(initPolicies);

      // Open all categories by default
      setOpenCategories(new Set(masterPolicyList.map(p => p.category)));
    }
  }, [seedApp]);

  const updateApp = useCallback((partial: Partial<OnboardingApplication>) => {
    setSaving(true);
    setApp(prev => prev ? { ...prev, ...partial } : prev);
    setTimeout(() => setSaving(false), 600);
  }, []);

  const addHistory = useCallback((action: string) => {
    setApp(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        history: [...prev.history, { date: new Date().toISOString(), action, user: "Tom Griffiths" }],
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: "Tom Griffiths",
      };
    });
  }, []);

  if (!app) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          Application not found.
          <Button variant="link" onClick={() => navigate("/tcg/onboarding")} className="ml-2">Back to Pipeline</Button>
        </div>
      </DashboardLayout>
    );
  }

  // Pre-screen state
  const preScreenKeys: PreScreenKey[] = ["companiesHouse", "fcaRegister", "financialStanding", "sanctionsAml", "websiteCheck"];
  const preScreenResults = app.preScreenResults;
  const allPreScreenDone = preScreenKeys.every(k => ["Pass", "Fail", "Refer for Manual Review"].includes(preScreenResults[k]));
  const anyFail = preScreenKeys.some(k => preScreenResults[k] === "Fail");

  const updatePreScreen = (key: PreScreenKey, val: PreScreenVal) => {
    updateApp({ preScreenResults: { ...preScreenResults, [key]: val } });
  };
  const updatePreScreenNotes = (notes: string) => {
    updateApp({ preScreenResults: { ...preScreenResults, notes } });
  };

  // Policy stats
  const policiesConfirmed = policies.filter(p => p.exists === "yes" || p.exists === "no" || p.exists === "na").length;
  const policiesTotal = policies.length;
  const policyPct = policiesTotal > 0 ? Math.round((policiesConfirmed / policiesTotal) * 100) : 0;
  const allPoliciesDone = policiesConfirmed === policiesTotal;

  const categories = [...new Set(policies.map(p => p.category))];

  const handleApprove = () => {
    const days = parseInt(validityDays);
    updateApp({
      status: "Approved",
      approvalDecision: "Approved",
      approvalBy: "Tom Griffiths",
      approvalDate: new Date().toISOString().slice(0, 10),
      stage3Complete: true,
    });
    addHistory(`Application approved — ${days}-day validity window`);
    toast({ title: "✅ Dealer Approved", description: `${app.dealerName} has been approved and added to the active dealer pool.` });
    setTimeout(() => navigate("/tcg/onboarding"), 1500);
  };

  const handleReferBack = () => {
    if (referReason.length < 20) return;
    const stage = parseInt(referStage);
    updateApp({ status: "In Progress", stage });
    addHistory(`Referred back to Stage ${stage}: ${referReason}`);
    setActiveStage(stage);
    setReferBackOpen(false);
    toast({ title: "Application referred back", description: `Moved to Stage ${stage}` });
  };

  const handleReject = () => {
    if (rejectNotes.length < 30) return;
    updateApp({
      status: "Rejected",
      approvalDecision: "Rejected",
      approvalBy: "Tom Griffiths",
      approvalDate: new Date().toISOString().slice(0, 10),
      rejectionReason: `${rejectCategory}: ${rejectNotes}`,
    });
    addHistory(`Application rejected: ${rejectCategory}`);
    setRejectOpen(false);
    toast({ title: "Application Rejected", description: app.dealerName, variant: "destructive" });
    setTimeout(() => navigate("/tcg/onboarding"), 1500);
  };

  const handleRunChecks = () => {
    setSaving(true);
    setTimeout(() => {
      // Simulate auto-fill from Companies House
      const filled = new Set<string>();
      if (!app.registeredAddress.street) {
        updateApp({
          registeredAddress: { street: "14 Whiteladies Road", town: "Bristol", county: "Bristol", postcode: "BS1 4DJ" },
        });
        filled.add("address");
      }
      // Auto-set pre-screen results
      const newResults: PreScreenResults = {
        ...preScreenResults,
        companiesHouse: preScreenResults.companiesHouse === "Not started" ? "Pass" : preScreenResults.companiesHouse,
        fcaRegister: preScreenResults.fcaRegister === "Not started" ? "Pass" : preScreenResults.fcaRegister,
        financialStanding: preScreenResults.financialStanding === "Not started" ? "Pass" : preScreenResults.financialStanding,
        sanctionsAml: preScreenResults.sanctionsAml === "Not started" ? "Pass" : preScreenResults.sanctionsAml,
        notes: preScreenResults.notes,
      };
      updateApp({ preScreenResults: newResults });
      setAutoFilled(prev => new Set([...prev, "address"]));
      addHistory("External checks completed (simulated)");
      setSaving(false);
      toast({ title: "✅ External checks completed", description: "Companies House, FCA, and CreditSafe data retrieved." });
    }, 1500);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addHistory(`Note: ${noteText.trim()}`);
    setNoteText("");
    toast({ title: "Note added" });
  };

  const handleCompleteStage1 = () => {
    updateApp({ stage1Complete: true, stage: 2, status: "In Progress" });
    addHistory("Stage 1 completed — proceeding to Policy Framework");
    setActiveStage(2);
  };

  const handleCompleteStage2 = () => {
    updateApp({
      stage2Complete: true, stage: 3, status: "Pending Approval",
      policyCompletion: { confirmed: policiesConfirmed, total: policiesTotal, percentComplete: policyPct },
    });
    addHistory("Stage 2 completed — proceeding to Review & Approve");
    setActiveStage(3);
  };

  return (
    <DashboardLayout>
      <div className="flex gap-5">
        {/* Main content — 80% */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Back link */}
          <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground" onClick={() => navigate("/tcg/onboarding")}>
            <ArrowLeft className="w-4 h-4" /> Back to Onboarding Pipeline
          </Button>

          {/* Header */}
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{app.dealerName}</h1>
              <p className="text-sm text-muted-foreground">
                {app.appRef} · {app.requestingLenderName} · Initiated: {new Date(app.initiatedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>

            <StageStepper
              current={activeStage}
              s1Done={app.stage1Complete}
              s2Done={app.stage2Complete}
              s3Done={app.stage3Complete}
              onClick={s => {
                if (s === 2 && !app.stage1Complete) {
                  toast({ title: "Complete Stage 1 first", variant: "destructive" });
                  return;
                }
                if (s === 3 && !app.stage2Complete) {
                  toast({ title: "Complete Stage 2 first", variant: "destructive" });
                  return;
                }
                setActiveStage(s);
              }}
            />

            <div className="flex items-center gap-4 text-sm">
              <span>Assigned: <span className="font-medium">{app.assignedTo}</span></span>
              <span>Target: <span className="font-medium">{app.targetApprovalDate}</span></span>
              <Badge className={
                app.status === "Draft" ? "bg-muted text-muted-foreground" :
                app.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                app.status === "Pending Approval" ? "bg-outcome-pending-bg text-outcome-pending-text" :
                app.status === "Approved" ? "bg-outcome-pass-bg text-outcome-pass-text" :
                "bg-outcome-fail-bg text-outcome-fail-text"
              }>{app.status}</Badge>
              {saving && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
            </div>
          </div>

          {/* ═══ STAGE 1 ═══ */}
          {activeStage === 1 && (
            <div className="space-y-5">
              {/* Dealer details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Dealer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <InlineField label="Company Name (legal)" value={app.dealerName} onChange={v => updateApp({ dealerName: v })} />
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <InlineField label="Companies House No." value={app.companiesHouseNo} onChange={v => updateApp({ companiesHouseNo: v })} mono />
                    </div>
                    {app.companiesHouseNo && (
                      <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={handleRunChecks} disabled={saving}>
                        <Search className="w-3 h-3" /> Run Checks
                      </Button>
                    )}
                  </div>
                  <InlineField label="Trading Name" value={app.tradingName} onChange={v => updateApp({ tradingName: v })} />
                  <InlineField label="Website" value={app.website} onChange={v => updateApp({ website: v })} />
                  <InlineField label="Primary Contact" value={app.primaryContact.name} onChange={v => updateApp({ primaryContact: { ...app.primaryContact, name: v } })} />
                  <InlineField label="Contact Email" value={app.primaryContact.email} onChange={v => updateApp({ primaryContact: { ...app.primaryContact, email: v } })} />
                  <InlineField label="Contact Phone" value={app.primaryContact.phone} onChange={v => updateApp({ primaryContact: { ...app.primaryContact, phone: v } })} />

                  <div className="pt-2 border-t mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Registered Address</p>
                    <InlineField label="Street" value={app.registeredAddress.street} onChange={v => updateApp({ registeredAddress: { ...app.registeredAddress, street: v } })} autoFilled={autoFilled.has("address")} />
                    <InlineField label="Town" value={app.registeredAddress.town} onChange={v => updateApp({ registeredAddress: { ...app.registeredAddress, town: v } })} autoFilled={autoFilled.has("address")} />
                    <InlineField label="County" value={app.registeredAddress.county} onChange={v => updateApp({ registeredAddress: { ...app.registeredAddress, county: v } })} autoFilled={autoFilled.has("address")} />
                    <InlineField label="Postcode" value={app.registeredAddress.postcode} onChange={v => updateApp({ registeredAddress: { ...app.registeredAddress, postcode: v } })} autoFilled={autoFilled.has("address")} />
                  </div>

                  <div className="pt-2 border-t mt-3 flex items-center gap-4">
                    <Label className="text-sm text-muted-foreground">Distributes insurance products?</Label>
                    <RadioGroup
                      value={app.distributeInsurance === true ? "yes" : app.distributeInsurance === false ? "no" : ""}
                      onValueChange={v => updateApp({ distributeInsurance: v === "yes" })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="ins-yes" /><Label htmlFor="ins-yes" className="text-sm">Yes</Label></div>
                      <div className="flex items-center gap-1"><RadioGroupItem value="no" id="ins-no" /><Label htmlFor="ins-no" className="text-sm">No</Label></div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Pre-screen checks */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Pre-Screen Checks
                </h3>
                {preScreenKeys.map((key, i) => (
                  <PreScreenCard
                    key={key}
                    checkKey={key}
                    result={preScreenResults[key]}
                    notes={key === "websiteCheck" ? preScreenResults.notes : ""}
                    onResult={v => updatePreScreen(key, v)}
                    onNotes={v => updatePreScreenNotes(v)}
                    index={i}
                  />
                ))}
              </div>

              {/* Stage 1 completion */}
              {allPreScreenDone && (
                <Card className={anyFail ? "border-destructive/30" : "border-outcome-pass/30"}>
                  <CardContent className="p-4">
                    {anyFail ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-destructive flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> 1 pre-screen check has failed. You may still proceed but this application cannot be approved until resolved.
                        </p>
                        <div className="flex gap-2">
                          <Button onClick={handleCompleteStage1}>Proceed to Stage 2 →</Button>
                          <Button variant="outline">Keep on Stage 1</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-outcome-pass-text flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> All pre-screen checks completed
                        </p>
                        <Button onClick={handleCompleteStage1}>Proceed to Stage 2 →</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {!allPreScreenDone && app.stage1Complete && (
                <div className="rounded-lg bg-outcome-pass-bg border border-outcome-pass/20 p-3 text-sm text-outcome-pass-text flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Stage 1 completed
                </div>
              )}
            </div>
          )}

          {/* ═══ STAGE 2 ═══ */}
          {activeStage === 2 && (
            <div className="space-y-4">
              {!app.stage1Complete ? (
                <Card className="border-outcome-pending/30">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="w-8 h-8 text-outcome-pending mx-auto mb-2" />
                    <p className="text-sm font-medium">Complete Stage 1 before proceeding to the Policy Framework.</p>
                    <Button variant="outline" className="mt-3" onClick={() => setActiveStage(1)}>Go to Stage 1</Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Instruction banner */}
                  <div className="bg-muted/40 border rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground text-sm">ℹ️ How This Works</p>
                    <p>Complete the policy framework by working through each category with the dealer. Mark each policy as Yes (held), No (not held), or N/A as applicable.</p>
                    <p>Uploading a document is encouraged but optional — mark "Document requested" if the dealer has confirmed the policy exists but hasn't yet submitted a copy.</p>
                    <p>All entries are auto-saved. You can close and return at any time.</p>
                  </div>

                  {/* Mode toggle + progress */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Progress value={policyPct} className="h-3 w-48" />
                      <span className="text-sm font-medium">{policiesConfirmed}/{policiesTotal} confirmed ({policyPct}%)</span>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => setQuickMode(!quickMode)}>
                      {quickMode ? <><ArrowLeft className="w-3 h-3" /> Standard View</> : <><Zap className="w-3 h-3" /> Quick Entry Mode</>}
                    </Button>
                  </div>

                  {quickMode ? (
                    /* Quick entry table */
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Policy Name</TableHead>
                              <TableHead className="w-[120px]">Exists</TableHead>
                              <TableHead className="w-[80px]">Doc</TableHead>
                              <TableHead className="w-[120px]">Last Updated</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {policies.map((pol, i) => (
                              <TableRow key={pol.id}>
                                <TableCell className="text-xs font-medium">{pol.name}</TableCell>
                                <TableCell>
                                  <Select value={pol.exists || ""} onValueChange={v => {
                                    const next = [...policies];
                                    next[i] = { ...next[i], exists: v as any };
                                    setPolicies(next);
                                  }}>
                                    <SelectTrigger className="h-7 text-xs w-[90px]"><SelectValue placeholder="—" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes</SelectItem>
                                      <SelectItem value="no">No</SelectItem>
                                      <SelectItem value="na">N/A</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Checkbox
                                    checked={pol.documentUploaded}
                                    onCheckedChange={v => {
                                      const next = [...policies];
                                      next[i] = { ...next[i], documentUploaded: !!v };
                                      setPolicies(next);
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    className="h-7 text-xs w-[100px]"
                                    type="date"
                                    value={pol.lastUpdated}
                                    onChange={e => {
                                      const next = [...policies];
                                      next[i] = { ...next[i], lastUpdated: e.target.value };
                                      setPolicies(next);
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    className="h-7 text-xs"
                                    value={pol.notes}
                                    onChange={e => {
                                      const next = [...policies];
                                      next[i] = { ...next[i], notes: e.target.value };
                                      setPolicies(next);
                                    }}
                                    placeholder="—"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    /* Standard card view by category */
                    <div className="space-y-3">
                      {categories.map(cat => {
                        const catPolicies = policies.filter(p => p.category === cat);
                        const catDone = catPolicies.filter(p => p.exists !== null).length;
                        const isOpen = openCategories.has(cat);
                        return (
                          <Collapsible key={cat} open={isOpen} onOpenChange={open => {
                            const next = new Set(openCategories);
                            open ? next.add(cat) : next.delete(cat);
                            setOpenCategories(next);
                          }}>
                            <CollapsibleTrigger asChild>
                              <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
                                <CardContent className="p-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    <span className="text-sm font-semibold">{cat}</span>
                                    <Badge variant="secondary" className="text-[10px]">{catDone}/{catPolicies.length}</Badge>
                                  </div>
                                  <Progress value={catPolicies.length > 0 ? (catDone / catPolicies.length) * 100 : 0} className="h-1.5 w-24" />
                                </CardContent>
                              </Card>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 mt-2">
                              {catPolicies.map(pol => {
                                const idx = policies.indexOf(pol);
                                return (
                                  <Card key={pol.id} className="ml-4">
                                    <CardContent className="p-3 space-y-2">
                                      <p className="text-sm font-medium">{pol.name}</p>
                                      <div className="flex items-center gap-3">
                                        <Label className="text-xs text-muted-foreground">Exists:</Label>
                                        <RadioGroup
                                          value={pol.exists || ""}
                                          onValueChange={v => {
                                            const next = [...policies];
                                            next[idx] = { ...next[idx], exists: v as any };
                                            setPolicies(next);
                                          }}
                                          className="flex gap-3"
                                        >
                                          <div className="flex items-center gap-1"><RadioGroupItem value="yes" id={`${pol.id}-yes`} /><Label htmlFor={`${pol.id}-yes`} className="text-xs">Yes</Label></div>
                                          <div className="flex items-center gap-1"><RadioGroupItem value="no" id={`${pol.id}-no`} /><Label htmlFor={`${pol.id}-no`} className="text-xs">No</Label></div>
                                          <div className="flex items-center gap-1"><RadioGroupItem value="na" id={`${pol.id}-na`} /><Label htmlFor={`${pol.id}-na`} className="text-xs">N/A</Label></div>
                                        </RadioGroup>
                                      </div>
                                      {pol.exists === "yes" && !pol.documentUploaded && (
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            checked={pol.documentRequested}
                                            onCheckedChange={v => {
                                              const next = [...policies];
                                              next[idx] = { ...next[idx], documentRequested: !!v };
                                              setPolicies(next);
                                            }}
                                            id={`${pol.id}-req`}
                                          />
                                          <Label htmlFor={`${pol.id}-req`} className="text-xs text-muted-foreground">Document requested — awaiting from dealer</Label>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2">
                                        {pol.documentUploaded ? (
                                          <Badge className="bg-outcome-pass-bg text-outcome-pass-text text-[10px]">✅ Uploaded</Badge>
                                        ) : pol.documentRequested ? (
                                          <Badge className="bg-outcome-pending-bg text-outcome-pending-text text-[10px]">🔄 Requested</Badge>
                                        ) : (
                                          <Badge variant="secondary" className="text-[10px]">○ No document</Badge>
                                        )}
                                      </div>
                                      <Input
                                        className="h-7 text-xs"
                                        value={pol.notes}
                                        onChange={e => {
                                          const next = [...policies];
                                          next[idx] = { ...next[idx], notes: e.target.value };
                                          setPolicies(next);
                                        }}
                                        placeholder="Notes..."
                                      />
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}

                  {/* Stage 2 completion */}
                  <Card className={allPoliciesDone ? "border-outcome-pass/30" : "border-muted"}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Progress value={policyPct} className="h-3 w-32" />
                        <span className="text-sm">{policiesConfirmed}/{policiesTotal} confirmed</span>
                        {!allPoliciesDone && <span className="text-xs text-muted-foreground">({policiesTotal - policiesConfirmed} remaining)</span>}
                      </div>
                      <Button onClick={handleCompleteStage2} disabled={!allPoliciesDone}>
                        {allPoliciesDone ? "Proceed to Stage 3 →" : "Complete all policies to proceed"}
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ═══ STAGE 3 ═══ */}
          {activeStage === 3 && (
            <div className="space-y-5">
              {!app.stage2Complete ? (
                <Card className="border-outcome-pending/30">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="w-8 h-8 text-outcome-pending mx-auto mb-2" />
                    <p className="text-sm font-medium">Complete Stage 2 before proceeding to Review & Approve.</p>
                    <Button variant="outline" className="mt-3" onClick={() => setActiveStage(2)}>Go to Stage 2</Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Pre-screen summary */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">Pre-Screen Summary</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Check</TableHead>
                            <TableHead>Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preScreenKeys.map(k => (
                            <TableRow key={k}>
                              <TableCell className="text-sm">{CHECK_LABELS[k].label}</TableCell>
                              <TableCell>
                                <Badge className={
                                  preScreenResults[k] === "Pass" ? "bg-outcome-pass-bg text-outcome-pass-text" :
                                  preScreenResults[k] === "Fail" ? "bg-outcome-fail-bg text-outcome-fail-text" :
                                  "bg-outcome-pending-bg text-outcome-pending-text"
                                }>{preScreenResults[k]}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Policy summary */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">Policy Framework Summary</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-3">
                        <Progress value={policyPct} className="h-3 flex-1" />
                        <span className="text-sm font-medium">{policiesConfirmed}/{policiesTotal} ({policyPct}%)</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Validity window */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">Validity Window</CardTitle></CardHeader>
                    <CardContent>
                      <Select value={validityDays} onValueChange={setValidityDays}>
                        <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="92">92 days (standard)</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Approval decision */}
                  <Card className="border-primary/20">
                    <CardHeader><CardTitle className="text-base">Approval Decision</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><p className="text-muted-foreground">Reviewing officer</p><p className="font-medium">Tom Griffiths (TCG Ops)</p></div>
                        <div><p className="text-muted-foreground">Date of review</p><p className="font-medium">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p></div>
                      </div>

                      <div className="space-y-2">
                        {[
                          "I confirm all pre-screen checks are satisfactory",
                          "I confirm the policy framework is complete to the required standard",
                          "I confirm this dealer is not on any Do Not Deal list",
                          "I confirm this application is ready to be surfaced to the lender",
                        ].map((label, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Checkbox
                              checked={confirmChecks[i]}
                              onCheckedChange={v => {
                                const next = [...confirmChecks];
                                next[i] = !!v;
                                setConfirmChecks(next);
                              }}
                              id={`confirm-${i}`}
                            />
                            <Label htmlFor={`confirm-${i}`} className="text-sm">{label}</Label>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          className="gap-1"
                          disabled={!confirmChecks.every(Boolean)}
                          onClick={handleApprove}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Confirm Approval
                        </Button>
                        <Button variant="outline" className="gap-1" onClick={() => setReferBackOpen(true)}>
                          <AlertTriangle className="w-4 h-4" /> Refer Back
                        </Button>
                        <Button variant="destructive" className="gap-1" onClick={() => setRejectOpen(true)}>
                          <XCircle className="w-4 h-4" /> Reject Application
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>

        {/* ═══ SIDEBAR ═══ */}
        <div className="w-72 shrink-0 sticky top-20 self-start space-y-4 hidden lg:block">
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Application Context</p>

              <div className="space-y-1 text-sm">
                <p className="font-mono text-xs text-muted-foreground">{app.appRef}</p>
                <Badge className={
                  app.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                  app.status === "Pending Approval" ? "bg-outcome-pending-bg text-outcome-pending-text" :
                  app.status === "Approved" ? "bg-outcome-pass-bg text-outcome-pass-text" :
                  app.status === "Rejected" ? "bg-outcome-fail-bg text-outcome-fail-text" :
                  "bg-muted text-muted-foreground"
                }>{app.status}</Badge>
                <p className="text-xs text-muted-foreground">Stage {activeStage} of 3</p>
              </div>

              <div className="border-t pt-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Assigned To</p>
                <p className="text-sm font-medium">{app.assignedTo}</p>
                <Select onValueChange={v => {
                  updateApp({ assignedTo: v });
                  addHistory(`Reassigned to ${v}`);
                  toast({ title: `Assigned to ${v}` });
                }}>
                  <SelectTrigger className="h-7 text-xs w-full"><SelectValue placeholder="Reassign..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tom Griffiths">Tom Griffiths</SelectItem>
                    <SelectItem value="Amara Osei">Amara Osei</SelectItem>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Target Date</p>
                <p className="text-sm font-medium">{app.targetApprovalDate}</p>
                <Input
                  type="date"
                  className="h-7 text-xs"
                  defaultValue={app.targetApprovalDate}
                  onChange={e => {
                    if (e.target.value) {
                      updateApp({ targetApprovalDate: e.target.value });
                      addHistory(`Target date changed to ${e.target.value}`);
                    }
                  }}
                />
              </div>

              <div className="border-t pt-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Lender</p>
                <p className="text-sm font-medium">{app.requestingLenderName}</p>
              </div>

              <div className="border-t pt-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Quick Stats</p>
                <div className="text-xs space-y-0.5">
                  <p>Pre-screen: {preScreenKeys.filter(k => preScreenResults[k] === "Pass").length} Pass, {preScreenKeys.filter(k => preScreenResults[k] === "Refer for Manual Review").length} Refer</p>
                  <p>Policies: {policiesConfirmed}/{policiesTotal} ({policyPct}%)</p>
                  <p>DND: {app.dndClear ? "✅ Clear" : "🔴 Flagged"}</p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Notes</p>
                <div className="flex gap-1">
                  <Input
                    className="h-7 text-xs flex-1"
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddNote()}
                  />
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handleAddNote}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="border-t pt-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">History</p>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {(showAllHistory ? app.history : app.history.slice(-3)).map((h, i) => (
                    <div key={i} className="text-[10px] text-muted-foreground">
                      <span className="font-medium text-foreground">{new Date(h.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                      {" "}{h.action}
                      <span className="text-muted-foreground/60"> — {h.user}</span>
                    </div>
                  ))}
                </div>
                {app.history.length > 3 && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] w-full" onClick={() => setShowAllHistory(!showAllHistory)}>
                    {showAllHistory ? "Show less" : `View all ${app.history.length} events →`}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Refer back modal */}
      <Dialog open={referBackOpen} onOpenChange={setReferBackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refer Application Back</DialogTitle>
            <DialogDescription>Select which stage to refer this application back to and provide a reason.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Refer to stage:</Label>
              <Select value={referStage} onValueChange={setReferStage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Stage 1 — Pre-Screen & Details</SelectItem>
                  <SelectItem value="2">Stage 2 — Policy Framework</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Reason (min 20 characters):</Label>
              <Textarea value={referReason} onChange={e => setReferReason(e.target.value)} placeholder="Describe why this is being referred back..." className="min-h-[80px]" />
              <p className="text-xs text-muted-foreground mt-1">{referReason.length}/20 characters</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReferBackOpen(false)}>Cancel</Button>
              <Button onClick={handleReferBack} disabled={referReason.length < 20}>Confirm Referral</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject modal */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>This action cannot be undone. Provide a reason for rejection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Rejection reason:</Label>
              <Select value={rejectCategory} onValueChange={setRejectCategory}>
                <SelectTrigger><SelectValue placeholder="Select reason..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FCA authorisation failed">FCA authorisation failed</SelectItem>
                  <SelectItem value="DND match confirmed">DND match confirmed</SelectItem>
                  <SelectItem value="Pre-screen failure">Pre-screen failure</SelectItem>
                  <SelectItem value="Director sanctions confirmed">Director sanctions confirmed</SelectItem>
                  <SelectItem value="Dealer non-responsive">Dealer non-responsive</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Notes (min 30 characters):</Label>
              <Textarea value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} placeholder="Provide detailed rejection notes..." className="min-h-[80px]" />
              <p className="text-xs text-muted-foreground mt-1">{rejectNotes.length}/30 characters</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={rejectNotes.length < 30 || !rejectCategory}>Confirm Rejection</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
