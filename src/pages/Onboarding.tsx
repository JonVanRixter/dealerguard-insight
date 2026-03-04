import { useState, useMemo, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FieldSourceIndicator } from "@/components/tcg-onboarding/FieldSourceIndicator";
import {
  seederApplications, getOnboardingStats,
  type OnboardingApplication, type OnboardingAppStatus,
} from "@/data/tcg/onboardingApplications";
import { masterPolicyList } from "@/data/tcg/dealerPolicies";
import {
  Plus, Search, Filter, Clock, CheckCircle2, AlertTriangle, XCircle,
  FileText, Users, Eye, ArrowRight, BarChart3, Loader2, Upload, Pencil,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ── Status badge ─────────────────────────────────────────── */
function statusBadge(status: OnboardingAppStatus) {
  const map: Record<OnboardingAppStatus, string> = {
    Draft: "bg-muted text-muted-foreground",
    "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "Pending Approval": "bg-outcome-pending-bg text-outcome-pending-text",
    Approved: "bg-outcome-pass-bg text-outcome-pass-text",
    Rejected: "bg-outcome-fail-bg text-outcome-fail-text",
  };
  return <Badge className={map[status]}>{status}</Badge>;
}

/* ── Pre-screen summary ───────────────────────────────────── */
function preScreenSummary(app: OnboardingApplication) {
  const r = app.preScreenResults;
  const checks = [r.companiesHouse, r.fcaRegister, r.financialStanding, r.sanctionsAml, r.websiteCheck];
  const passes = checks.filter(c => c === "Pass").length;
  const fails = checks.filter(c => c === "Fail").length;
  const refers = checks.filter(c => c === "Refer for Manual Review").length;
  const notStarted = checks.filter(c => c === "Not started").length;

  if (notStarted === 5) return <span className="text-muted-foreground text-xs">Not started</span>;
  if (fails > 0) return <Badge className="bg-outcome-fail-bg text-outcome-fail-text text-xs">❌ {fails} fail</Badge>;
  if (refers > 0) return <Badge className="bg-outcome-pending-bg text-outcome-pending-text text-xs">⚠️ {refers} refer</Badge>;
  if (passes === 5) return <Badge className="bg-outcome-pass-bg text-outcome-pass-text text-xs">✓ All pass</Badge>;
  return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">In progress</Badge>;
}

/* ── Days until target ────────────────────────────────────── */
function daysUntilTarget(target: string) {
  const days = Math.ceil((new Date(target).getTime() - Date.now()) / 86400000);
  if (days < 0) return <span className="text-outcome-fail text-xs font-medium">⏰ {Math.abs(days)}d overdue</span>;
  if (days <= 3) return <span className="text-outcome-fail text-xs font-medium">🔴 {days}d</span>;
  if (days <= 7) return <span className="text-outcome-pending text-xs font-medium">🟡 {days}d</span>;
  return <span className="text-muted-foreground text-xs">{days}d</span>;
}

/* ── Stage progress bar ───────────────────────────────────── */
function stageBar(app: OnboardingApplication) {
  const pct = app.stage === 0 ? 0 :
    app.stage === 1 ? (app.stage1Complete ? 33 : 15) :
    app.stage === 2 ? (app.stage2Complete ? 66 : 33 + (app.policyCompletion.percentComplete / 100 * 33)) :
    app.stage === 3 ? (app.stage3Complete ? 100 : 85) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <Progress value={pct} className="h-2 flex-1" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {app.stage > 0 ? `S${app.stage}` : "—"} {app.policyCompletion.percentComplete > 0 ? `· ${app.policyCompletion.percentComplete}%` : ""}
      </span>
    </div>
  );
}

/* ── Upload Policy List Modal ─────────────────────────────── */
function UploadPolicyModal({ open, onClose, navigate }: { open: boolean; onClose: () => void; navigate: (path: string) => void }) {
  const { toast } = useToast();
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [uploadType, setUploadType] = useState<"apply-standard" | "upload-custom">("apply-standard");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applicableApps = seederApplications.filter(a =>
    a.status !== "Rejected" && a.status !== "Approved"
  );

  const handleApplyStandard = () => {
    if (!selectedAppId) {
      toast({ title: "Select an application", variant: "destructive" });
      return;
    }
    toast({
      title: "✅ Policy framework applied",
      description: `${masterPolicyList.length} policies loaded into the application. Navigate to Stage 2 to complete.`,
    });
    onClose();
    navigate(`/tcg/onboarding/${selectedAppId}`);
  };

  const handleFileUpload = () => {
    if (!selectedAppId) {
      toast({ title: "Select an application first", variant: "destructive" });
      return;
    }
    toast({
      title: "✅ Policy list uploaded",
      description: "Custom policy list parsed and applied. Navigate to Stage 2 to review and complete.",
    });
    onClose();
    navigate(`/tcg/onboarding/${selectedAppId}`);
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Apply Policy Framework
          </DialogTitle>
          <DialogDescription>
            Load the standard 26-policy compliance framework into an application, or upload a custom policy list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Select application */}
          <div>
            <Label className="text-sm font-medium">Target Application</Label>
            <Select value={selectedAppId} onValueChange={setSelectedAppId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select an application..." />
              </SelectTrigger>
              <SelectContent>
                {applicableApps.map(app => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.appRef} — {app.dealerName} (Stage {app.stage})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload type selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Policy Source</Label>

            <Card
              className={`cursor-pointer transition-shadow hover:shadow-sm ${uploadType === "apply-standard" ? "ring-2 ring-primary border-primary" : ""}`}
              onClick={() => setUploadType("apply-standard")}
            >
              <CardContent className="p-3 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0 mt-0.5">
                  {uploadType === "apply-standard" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="text-sm font-medium">Apply Standard Framework</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Load all {masterPolicyList.length} standard compliance policies ({masterPolicyList.filter(p => p.category !== "Insurance (if applicable)").length} core + {masterPolicyList.filter(p => p.category === "Insurance (if applicable)").length} insurance).
                    Categories: Core Compliance, Finance & Credit, Customer Protection, Financial Crime, Data & Information, People & Governance, Operational, Insurance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-shadow hover:shadow-sm ${uploadType === "upload-custom" ? "ring-2 ring-primary border-primary" : ""}`}
              onClick={() => setUploadType("upload-custom")}
            >
              <CardContent className="p-3 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0 mt-0.5">
                  {uploadType === "upload-custom" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="text-sm font-medium">Upload Custom Policy List</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Upload a CSV or Excel file with your own policy list. Expected columns: Policy Name, Category, Required (Y/N).
                  </p>
                  {uploadType === "upload-custom" && (
                    <div className="mt-2">
                      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-3 h-3" /> Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Policy preview */}
          {uploadType === "apply-standard" && (
            <div className="rounded-lg border bg-muted/30 p-3 max-h-[200px] overflow-y-auto">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                {masterPolicyList.length} POLICIES IN STANDARD FRAMEWORK
              </p>
              {[...new Set(masterPolicyList.map(p => p.category))].map(cat => {
                const catPolicies = masterPolicyList.filter(p => p.category === cat);
                return (
                  <div key={cat} className="mb-2">
                    <p className="text-[11px] font-semibold text-foreground">{cat} ({catPolicies.length})</p>
                    {catPolicies.map(p => (
                      <p key={p.id} className="text-[10px] text-muted-foreground ml-3">• {p.name}</p>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            {uploadType === "apply-standard" && (
              <Button onClick={handleApplyStandard} disabled={!selectedAppId} className="gap-1">
                <CheckCircle2 className="w-4 h-4" /> Apply & Open Application
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main page ────────────────────────────────────────────── */
export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("pipeline");
  const [referralFilter, setReferralFilter] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);

  const stats = useMemo(() => getOnboardingStats(seederApplications), []);

  const filtered = useMemo(() => {
    return seederApplications.filter(app => {
      if (search && !app.dealerName.toLowerCase().includes(search.toLowerCase()) && !app.appRef.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (assigneeFilter !== "all" && app.assignedTo !== assigneeFilter) return false;
      if (referralFilter && app.manualReviewItems.length === 0) return false;
      return true;
    });
  }, [search, statusFilter, assigneeFilter, referralFilter]);

  const byStage = useMemo(() => ({
    drafts: filtered.filter(a => a.status === "Draft"),
    stage1: filtered.filter(a => a.status === "In Progress" && a.stage === 1),
    stage2: filtered.filter(a => a.status === "In Progress" && a.stage === 2),
    stage3: filtered.filter(a => a.status === "Pending Approval"),
    rejected: filtered.filter(a => a.status === "Rejected"),
  }), [filtered]);

  const openApp = (app: OnboardingApplication) => {
    navigate(`/tcg/onboarding/${app.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Onboarding Pipeline</h1>
            <p className="text-muted-foreground mt-1">
              Live queue of dealer applications — {stats.total} applications across all stages.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setPolicyModalOpen(true)}>
              <Upload className="w-4 h-4" /> Apply Policy List
            </Button>
            <Button className="gap-2" onClick={() => navigate("/tcg/onboarding/new")}>
              <Plus className="w-4 h-4" /> New Application
            </Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Drafts", value: stats.drafts, icon: FileText, color: "text-muted-foreground", filter: "Draft" },
            { label: "In Progress", value: stats.inProgress, icon: Loader2, color: "text-blue-600", filter: "In Progress" },
            { label: "Pending Approval", value: stats.pendingApproval, icon: Clock, color: "text-outcome-pending", filter: "Pending Approval" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-outcome-fail", filter: "Rejected" },
            { label: "Referrals", value: stats.referrals, icon: AlertTriangle, color: "text-outcome-pending", filter: "referrals" },
            { label: "Avg Policy %", value: `${stats.avgPolicyCompletion}%`, icon: BarChart3, color: "text-primary", filter: null },
          ].map(kpi => (
            <Card
              key={kpi.label}
              className={`${kpi.filter ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${statusFilter === kpi.filter || (kpi.filter === "referrals" && referralFilter) ? "ring-2 ring-primary" : ""}`}
              onClick={() => {
                if (!kpi.filter) return;
                if (kpi.filter === "referrals") {
                  setStatusFilter("all");
                  setSearch("");
                  setAssigneeFilter("all");
                  setActiveTab("table");
                  setReferralFilter(prev => !prev);
                } else {
                  setReferralFilter(false);
                  setStatusFilter(statusFilter === kpi.filter ? "all" : kpi.filter);
                  setSearch("");
                  setAssigneeFilter("all");
                }
              }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active filter indicator */}
        {(statusFilter !== "all" || referralFilter) && (
          <div className="flex items-center gap-2 text-sm bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
            <span className="text-primary font-medium">
              Filtered: {referralFilter ? "Referrals only" : statusFilter}
            </span>
            <span className="text-muted-foreground">· {filtered.length} application{filtered.length !== 1 ? "s" : ""}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs ml-auto"
              onClick={() => { setStatusFilter("all"); setReferralFilter(false); }}
            >
              Clear filter ✕
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search dealer or ref..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setReferralFilter(false); }}>
            <SelectTrigger className="w-[170px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Pending Approval">Pending Approval</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[170px]">
              <Users className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value="Tom Griffiths">Tom Griffiths</SelectItem>
              <SelectItem value="Amara Osei">Amara Osei</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          {/* Pipeline (Kanban-style columns) */}
          <TabsContent value="pipeline" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { title: "📋 Drafts", apps: byStage.drafts, color: "border-muted" },
                { title: "🔍 Stage 1 — Pre-Screen", apps: byStage.stage1, color: "border-blue-300 dark:border-blue-700" },
                { title: "📄 Stage 2 — Policies", apps: byStage.stage2, color: "border-blue-500 dark:border-blue-600" },
                { title: "✅ Stage 3 — Approval", apps: byStage.stage3, color: "border-outcome-pending" },
                { title: "❌ Rejected", apps: byStage.rejected, color: "border-destructive/40" },
              ].map(col => (
                <div key={col.title} className={`rounded-xl border-2 ${col.color} bg-muted/20 p-3 space-y-2`}>
                  <h3 className="text-sm font-semibold flex items-center justify-between">
                    {col.title}
                    <Badge variant="secondary" className="text-xs">{col.apps.length}</Badge>
                  </h3>
                  {col.apps.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4 text-center">No applications</p>
                  )}
                  {col.apps.map(app => (
                    <Card
                      key={app.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openApp(app)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-muted-foreground">{app.appRef}</span>
                          {daysUntilTarget(app.targetApprovalDate)}
                        </div>
                        <p className="text-sm font-medium leading-tight">{app.dealerName}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] ${app.assignedTo === "Unassigned" ? "text-outcome-pending font-medium" : "text-muted-foreground"}`}>
                            👤 {app.assignedTo}
                          </span>
                          {preScreenSummary(app)}
                        </div>
                        {app.policyCompletion.percentComplete > 0 && (
                          <div className="flex items-center gap-2">
                            <Progress value={app.policyCompletion.percentComplete} className="h-1.5 flex-1" />
                            <span className="text-[10px] text-muted-foreground">{app.policyCompletion.percentComplete}%</span>
                          </div>
                        )}
                        {app.manualReviewItems.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-outcome-pending">
                            <AlertTriangle className="w-3 h-3" />
                            {app.manualReviewItems.length} referral{app.manualReviewItems.length > 1 ? "s" : ""}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <Badge variant="outline" className="text-[10px]">{app.requestingLenderName.split(" ").slice(0, 2).join(" ")}</Badge>
                          <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-0.5 text-primary px-1">
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Table view */}
          <TabsContent value="table" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>App Ref</TableHead>
                      <TableHead>Dealer Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Lender</TableHead>
                      <TableHead>Pre-Screen</TableHead>
                      <TableHead>Policies</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(app => (
                      <TableRow key={app.id} className="cursor-pointer" onClick={() => openApp(app)}>
                        <TableCell className="font-mono text-sm">{app.appRef}</TableCell>
                        <TableCell className="font-medium">{app.dealerName}</TableCell>
                        <TableCell>{statusBadge(app.status)}</TableCell>
                        <TableCell>{stageBar(app)}</TableCell>
                        <TableCell>
                          <span className={`text-sm ${app.assignedTo === "Unassigned" ? "text-outcome-pending font-medium" : ""}`}>
                            {app.assignedTo}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{app.requestingLenderName.split(" ").slice(0, 2).join(" ")}</span>
                        </TableCell>
                        <TableCell>{preScreenSummary(app)}</TableCell>
                        <TableCell>
                          {app.policyCompletion.percentComplete > 0 ? (
                            <div className="flex items-center gap-2">
                              <Progress value={app.policyCompletion.percentComplete} className="h-1.5 w-16" />
                              <span className="text-xs">{app.policyCompletion.percentComplete}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{daysUntilTarget(app.targetApprovalDate)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={(e) => { e.stopPropagation(); openApp(app); }}
                          >
                            <Pencil className="w-3 h-3" /> Open
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Policy upload modal */}
        <UploadPolicyModal open={policyModalOpen} onClose={() => setPolicyModalOpen(false)} navigate={navigate} />
      </div>
    </DashboardLayout>
  );
}
