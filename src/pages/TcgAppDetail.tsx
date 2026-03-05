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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  seederApplications,
  type OnboardingApplication,
} from "@/data/tcg/onboardingApplications";
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Pencil, Save, Loader2,
  Search, ChevronDown, ChevronRight, Plus, Building2, Shield, Send, Archive,
} from "lucide-react";

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

/* ── Stage stepper ────────────────────────────────────────── */
function StageStepper({ current, onClick, completionStatus }: {
  current: number; onClick: (s: number) => void; completionStatus: OnboardingApplication["completionStatus"];
}) {
  const stages = [
    { n: 1, label: "Pre-Screen & Details", done: completionStatus.allPreScreenChecksAnswered && completionStatus.dealerDetailsComplete },
    { n: 2, label: "Policies", done: completionStatus.allPoliciesAnswered },
    { n: 3, label: "Completion Review", done: completionStatus.onboardingComplete },
  ];
  return (
    <div className="flex items-center gap-1">
      {stages.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <button onClick={() => onClick(s.n)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${current === s.n ? "bg-primary text-primary-foreground" : s.done ? "bg-outcome-pass-bg text-outcome-pass-text hover:bg-outcome-pass-bg/80" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {s.done ? <CheckCircle2 className="w-4 h-4" /> : current === s.n ? <Loader2 className="w-4 h-4" /> : <span className="w-4 h-4 rounded-full border border-current inline-block" />}
            {s.n} {s.label}
          </button>
          {i < 2 && <span className="text-muted-foreground mx-1">→</span>}
        </div>
      ))}
    </div>
  );
}

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

  useEffect(() => {
    if (seedApp) {
      setApp({ ...seedApp });
      setActiveStage(seedApp.stage || 1);
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

  // Pre-screen
  const checks = Object.entries(app.preScreenChecks);
  const answeredChecks = checks.filter(([, c]) => c.answered).length;
  const allChecksAnswered = answeredChecks === checks.length;

  const updateCheck = (key: string, field: string, value: any) => {
    const updated = { ...app.preScreenChecks };
    updated[key] = { ...updated[key], [field]: value };
    if (field === "answered" && value === true) {
      updated[key].answeredBy = "Tom Griffiths";
      updated[key].answeredAt = new Date().toISOString();
    }
    updateApp({ preScreenChecks: updated });
  };

  // Policies
  const visiblePolicies = app.distributeInsurance === false
    ? app.policies.filter(p => p.category !== "Insurance (if applicable)")
    : app.policies;
  const answeredPolicies = visiblePolicies.filter(p => p.dealerHasIt !== null).length;
  const policiesTotal = visiblePolicies.length;
  const policyPct = policiesTotal > 0 ? Math.round((answeredPolicies / policiesTotal) * 100) : 0;
  const allPoliciesDone = answeredPolicies === policiesTotal;
  const categories = [...new Set(visiblePolicies.map(p => p.category))];

  // Completion
  const detailsComplete = !!(app.dealerName && app.companiesHouseNo && app.tradingName && app.primaryContact.name);
  const onboardingComplete = allChecksAnswered && allPoliciesDone && detailsComplete;

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

  const handleCompleteStage1 = () => {
    updateApp({ stage: 2, status: "In Progress" });
    addHistory("Pre-screen checks completed — proceeding to Policies");
    setActiveStage(2);
  };

  const handleCompleteStage2 = () => {
    updateApp({ stage: 3, status: onboardingComplete ? "Complete" : "In Progress" });
    addHistory("Policies completed — proceeding to Completion Review");
    setActiveStage(3);
  };

  return (
    <DashboardLayout>
      <div className="flex gap-5">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-5">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground" onClick={() => navigate("/tcg/onboarding")}>
            <ArrowLeft className="w-4 h-4" /> Back to Pipeline
          </Button>

          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{app.dealerName || "New Application"}</h1>
              <p className="text-sm text-muted-foreground">{app.appRef} · {app.requestingLenderName} · Initiated: {new Date(app.initiatedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
            </div>
            <StageStepper current={activeStage} onClick={s => setActiveStage(s)} completionStatus={app.completionStatus} />
            <div className="flex items-center gap-4 text-sm">
              <span>Assigned: <span className="font-medium">{app.assignedTo}</span></span>
              <Badge className={
                app.status === "Draft" ? "bg-muted text-muted-foreground" :
                app.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                app.status === "Complete" ? "bg-outcome-pass-bg text-outcome-pass-text" :
                "bg-primary/20 text-primary"
              }>{app.status}</Badge>
              {saving && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
            </div>
          </div>

          {/* STAGE 1 */}
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

              <div className="space-y-3">
                <h3 className="text-base font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> Pre-Screen Checks ({answeredChecks}/{checks.length} answered)</h3>
                {checks.map(([key, check]) => (
                  <Card key={key} className={check.answered ? "border-outcome-pass/20" : ""}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{check.label}</p>
                        {check.answered ? <Badge className="bg-outcome-pass-bg text-outcome-pass-text">✓ Answered</Badge> : <Badge variant="secondary">Pending</Badge>}
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Finding / Notes</Label>
                        <Textarea
                          value={check.finding}
                          onChange={e => updateCheck(key, "finding", e.target.value)}
                          placeholder="Record what you found..."
                          className="text-sm min-h-[60px] mt-1"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Button size="sm" variant={check.answered ? "default" : "outline"} onClick={() => updateCheck(key, "answered", !check.answered)} className="gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {check.answered ? "Answered ✓" : "Mark as Answered"}
                        </Button>
                        {check.answeredBy && <span className="text-[10px] text-muted-foreground">by {check.answeredBy} · {check.answeredAt ? new Date(check.answeredAt).toLocaleDateString("en-GB") : ""}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {allChecksAnswered && (
                <Card className="border-outcome-pass/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-outcome-pass-text flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> All pre-screen checks answered</p>
                    <Button onClick={handleCompleteStage1}>Proceed to Policies →</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* STAGE 2 */}
          {activeStage === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Progress value={policyPct} className="h-3 w-48" />
                  <span className="text-sm font-medium">{answeredPolicies}/{policiesTotal} answered ({policyPct}%)</span>
                </div>
              </div>

              <div className="space-y-3">
                {categories.map(cat => {
                  const catPolicies = visiblePolicies.filter(p => p.category === cat);
                  const catDone = catPolicies.filter(p => p.dealerHasIt !== null).length;
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
                          const idx = app.policies.findIndex(p => p.policyId === pol.policyId);
                          return (
                            <Card key={pol.policyId} className="ml-4">
                              <CardContent className="p-3 space-y-2">
                                <p className="text-sm font-medium">{pol.name}</p>
                                <div className="flex items-center gap-3">
                                  <Label className="text-xs text-muted-foreground">Dealer holds this?</Label>
                                  <RadioGroup
                                    value={pol.dealerHasIt === null ? "" : pol.dealerHasIt ? "yes" : "no"}
                                    onValueChange={v => {
                                      const next = [...app.policies];
                                      next[idx] = { ...next[idx], dealerHasIt: v === "yes", answeredBy: "Tom Griffiths", answeredAt: new Date().toISOString() };
                                      updateApp({ policies: next });
                                    }}
                                    className="flex gap-3"
                                  >
                                    <div className="flex items-center gap-1"><RadioGroupItem value="yes" id={`${pol.policyId}-yes`} /><Label htmlFor={`${pol.policyId}-yes`} className="text-xs">Yes</Label></div>
                                    <div className="flex items-center gap-1"><RadioGroupItem value="no" id={`${pol.policyId}-no`} /><Label htmlFor={`${pol.policyId}-no`} className="text-xs">No</Label></div>
                                  </RadioGroup>
                                </div>
                                <Input className="h-7 text-xs" value={pol.notes} onChange={e => {
                                  const next = [...app.policies];
                                  next[idx] = { ...next[idx], notes: e.target.value };
                                  updateApp({ policies: next });
                                }} placeholder="Notes..." />
                              </CardContent>
                            </Card>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>

              <Card className={allPoliciesDone ? "border-outcome-pass/30" : "border-muted"}>
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm">{answeredPolicies}/{policiesTotal} answered</span>
                  <Button onClick={handleCompleteStage2} disabled={!allPoliciesDone}>
                    {allPoliciesDone ? "Proceed to Review →" : "Answer all policies to proceed"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STAGE 3 */}
          {activeStage === 3 && (
            <div className="space-y-5">
              <Card>
                <CardHeader><CardTitle className="text-base">Completion Status</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Dealer details complete", done: detailsComplete },
                    { label: `Pre-screen checks (${answeredChecks}/${checks.length})`, done: allChecksAnswered },
                    { label: `Policies (${answeredPolicies}/${policiesTotal})`, done: allPoliciesDone },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      {item.done ? <CheckCircle2 className="w-5 h-5 text-outcome-pass" /> : <AlertTriangle className="w-5 h-5 text-outcome-pending" />}
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Pre-Screen Findings</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Check</TableHead><TableHead>Status</TableHead><TableHead>Finding</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {checks.map(([key, c]) => (
                        <TableRow key={key}>
                          <TableCell className="text-sm font-medium">{c.label}</TableCell>
                          <TableCell>{c.answered ? <Badge className="bg-outcome-pass-bg text-outcome-pass-text">✓</Badge> : <Badge variant="secondary">—</Badge>}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{c.finding || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Policy Summary</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-6 text-sm mb-3">
                    <span>Yes: <strong>{visiblePolicies.filter(p => p.dealerHasIt === true).length}</strong></span>
                    <span>No: <strong>{visiblePolicies.filter(p => p.dealerHasIt === false).length}</strong></span>
                    <span>Unanswered: <strong>{policiesTotal - answeredPolicies}</strong></span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <Button className="gap-2 w-full" disabled={!onboardingComplete || app.status === "Ready to Transfer"} onClick={handleMarkReady}>
                    <Send className="w-4 h-4" />
                    {app.status === "Ready to Transfer" ? "Already Marked Ready to Transfer" : onboardingComplete ? "Mark as Ready to Transfer" : "Complete All Sections First"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">This signals that all information has been gathered and the dealer record is ready to be transferred to the lender.</p>
                </CardContent>
              </Card>
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
                  app.status === "Complete" ? "bg-outcome-pass-bg text-outcome-pass-text" :
                  app.status === "Ready to Transfer" ? "bg-primary/20 text-primary" :
                  "bg-muted text-muted-foreground"
                }>{app.status}</Badge>
                <p className="text-xs text-muted-foreground">Stage {activeStage} of 3</p>
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
                  <p>Checks: {answeredChecks}/{checks.length} answered</p>
                  <p>Policies: {answeredPolicies}/{policiesTotal} ({policyPct}%)</p>
                  <p>DND: {app.dndClear ? "✅ Clear" : "🔴 Flagged"}</p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Notes</p>
                <div className="flex gap-1">
                  <Input className="h-7 text-xs flex-1" placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddNote()} />
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
