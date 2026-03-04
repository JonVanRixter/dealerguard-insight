import { useState, useMemo } from "react";
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
import { FieldSourceIndicator } from "@/components/tcg-onboarding/FieldSourceIndicator";
import {
  seederApplications, getOnboardingStats,
  type OnboardingApplication, type OnboardingAppStatus,
} from "@/data/tcg/onboardingApplications";
import {
  Plus, Search, Filter, Clock, CheckCircle2, AlertTriangle, XCircle,
  FileText, Users, Eye, ArrowRight, BarChart3, Loader2,
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

/* ── Days until target ────────────────────────────────────── */
function daysUntilTarget(target: string) {
  const days = Math.ceil((new Date(target).getTime() - Date.now()) / 86400000);
  if (days < 0) return <span className="text-outcome-fail text-xs font-medium">⏰ {Math.abs(days)}d overdue</span>;
  if (days <= 3) return <span className="text-outcome-fail text-xs font-medium">🔴 {days}d</span>;
  if (days <= 7) return <span className="text-outcome-pending text-xs font-medium">🟡 {days}d</span>;
  return <span className="text-muted-foreground text-xs">{days}d</span>;
}

/* ── Application detail modal ─────────────────────────────── */
function AppDetailModal({ app, open, onClose }: { app: OnboardingApplication | null; open: boolean; onClose: () => void }) {
  if (!app) return null;
  const r = app.preScreenResults;
  const checkItems = [
    { label: "Companies House", result: r.companiesHouse },
    { label: "FCA Register", result: r.fcaRegister },
    { label: "Financial Standing", result: r.financialStanding },
    { label: "Sanctions / AML", result: r.sanctionsAml },
    { label: "Website Check", result: r.websiteCheck },
  ];

  const resultColor = (res: string) =>
    res === "Pass" ? "text-outcome-pass" :
    res === "Fail" ? "text-outcome-fail" :
    res === "Refer for Manual Review" ? "text-outcome-pending" :
    res === "In progress" ? "text-blue-600" : "text-muted-foreground";

  const resultSource = (res: string) =>
    res === "Pass" ? "api" as const :
    res === "Fail" ? "api" as const :
    res === "Refer for Manual Review" ? "manual" as const : "pending_automation" as const;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {app.dealerName}
            {statusBadge(app.status)}
          </DialogTitle>
          <DialogDescription>{app.appRef} · Requesting lender: {app.requestingLenderName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Company details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Trading Name</p>
              <p className="font-medium">{app.tradingName || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">CH Number</p>
              <p className="font-mono font-medium">{app.companiesHouseNo || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Primary Contact</p>
              <p className="font-medium">{app.primaryContact.name || "—"}</p>
              {app.primaryContact.email && <p className="text-xs text-muted-foreground">{app.primaryContact.email}</p>}
            </div>
            <div>
              <p className="text-muted-foreground">Address</p>
              <p className="font-medium text-xs">
                {app.registeredAddress.street ? `${app.registeredAddress.street}, ${app.registeredAddress.town}, ${app.registeredAddress.postcode}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Assigned To</p>
              <p className="font-medium">{app.assignedTo}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target Approval</p>
              <p className="font-medium">{app.targetApprovalDate} {daysUntilTarget(app.targetApprovalDate)}</p>
            </div>
          </div>

          {/* Pre-screen checks */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Pre-Screen Checks
            </h4>
            <div className="space-y-1.5">
              {checkItems.map(c => (
                <div key={c.label} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-sm flex items-center gap-1.5">
                    {c.label}
                    <FieldSourceIndicator source={resultSource(c.result)} />
                  </span>
                  <span className={`text-sm font-medium ${resultColor(c.result)}`}>{c.result}</span>
                </div>
              ))}
            </div>
            {r.notes && (
              <p className="text-xs text-outcome-pending-text mt-2 bg-outcome-pending-bg rounded p-2">{r.notes}</p>
            )}
          </div>

          {/* Policy completion */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Policy Framework
            </h4>
            <div className="flex items-center gap-3">
              <Progress value={app.policyCompletion.percentComplete} className="h-3 flex-1" />
              <span className="text-sm font-medium">{app.policyCompletion.confirmed}/{app.policyCompletion.total} ({app.policyCompletion.percentComplete}%)</span>
            </div>
          </div>

          {/* Manual review items */}
          {app.manualReviewItems.length > 0 && (
            <div className="rounded-lg border border-outcome-pending/30 bg-outcome-pending-bg p-3">
              <h4 className="text-sm font-semibold text-outcome-pending-text mb-1 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Manual Review Required
              </h4>
              <ul className="text-sm text-outcome-pending-text space-y-0.5">
                {app.manualReviewItems.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
          )}

          {/* Notes */}
          {app.notes && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Notes</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2">{app.notes}</p>
            </div>
          )}

          {/* History */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Activity History</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {app.history.map((h, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-muted-foreground whitespace-nowrap">{new Date(h.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                  <span className="text-foreground">{h.action}</span>
                  <span className="text-muted-foreground ml-auto">{h.user}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rejection reason */}
          {app.rejectionReason && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Rejected: {app.rejectionReason}
              </p>
              <p className="text-xs text-muted-foreground mt-1">By {app.approvalBy} on {app.approvalDate}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main page ────────────────────────────────────────────── */
export default function Onboarding() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<OnboardingApplication | null>(null);
  const [activeTab, setActiveTab] = useState("pipeline");

  const stats = useMemo(() => getOnboardingStats(seederApplications), []);

  const filtered = useMemo(() => {
    return seederApplications.filter(app => {
      if (search && !app.dealerName.toLowerCase().includes(search.toLowerCase()) && !app.appRef.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (assigneeFilter !== "all" && app.assignedTo !== assigneeFilter) return false;
      return true;
    });
  }, [search, statusFilter, assigneeFilter]);

  const byStage = useMemo(() => ({
    drafts: filtered.filter(a => a.status === "Draft"),
    stage1: filtered.filter(a => a.status === "In Progress" && a.stage === 1),
    stage2: filtered.filter(a => a.status === "In Progress" && a.stage === 2),
    stage3: filtered.filter(a => a.status === "Pending Approval"),
    rejected: filtered.filter(a => a.status === "Rejected"),
  }), [filtered]);

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
          <Button className="gap-2" onClick={() => navigate("/pre-onboarding")}>
            <Plus className="w-4 h-4" /> New Application
          </Button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Drafts", value: stats.drafts, icon: FileText, color: "text-muted-foreground" },
            { label: "In Progress", value: stats.inProgress, icon: Loader2, color: "text-blue-600" },
            { label: "Pending Approval", value: stats.pendingApproval, icon: Clock, color: "text-outcome-pending" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-outcome-fail" },
            { label: "Referrals", value: stats.referrals, icon: AlertTriangle, color: "text-outcome-pending" },
            { label: "Avg Policy %", value: `${stats.avgPolicyCompletion}%`, icon: BarChart3, color: "text-primary" },
          ].map(kpi => (
            <Card key={kpi.label}>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                      onClick={() => setSelectedApp(app)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-muted-foreground">{app.appRef}</span>
                          {daysUntilTarget(app.targetApprovalDate)}
                        </div>
                        <p className="text-sm font-medium leading-tight">{app.dealerName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">{app.assignedTo}</span>
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
                        <Badge variant="outline" className="text-[10px]">{app.requestingLenderName.split(" ").slice(0, 2).join(" ")}</Badge>
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
                      <TableRow key={app.id} className="cursor-pointer" onClick={() => setSelectedApp(app)}>
                        <TableCell className="font-mono text-sm">{app.appRef}</TableCell>
                        <TableCell className="font-medium">{app.dealerName}</TableCell>
                        <TableCell>{statusBadge(app.status)}</TableCell>
                        <TableCell>{stageBar(app)}</TableCell>
                        <TableCell className="text-sm">{app.assignedTo}</TableCell>
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
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}>
                            <Eye className="w-3 h-3" /> View
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

        {/* Detail modal */}
        <AppDetailModal app={selectedApp} open={!!selectedApp} onClose={() => setSelectedApp(null)} />
      </div>
    </DashboardLayout>
  );
}
