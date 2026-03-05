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
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  seederApplications,
  type OnboardingApplication,
  type PreScreenCheck,
} from "@/data/tcg/onboardingApplications";
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Pencil, Loader2,
  ChevronDown, Plus, Building2, Shield, Send, Archive,
} from "lucide-react";

/* ── Risk badge ───────────────────────────────────────────── */
function RiskBadge({ rating }: { rating: "High" | "Medium" }) {
  if (rating === "High") return <Badge className="bg-destructive/10 text-destructive text-[10px] font-medium">🔴 High</Badge>;
  return <Badge className="bg-outcome-pending-bg text-outcome-pending-text text-[10px] font-medium">🟡 Medium</Badge>;
}

/* ── Inline editable field ────────────────────────────────── */
function InlineField({ label, value, onChange, mono }: {
  label: string; value: string; onChange: (v: string) => void; mono?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);
  const save = () => { setEditing(false); if (local !== value) onChange(local); };
  return (
    <div className="flex items-start gap-2 py-1.5">
      <Label className="text-sm text-muted-foreground w-40 shrink-0 pt-1">{label}</Label>
      {editing ? (
        <Input value={local} onChange={e => setLocal(e.target.value)} onBlur={save} onKeyDown={e => e.key === "Enter" && save()} autoFocus className={`h-8 text-sm flex-1 ${mono ? "font-mono" : ""}`} />
      ) : (
        <div className="flex items-center gap-2 flex-1 min-h-[32px]">
          <span className={`text-sm ${mono ? "font-mono" : ""} ${value ? "text-foreground" : "text-muted-foreground italic"}`}>{value || "Not entered"}</span>
          <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground ml-1"><Pencil className="w-3 h-3" /></button>
        </div>
      )}
    </div>
  );
}

/* ── Stage stepper (2-step) ───────────────────────────────── */
function StageStepper({ current, onClick, preScreenDone, policiesDone }: {
  current: number; onClick: (s: number) => void; preScreenDone: boolean; policiesDone: boolean;
}) {
  const stages = [
    { n: 1, label: "Compliance Checks", done: preScreenDone },
    { n: 2, label: "Policies", done: policiesDone },
  ];
  const bothComplete = preScreenDone && policiesDone;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {stages.map((s, i) => (
        <div key={s.n} className="flex items-center">
          {i > 0 && <span className="text-muted-foreground mx-1">→</span>}
          <button onClick={() => onClick(s.n)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${current === s.n ? "bg-primary text-primary-foreground" : s.done ? "bg-outcome-pass-bg text-outcome-pass-text hover:bg-outcome-pass-bg/80" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {s.done ? <CheckCircle2 className="w-4 h-4" /> : current === s.n ? <Loader2 className="w-4 h-4" /> : <span className="w-4 h-4 rounded-full border border-current inline-block" />}
            {s.n} {s.label}
            {s.done && <span>✅</span>}
          </button>
        </div>
      ))}
      {bothComplete && (
        <span className="text-sm font-medium text-outcome-pass-text flex items-center gap-1.5 ml-2">
          🟢 All checks complete
        </span>
      )}
    </div>
  );
}

/* ── Policy categories ────────────────────────────────────── */
const POLICY_CATEGORIES = [
  "Governance", "Consumer Duty", "Financial Crime",
  "Permissions & Conduct", "Financial Promotions", "Insurance (if applicable)",
];

/* ── Main page ────────────────────────────────────────────── */
export default function TcgAppDetail() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const seedApp = useMemo(() => seederApplications.find(a => a.id === appId), [appId]);
  const [app, setApp] = useState<OnboardingApplication | null>(null);
  const [activeStage, setActiveStage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");
  const [checkValidationErrors, setCheckValidationErrors] = useState<Record<string, string>>({});
  const [expandedAnswered, setExpandedAnswered] = useState<Record<string, boolean>>({});
  const [quickEntry, setQuickEntry] = useState(false);
  const [policyValidationErrors, setPolicyValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (seedApp) {
      setApp({ ...seedApp });
      setActiveStage(Math.min(seedApp.stage || 1, 2));
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
      return { ...prev, history: [...prev.history, { date: new Date().toISOString(), action, user: "Tom Griffiths" }], lastUpdated: new Date().toISOString(), lastUpdatedBy: "Tom Griffiths" };
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

  // Checks
  const answeredChecks = app.checks.filter(c => c.answered).length;
  const totalChecks = app.checks.length;
  const allChecksAnswered = answeredChecks === totalChecks;

  // Group checks by section
  const checkSections = useMemo(() => {
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

  const updateCheck = (checkId: string, field: string, value: any) => {
    const updated = app.checks.map(c => {
      if (c.checkId !== checkId) return c;
      if (field === "answered" && value === true) {
        if (!c.finding.trim()) {
          setCheckValidationErrors(prev => ({ ...prev, [checkId]: "Please add a finding or note before marking this check as answered." }));
          return c;
        }
        setCheckValidationErrors(prev => { const n = { ...prev }; delete n[checkId]; return n; });
        return { ...c, answered: true, answeredBy: "Tom Griffiths", answeredAt: new Date().toISOString() };
      } else if (field === "answered" && value === false) {
        return { ...c, answered: false, answeredBy: null, answeredAt: null };
      } else {
        const next = { ...c, [field]: value };
        if (field === "finding" && value.trim()) {
          setCheckValidationErrors(prev => { const n = { ...prev }; delete n[checkId]; return n; });
        }
        return next;
      }
    });
    updateApp({ checks: updated });
  };

  // Policies
  const visiblePolicies = app.distributeInsurance === false
    ? app.policies.filter(p => p.category !== "Insurance (if applicable)")
    : app.policies;

  const isPolicyAnswered = (p: typeof visiblePolicies[0]) => p.dealerHasIt !== null && p.notes.trim() !== "";
  const answeredPolicies = visiblePolicies.filter(isPolicyAnswered).length;
  const policiesTotal = visiblePolicies.length;
  const policyPct = policiesTotal > 0 ? Math.round((answeredPolicies / policiesTotal) * 100) : 0;
  const allPoliciesDone = answeredPolicies === policiesTotal;
  const categories = [...new Set(visiblePolicies.map(p => p.category))].filter(c => POLICY_CATEGORIES.includes(c));

  // Completion
  const detailsComplete = !!(app.dealerName && app.companiesHouseNo && app.tradingName && app.primaryContact.name);
  const onboardingComplete = allChecksAnswered && allPoliciesDone && detailsComplete;
  const canMarkReady = onboardingComplete && app.status !== "Ready to Transfer";

  const handleMarkReady = () => {
    updateApp({
      status: "Ready to Transfer",
      completionStatus: { ...app.completionStatus, readyToTransfer: true, completedBy: "Tom Griffiths", completedAt: new Date().toISOString(), onboardingComplete: true },
    });
    addHistory("Marked as ready to transfer");
    toast({ title: "✅ Ready to Transfer", description: `${app.dealerName} has been marked as ready to transfer.` });
    setTimeout(() => navigate("/tcg/onboarding"), 1500);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addHistory(`Note: ${noteText.trim()}`);
    setNoteText("");
    toast({ title: "Note added" });
  };

  const handleArchive = () => {
    if (!archiveReason.trim()) return;
    updateApp({ status: "Archived" as any });
    addHistory(`Application archived: ${archiveReason.trim()}`);
    toast({ title: "Archived", description: `${app.dealerName} has been archived.` });
    setShowArchiveModal(false);
    setArchiveReason("");
    setTimeout(() => navigate("/tcg/onboarding"), 1500);
  };

  const updatePolicy = (polId: string, field: string, value: unknown) => {
    const next = [...app.policies];
    const idx = next.findIndex(p => p.policyId === polId);
    if (idx === -1) return;
    next[idx] = { ...next[idx], [field]: value, answeredBy: "Tom Griffiths", answeredAt: new Date().toISOString() };
    updateApp({ policies: next });
    if (field === "notes" && (value as string).trim()) {
      setPolicyValidationErrors(prev => { const n = { ...prev }; delete n[polId]; return n; });
    }
    if (field === "dealerHasIt") {
      const pol = next[idx];
      if (!pol.notes.trim()) {
        setPolicyValidationErrors(prev => ({ ...prev, [polId]: "Please add a note before this policy is marked as answered." }));
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex gap-5">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-5">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground" onClick={() => navigate("/tcg/onboarding")}>
            <ArrowLeft className="w-4 h-4" /> Back to Pipeline
          </Button>

          {/* Header */}
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{app.dealerName || "New Application"}</h1>
              <p className="text-sm text-muted-foreground">{app.appRef} · {app.requestingLenderName} · Initiated: {new Date(app.initiatedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
            </div>
            <StageStepper current={activeStage} onClick={s => { if (s === 2 && !allChecksAnswered) return; setActiveStage(s); }} preScreenDone={allChecksAnswered && detailsComplete} policiesDone={allPoliciesDone} />

            {/* Header progress indicator */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-muted-foreground shrink-0">Pre-Screen:</span>
                <Progress value={totalChecks > 0 ? Math.round((answeredChecks / totalChecks) * 100) : 0} className="h-2 w-32" />
                <span className="text-xs font-medium shrink-0">{answeredChecks}/{totalChecks} checks</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-muted-foreground shrink-0">Policies:</span>
                <Progress value={policyPct} className="h-2 w-32" />
                <span className="text-xs font-medium shrink-0">{answeredPolicies}/{policiesTotal} answered</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span>Assigned: <span className="font-medium">{app.assignedTo}</span></span>
              <span>Target: {new Date(app.targetCompletionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
              <Badge className={
                app.status === "Draft" ? "bg-muted text-muted-foreground" :
                app.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                app.status === "Ready to Transfer" ? "bg-outcome-pass-bg text-outcome-pass-text" :
                "bg-muted text-muted-foreground"
              }>{app.status}</Badge>
              {saving && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
            </div>

            {/* Action buttons in header */}
            <div className="flex items-center gap-2 flex-wrap">
              {canMarkReady && (
                <Button onClick={handleMarkReady} className="gap-2">
                  <Send className="w-4 h-4" /> Mark as Ready to Transfer
                </Button>
              )}
              {app.status === "Ready to Transfer" && (
                <Badge className="bg-outcome-pass-bg text-outcome-pass-text py-1.5 px-3">✅ Already marked ready to transfer</Badge>
              )}
              <Button variant="outline" size="sm" className="gap-1" onClick={() => { if (noteText.trim()) handleAddNote(); else document.getElementById("note-input")?.focus(); }}>
                <Plus className="w-3 h-3" /> Add Note
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-muted-foreground hover:text-destructive" onClick={() => setShowArchiveModal(true)}>
                <Archive className="w-3 h-3" /> Archive Application
              </Button>
            </div>
          </div>

          {/* STAGE 1 — Compliance Checks */}
          {activeStage === 1 && (
            <div className="space-y-5">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" /> Dealer Details</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                  <InlineField label="Company Name" value={app.dealerName} onChange={v => updateApp({ dealerName: v })} />
                  <InlineField label="Companies House No." value={app.companiesHouseNo} onChange={v => updateApp({ companiesHouseNo: v })} mono />
                  <InlineField label="Trading Name" value={app.tradingName} onChange={v => updateApp({ tradingName: v })} />
                  <InlineField label="Website" value={app.website} onChange={v => updateApp({ website: v })} />
                  <InlineField label="Primary Contact" value={app.primaryContact.name} onChange={v => updateApp({ primaryContact: { ...app.primaryContact, name: v } })} />
                  <InlineField label="Contact Email" value={app.primaryContact.email} onChange={v => updateApp({ primaryContact: { ...app.primaryContact, email: v } })} />
                  <InlineField label="Contact Phone" value={app.primaryContact.phone} onChange={v => updateApp({ primaryContact: { ...app.primaryContact, phone: v } })} />
                  <div className="pt-2 border-t mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Registered Address</p>
                    <InlineField label="Street" value={app.registeredAddress.street} onChange={v => updateApp({ registeredAddress: { ...app.registeredAddress, street: v } })} />
                    <InlineField label="Town" value={app.registeredAddress.town} onChange={v => updateApp({ registeredAddress: { ...app.registeredAddress, town: v } })} />
                    <InlineField label="County" value={app.registeredAddress.county} onChange={v => updateApp({ registeredAddress: { ...app.registeredAddress, county: v } })} />
                    <InlineField label="Postcode" value={app.registeredAddress.postcode} onChange={v => updateApp({ registeredAddress: { ...app.registeredAddress, postcode: v } })} />
                  </div>
                </CardContent>
              </Card>

              <h3 className="text-base font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> Compliance Checks ({answeredChecks}/{totalChecks} answered)</h3>

              {checkSections.map((section) => (
                <Collapsible key={section.sectionId} defaultOpen>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <ChevronDown className="w-4 h-4" />
                        <span className="text-sm font-semibold">{section.sectionName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{section.answered}/{section.total}</Badge>
                        {section.answered === section.total && <CheckCircle2 className="w-4 h-4 text-outcome-pass" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
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
                                  <p className="text-sm text-muted-foreground mt-1 truncate">"{check.finding}"</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Answered by {check.answeredBy} · {check.answeredAt ? new Date(check.answeredAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="gap-1 text-xs shrink-0" onClick={() => setExpandedAnswered(prev => ({ ...prev, [check.checkId]: true }))}>
                                <Pencil className="w-3 h-3" /> Edit
                              </Button>
                            </div>
                          )}

                          {showFull && (
                            <div className="p-4 space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs text-muted-foreground">{check.checkId}</span>
                                <p className="text-sm font-medium">{check.label}</p>
                                <RiskBadge rating={check.riskRating} />
                              </div>
                              <div className="bg-muted/50 rounded-md p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Objective:</p>
                                <p className="text-xs text-muted-foreground">{check.objective}</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1">Frequency: {check.frequency}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Finding / Notes</Label>
                                <Textarea value={check.finding} onChange={e => updateCheck(check.checkId, "finding", e.target.value)} placeholder="Record what you found..." className="text-sm min-h-[60px] mt-1" />
                                {checkValidationErrors[check.checkId] && (
                                  <p className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3" /> {checkValidationErrors[check.checkId]}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Checkbox id={`chk-${check.checkId}`} checked={check.answered} onCheckedChange={(checked) => updateCheck(check.checkId, "answered", !!checked)} />
                                  <Label htmlFor={`chk-${check.checkId}`} className="text-sm cursor-pointer">Mark as answered</Label>
                                </div>
                                {check.answeredBy && <span className="text-[10px] text-muted-foreground">Answered by: {check.answeredBy} · {check.answeredAt ? new Date(check.answeredAt).toLocaleDateString("en-GB") : "—"}</span>}
                              </div>
                              {isAnswered && isExpanded && (
                                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setExpandedAnswered(prev => { const n = { ...prev }; delete n[check.checkId]; return n; })}>Collapse</Button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ))}

              {/* Pre-screen progress */}
              <Card className="sticky bottom-4 z-10 shadow-lg">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium shrink-0">Compliance Checks:</span>
                    <Progress value={totalChecks > 0 ? Math.round((answeredChecks / totalChecks) * 100) : 0} className="flex-1" />
                    <span className="text-sm font-medium shrink-0">{answeredChecks} of {totalChecks} answered</span>
                  </div>
                </CardContent>
              </Card>

              {allChecksAnswered && (
                <div className="flex items-center justify-between p-4 rounded-lg border border-outcome-pass/30 bg-outcome-pass-bg/30">
                  <p className="text-sm font-medium text-outcome-pass-text flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> All {totalChecks} compliance checks answered</p>
                  <Button onClick={() => setActiveStage(2)}>Proceed to Policies →</Button>
                </div>
              )}
            </div>
          )}

          {/* STAGE 2 — Policies */}
          {activeStage === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Progress value={policyPct} className="h-3 w-48" />
                  <span className="text-sm font-medium">{answeredPolicies}/{policiesTotal} answered ({policyPct}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Quick Entry</Label>
                  <Switch checked={quickEntry} onCheckedChange={setQuickEntry} />
                </div>
              </div>

              {quickEntry ? (
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[280px]">Policy Name</TableHead>
                          <TableHead className="w-[100px]">Holds Policy</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="w-[80px]">Answered</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visiblePolicies.map(pol => {
                          const polAnswered = isPolicyAnswered(pol);
                          return (
                            <TableRow key={pol.policyId}>
                              <TableCell className="text-sm font-medium">{pol.name}</TableCell>
                              <TableCell>
                                <RadioGroup value={pol.dealerHasIt === null ? "" : pol.dealerHasIt ? "yes" : "no"} onValueChange={v => updatePolicy(pol.policyId, "dealerHasIt", v === "yes")} className="flex gap-2">
                                  <div className="flex items-center gap-1"><RadioGroupItem value="yes" id={`q-${pol.policyId}-y`} /><Label htmlFor={`q-${pol.policyId}-y`} className="text-xs">Y</Label></div>
                                  <div className="flex items-center gap-1"><RadioGroupItem value="no" id={`q-${pol.policyId}-n`} /><Label htmlFor={`q-${pol.policyId}-n`} className="text-xs">N</Label></div>
                                </RadioGroup>
                              </TableCell>
                              <TableCell>
                                <Input className="h-7 text-xs" value={pol.notes} onChange={e => updatePolicy(pol.policyId, "notes", e.target.value)} placeholder="Notes..." />
                                {policyValidationErrors[pol.policyId] && <p className="text-[10px] text-destructive mt-0.5">{policyValidationErrors[pol.policyId]}</p>}
                              </TableCell>
                              <TableCell className="text-center">
                                {polAnswered ? <CheckCircle2 className="w-4 h-4 text-outcome-pass mx-auto" /> : <span className="text-xs text-muted-foreground">☐</span>}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {POLICY_CATEGORIES.filter(cat => categories.includes(cat)).map(cat => {
                    const catPolicies = visiblePolicies.filter(p => p.category === cat);
                    const catDone = catPolicies.filter(isPolicyAnswered).length;
                    return (
                      <Collapsible key={cat} defaultOpen>
                        <CollapsibleTrigger asChild>
                          <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <CardContent className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ChevronDown className="w-4 h-4" />
                                <span className="text-sm font-semibold">{cat}</span>
                                <Badge variant="secondary" className="text-[10px]">{catDone}/{catPolicies.length}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 mt-2">
                          {catPolicies.map(pol => {
                            const polAnswered = isPolicyAnswered(pol);
                            const borderColor = polAnswered
                              ? pol.dealerHasIt ? "border-l-4 border-l-outcome-pass" : "border-l-4 border-l-outcome-pending"
                              : "border-l-4 border-l-muted-foreground/30";
                            const bgColor = polAnswered
                              ? pol.dealerHasIt ? "bg-[hsl(140,50%,97%)]" : "bg-[hsl(45,90%,97%)]"
                              : "";
                            return (
                              <Card key={pol.policyId} className={`ml-4 ${borderColor} ${bgColor}`}>
                                <CardContent className="p-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{pol.name}</p>
                                    <span className="text-xs text-muted-foreground">{pol.category}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Label className="text-xs text-muted-foreground">Dealer holds this?</Label>
                                    <RadioGroup value={pol.dealerHasIt === null ? "" : pol.dealerHasIt ? "yes" : "no"} onValueChange={v => updatePolicy(pol.policyId, "dealerHasIt", v === "yes")} className="flex gap-3">
                                      <div className="flex items-center gap-1"><RadioGroupItem value="yes" id={`${pol.policyId}-yes`} /><Label htmlFor={`${pol.policyId}-yes`} className="text-xs">Yes</Label></div>
                                      <div className="flex items-center gap-1"><RadioGroupItem value="no" id={`${pol.policyId}-no`} /><Label htmlFor={`${pol.policyId}-no`} className="text-xs">No</Label></div>
                                    </RadioGroup>
                                  </div>
                                  <div>
                                    <Input className="h-7 text-xs" value={pol.notes} onChange={e => updatePolicy(pol.policyId, "notes", e.target.value)} placeholder="Notes..." />
                                    {policyValidationErrors[pol.policyId] && <p className="text-[10px] text-destructive mt-0.5">{policyValidationErrors[pol.policyId]}</p>}
                                  </div>
                                  {polAnswered && (
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      {pol.dealerHasIt ? <CheckCircle2 className="w-3 h-3 text-outcome-pass" /> : <AlertTriangle className="w-3 h-3 text-outcome-pending" />}
                                      Answered by {pol.answeredBy} · {pol.answeredAt ? new Date(pol.answeredAt).toLocaleDateString("en-GB") : ""}
                                    </p>
                                  )}
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

              {/* Policy progress */}
              <Card className="sticky bottom-4 z-10 shadow-lg">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium shrink-0">Policy Checklist:</span>
                    <Progress value={policyPct} className="flex-1" />
                    <span className="text-sm font-medium shrink-0">{answeredPolicies} of {policiesTotal} answered</span>
                    {policiesTotal - answeredPolicies > 0 && <Badge className="bg-outcome-pending-bg text-outcome-pending-text">{policiesTotal - answeredPolicies} remaining</Badge>}
                  </div>
                </CardContent>
              </Card>

              {onboardingComplete && app.status !== "Ready to Transfer" && (
                <div className="flex items-center justify-between p-4 rounded-lg border border-outcome-pass/30 bg-outcome-pass-bg/30">
                  <p className="text-sm font-medium text-outcome-pass-text flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> All policies answered · Both sections complete
                  </p>
                  <Button onClick={handleMarkReady} className="gap-2"><Send className="w-4 h-4" /> Mark as Ready to Transfer</Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="w-72 shrink-0 sticky top-20 self-start space-y-4 hidden lg:block">
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Application Context</p>
              <div className="space-y-1 text-sm">
                <p className="font-mono text-xs text-muted-foreground">{app.appRef}</p>
                <Badge className={
                  app.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                  app.status === "Ready to Transfer" ? "bg-outcome-pass-bg text-outcome-pass-text" :
                  "bg-muted text-muted-foreground"
                }>{app.status}</Badge>
                <p className="text-xs text-muted-foreground">Stage {activeStage} of 2</p>
              </div>

              <div className="border-t pt-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Assigned To</p>
                <p className="text-sm font-medium">{app.assignedTo}</p>
                <Select onValueChange={v => { updateApp({ assignedTo: v }); addHistory(`Reassigned to ${v}`); }}>
                  <SelectTrigger className="h-7 text-xs w-full"><SelectValue placeholder="Reassign..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tom Griffiths">Tom Griffiths</SelectItem>
                    <SelectItem value="Amara Osei">Amara Osei</SelectItem>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Quick Stats</p>
                <div className="text-xs space-y-0.5">
                  <p>Checks: {answeredChecks}/{totalChecks} answered</p>
                  <p>Policies: {answeredPolicies}/{policiesTotal} answered</p>
                  <p>DND: {(() => {
                    const s1c4 = app.checks.find(c => c.checkId === "s1_c4");
                    const s5c2 = app.checks.find(c => c.checkId === "s5_c2");
                    const bothDone = s1c4?.answered && s5c2?.answered;
                    return bothDone ? "✅ Checked" : "○ Not yet checked";
                  })()}</p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Notes</p>
                <div className="flex gap-1">
                  <Input id="note-input" className="h-7 text-xs flex-1" placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddNote()} />
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handleAddNote}><Plus className="w-3 h-3" /></Button>
                </div>
              </div>

              <div className="border-t pt-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">History</p>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {(showAllHistory ? app.history : app.history.slice(-3)).map((h, i) => (
                    <div key={i} className="text-[10px] text-muted-foreground">
                      <span className="font-medium text-foreground">{new Date(h.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                      {" "}{h.action} <span className="text-muted-foreground/60">— {h.user}</span>
                    </div>
                  ))}
                </div>
                {app.history.length > 3 && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] w-full" onClick={() => setShowAllHistory(!showAllHistory)}>
                    {showAllHistory ? "Show less" : `View all ${app.history.length} events →`}
                  </Button>
                )}
              </div>

              <div className="border-t pt-3">
                <Button variant="outline" size="sm" className="w-full gap-1 text-xs text-muted-foreground hover:text-destructive" onClick={() => setShowArchiveModal(true)}>
                  <Archive className="w-3 h-3" /> Archive Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Archive modal */}
      <Dialog open={showArchiveModal} onOpenChange={open => { if (!open) { setShowArchiveModal(false); setArchiveReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Application</DialogTitle>
            <DialogDescription>
              This application will be removed from the pipeline board. Please provide a reason for archiving.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <p className="text-sm font-semibold">{app.dealerName}</p>
              <p className="text-xs text-muted-foreground">{app.appRef}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Reason for archiving *</Label>
              <Textarea
                rows={3}
                value={archiveReason}
                onChange={e => setArchiveReason(e.target.value)}
                placeholder="e.g. FCA authorisation lapsed, director sanctions match confirmed..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setShowArchiveModal(false); setArchiveReason(""); }}>Cancel</Button>
              <Button onClick={handleArchive} disabled={!archiveReason.trim()} className="gap-1">
                <Archive className="w-4 h-4" /> Archive
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
