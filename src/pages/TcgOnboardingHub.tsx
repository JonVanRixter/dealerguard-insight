import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Eye, Search, LayoutGrid, List, Clock, AlertTriangle, XCircle, FileText, Users,
  ArrowRight, ArrowUpDown, ArrowUp, ArrowDown, Download, UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTcgOnboarding } from "@/hooks/useTcgOnboarding";
import {
  seederApplications, getOnboardingStats,
  type OnboardingApplication, type OnboardingAppStatus,
} from "@/data/tcg/onboardingApplications";

/* ── helpers ──────────────────────────────────────────────── */

function isOverdue(app: OnboardingApplication) {
  return app.status !== "Approved" && app.status !== "Rejected" && new Date(app.targetApprovalDate) < new Date();
}

function daysUntilTarget(target: string) {
  const days = Math.ceil((new Date(target).getTime() - Date.now()) / 86400000);
  if (days < 0) return <span className="text-outcome-fail text-xs font-semibold">⏰ {Math.abs(days)}d overdue</span>;
  if (days <= 3) return <span className="text-outcome-fail text-xs font-semibold">🔴 {days}d</span>;
  if (days <= 7) return <span className="text-outcome-pending text-xs font-semibold">🟡 {days}d</span>;
  return <span className="text-muted-foreground text-xs">{days}d</span>;
}

function preScreenIcon(app: OnboardingApplication) {
  const r = app.preScreenResults;
  const checks = [r.companiesHouse, r.fcaRegister, r.financialStanding, r.sanctionsAml, r.websiteCheck];
  const fails = checks.filter(c => c === "Fail").length;
  const refers = checks.filter(c => c === "Refer for Manual Review").length;
  const notStarted = checks.filter(c => c === "Not started").length;
  if (notStarted === 5) return null;
  if (fails > 0) return <Badge className="bg-outcome-fail-bg text-outcome-fail-text text-[10px]">🔴 Pre-screen fail</Badge>;
  if (refers > 0) return <Badge className="bg-outcome-pending-bg text-outcome-pending-text text-[10px]">⚠️ {refers} refer</Badge>;
  return <Badge className="bg-outcome-pass-bg text-outcome-pass-text text-[10px]">✓ All pass</Badge>;
}

function statusBadge(status: OnboardingAppStatus) {
  const cls: Record<OnboardingAppStatus, string> = {
    Draft: "bg-muted text-muted-foreground",
    "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "Pending Approval": "bg-outcome-pending-bg text-outcome-pending-text",
    Approved: "bg-outcome-pass-bg text-outcome-pass-text",
    Rejected: "bg-outcome-fail-bg text-outcome-fail-text",
  };
  return <Badge className={cls[status]}>{status}</Badge>;
}

/* ── application card ─────────────────────────────────────── */
function AppCard({ app, onClick }: { app: OnboardingApplication; onClick: () => void }) {
  const outstanding = app.policyCompletion.total - app.policyCompletion.confirmed;
  const overdue = isOverdue(app);
  const isRejected = app.status === "Rejected";

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${isRejected ? "bg-[hsl(0_80%_98%)] dark:bg-[hsl(0_30%_12%)] border-destructive/20" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-semibold leading-tight">{app.dealerName}</p>
          {isRejected && <Badge className="bg-outcome-fail-bg text-outcome-fail-text text-[10px] shrink-0">❌ Rejected</Badge>}
        </div>

        {/* Ref + lender */}
        <p className="text-[11px] text-muted-foreground">
          {app.appRef} · {app.requestingLenderName.split(" ").slice(0, 2).join(" ")}
        </p>

        {/* Progress bar */}
        {app.stage > 0 && app.status !== "Rejected" && (
          <div className="space-y-1">
            <Progress value={app.policyCompletion.percentComplete} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Stage {app.stage} — {app.policyCompletion.percentComplete}%
            </p>
          </div>
        )}

        {/* Assigned + target */}
        <div className="flex items-center justify-between text-[11px]">
          <span className={app.assignedTo === "Unassigned" ? "text-outcome-pending font-medium" : "text-muted-foreground"}>
            👤 {app.assignedTo}
          </span>
          <span>🗓 {daysUntilTarget(app.targetApprovalDate)}</span>
        </div>

        {/* Warning badges */}
        <div className="flex flex-wrap gap-1">
          {app.manualReviewItems.length > 0 && (
            <span className="text-[10px] text-outcome-pending flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" /> {app.manualReviewItems.length} manual review
            </span>
          )}
          {outstanding > 0 && app.stage >= 2 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <FileText className="w-3 h-3" /> {outstanding} docs outstanding
            </span>
          )}
          {(!app.dndClear || !app.platformDndClear) && (
            <span className="text-[10px] text-outcome-fail font-medium">🔴 DND flagged</span>
          )}
          {preScreenIcon(app) && app.preScreenResults.fcaRegister === "Fail" && (
            <span className="text-[10px] text-outcome-fail font-medium">🔴 Pre-screen fail</span>
          )}
          {overdue && (
            <span className="text-[10px] text-outcome-fail font-medium">⏰ Overdue</span>
          )}
        </div>

        {/* Open button */}
        <div className="flex justify-end pt-1">
          <Button variant="ghost" size="sm" className="h-6 text-[11px] gap-1 text-primary" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            Open <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── main hub ─────────────────────────────────────────────── */
export default function TcgOnboardingHub() {
  const navigate = useNavigate();
  const { startNew } = useTcgOnboarding();
  const { toast } = useToast();
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [lenderFilter, setLenderFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortCol, setSortCol] = useState<string>("appRef");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleNew = () => {
    startNew();
    navigate("/tcg/onboarding/new");
  };

  const filtered = useMemo(() => {
    return seederApplications.filter(app => {
      if (search) {
        const q = search.toLowerCase();
        if (!app.dealerName.toLowerCase().includes(q) && !app.appRef.toLowerCase().includes(q)) return false;
      }
      if (assigneeFilter !== "all" && app.assignedTo !== assigneeFilter) return false;
      if (lenderFilter !== "all" && app.requestingLender !== lenderFilter) return false;
      if (stageFilter !== "all" && String(app.stage) !== stageFilter) return false;
      return true;
    });
  }, [search, assigneeFilter, lenderFilter, stageFilter]);

  // Sorting for list view
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      let va: any, vb: any;
      switch (sortCol) {
        case "appRef": va = a.appRef; vb = b.appRef; break;
        case "dealerName": va = a.dealerName; vb = b.dealerName; break;
        case "status": va = a.status; vb = b.status; break;
        case "stage": va = a.stage; vb = b.stage; break;
        case "assignedTo": va = a.assignedTo; vb = b.assignedTo; break;
        case "lender": va = a.requestingLenderName; vb = b.requestingLenderName; break;
        case "policies": va = a.policyCompletion.percentComplete; vb = b.policyCompletion.percentComplete; break;
        case "lastUpdated": va = a.lastUpdated; vb = b.lastUpdated; break;
        case "target": va = a.targetApprovalDate; vb = b.targetApprovalDate; break;
        default: va = a.appRef; vb = b.appRef;
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filtered, sortCol, sortDir]);

  const toggleSort = useCallback((col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }, [sortCol]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === sorted.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(sorted.map(a => a.id)));
  }, [sorted, selectedIds.size]);

  const handleBulkAssign = (user: string) => {
    toast({ title: "Applications Assigned", description: `${selectedIds.size} application(s) assigned to ${user}.` });
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const apps = sorted.filter(a => selectedIds.has(a.id));
    const headers = ["App Ref", "Dealer Name", "Lender", "Stage", "Status", "Policies %", "Assigned To", "Last Updated", "Target"];
    const rows = apps.map(a => [
      a.appRef, a.dealerName, a.requestingLenderName, `Stage ${a.stage}`,
      a.status, `${a.policyCompletion.percentComplete}%`, a.assignedTo,
      new Date(a.lastUpdated).toLocaleDateString("en-GB"), a.targetApprovalDate,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "onboarding-applications.csv"; link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${apps.length} application(s) exported to CSV.` });
  };

  const columns = useMemo(() => ({
    drafts: filtered.filter(a => a.status === "Draft"),
    stage1: filtered.filter(a => a.status === "In Progress" && a.stage === 1),
    stage2: filtered.filter(a => a.status === "In Progress" && a.stage === 2),
    stage3: filtered.filter(a => a.status === "Pending Approval"),
    closed: filtered.filter(a => a.status === "Rejected" || a.status === "Approved"),
  }), [filtered]);

  // Summary stats
  const active = seederApplications.filter(a => a.status !== "Rejected" && a.status !== "Approved");
  const unassigned = seederApplications.filter(a => a.assignedTo === "Unassigned").length;
  const pendingApproval = seederApplications.filter(a => a.status === "Pending Approval").length;
  const overdueCount = active.filter(a => isOverdue(a)).length;
  const avgDays = active.length > 0
    ? (active.reduce((s, a) => s + (Date.now() - new Date(a.initiatedDate).getTime()) / 86400000, 0) / active.length).toFixed(1)
    : "0";

  const openApp = (app: OnboardingApplication) => {
    navigate("/onboarding", { state: { selectedAppId: app.id } });
  };

  // Unique lenders for filter
  const lenders = useMemo(() => {
    const map = new Map<string, string>();
    seederApplications.forEach(a => map.set(a.requestingLender, a.requestingLenderName));
    return Array.from(map.entries());
  }, []);

  const columnDefs = [
    { key: "drafts", title: "📋 Draft", subtitle: "Not started", apps: columns.drafts, bg: "bg-muted/40 border-muted-foreground/20" },
    { key: "stage1", title: "⚙️ Stage 1", subtitle: "Pre-Screen & Details", apps: columns.stage1, bg: "bg-blue-50/60 dark:bg-blue-950/30 border-blue-300/40 dark:border-blue-700/40" },
    { key: "stage2", title: "📄 Stage 2", subtitle: "Policy Framework", apps: columns.stage2, bg: "bg-[hsl(270_60%_97%)] dark:bg-[hsl(270_30%_12%)] border-[hsl(270_50%_80%)]/40 dark:border-[hsl(270_40%_30%)]/40" },
    { key: "stage3", title: "🔍 Stage 3", subtitle: "Review & Approve", apps: columns.stage3, bg: "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300/40 dark:border-amber-700/40" },
    { key: "closed", title: "✅ Approved / ❌ Rejected", subtitle: "", apps: columns.closed, bg: "bg-muted/30 border-muted-foreground/15" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dealer Onboarding Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {seederApplications.length} applications across all stages · 92-day validity from approval
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNew} className="gap-2">
              <Plus className="w-4 h-4" /> New Application
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant={view === "board" ? "default" : "ghost"}
                size="sm"
                className="gap-1 rounded-r-none"
                onClick={() => setView("board")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                className="gap-1 rounded-l-none"
                onClick={() => setView("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Summary strip */}
        <div className="flex flex-wrap items-center gap-4 text-sm bg-card border rounded-lg px-4 py-3">
          <span><span className="font-semibold">{active.length}</span> Active</span>
          <span className="text-muted-foreground">·</span>
          <span className={unassigned > 0 ? "text-outcome-pending font-medium" : ""}>
            <span className="font-semibold">{unassigned}</span> Unassigned
          </span>
          <span className="text-muted-foreground">·</span>
          <span><span className="font-semibold">{pendingApproval}</span> Pending Approval</span>
          <span className="text-muted-foreground">·</span>
          <span className={overdueCount > 0 ? "text-outcome-fail font-medium" : ""}>
            <span className="font-semibold">{overdueCount}</span> Overdue
          </span>
          <span className="text-muted-foreground">·</span>
          <span>Avg Time: <span className="font-semibold">{avgDays}d</span></span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search dealer or app ref..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[180px]">
              <Users className="w-4 h-4 mr-2 shrink-0" />
              <SelectValue placeholder="Assigned User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="Tom Griffiths">Tom Griffiths</SelectItem>
              <SelectItem value="Amara Osei">Amara Osei</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={lenderFilter} onValueChange={setLenderFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lenders</SelectItem>
              {lenders.map(([id, name]) => (
                <SelectItem key={id} value={id}>{name.split(" ").slice(0, 2).join(" ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="1">Stage 1</SelectItem>
              <SelectItem value="2">Stage 2</SelectItem>
              <SelectItem value="3">Stage 3</SelectItem>
              <SelectItem value="0">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Board view */}
        {view === "board" && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 items-start">
            {columnDefs.map(col => (
              <div key={col.key} className={`rounded-xl border ${col.bg} p-3 space-y-2 min-h-[200px]`}>
                <div className="pb-2 border-b border-border/50">
                  <h3 className="text-sm font-semibold flex items-center justify-between">
                    {col.title}
                    <Badge variant="secondary" className="text-xs ml-1">{col.apps.length}</Badge>
                  </h3>
                  {col.subtitle && <p className="text-[10px] text-muted-foreground">{col.subtitle}</p>}
                </div>
                <div className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto">
                  {col.apps.length === 0 && (
                    <p className="text-xs text-muted-foreground py-6 text-center">No applications</p>
                  )}
                  {col.apps.map(app => (
                    <AppCard key={app.id} app={app} onClick={() => openApp(app)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="space-y-3">
            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
                <span className="text-sm font-medium">{selectedIds.size} selected</span>
                <Select onValueChange={handleBulkAssign}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <UserPlus className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tom Griffiths">Tom Griffiths</SelectItem>
                    <SelectItem value="Amara Osei">Amara Osei</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleBulkExport}>
                  <Download className="w-3 h-3" /> Export Selected
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs ml-auto" onClick={() => setSelectedIds(new Set())}>
                  Clear
                </Button>
              </div>
            )}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={selectedIds.size === sorted.length && sorted.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      {[
                        { key: "appRef", label: "App Ref" },
                        { key: "dealerName", label: "Dealer Name" },
                        { key: "lender", label: "Lender" },
                        { key: "stage", label: "Stage" },
                        { key: "status", label: "Status" },
                        { key: "policies", label: "Policies" },
                        { key: "assignedTo", label: "Assigned" },
                        { key: "lastUpdated", label: "Last Updated" },
                        { key: "target", label: "Target" },
                      ].map(col => (
                        <TableHead
                          key={col.key}
                          className="cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => toggleSort(col.key)}
                        >
                          <span className="flex items-center gap-1">
                            {col.label}
                            {sortCol === col.key ? (
                              sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-30" />
                            )}
                          </span>
                        </TableHead>
                      ))}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map(app => (
                      <TableRow key={app.id} className="cursor-pointer" onClick={() => openApp(app)}>
                        <TableCell onClick={e => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(app.id)}
                            onCheckedChange={() => toggleSelect(app.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{app.appRef}</TableCell>
                        <TableCell className="font-medium">{app.dealerName}</TableCell>
                        <TableCell className="text-xs">{app.requestingLenderName.split(" ").slice(0, 2).join(" ")}</TableCell>
                        <TableCell>
                          {app.stage > 0 ? (
                            <span className="text-xs">Stage {app.stage}</span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>{statusBadge(app.status)}</TableCell>
                        <TableCell>
                          {app.policyCompletion.percentComplete > 0 ? (
                            <div className="flex items-center gap-2">
                              <Progress value={app.policyCompletion.percentComplete} className="h-1.5 w-14" />
                              <span className="text-xs">{app.policyCompletion.percentComplete}%</span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">0%</span>}
                        </TableCell>
                        <TableCell>
                          <span className={app.assignedTo === "Unassigned" ? "text-outcome-pending font-medium text-sm" : "text-sm"}>
                            {app.assignedTo === "Unassigned" ? app.assignedTo : app.assignedTo.split(" ").map(n => n[0] + ".").join(" ").slice(0, -1) + " " + app.assignedTo.split(" ").pop()}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(app.lastUpdated).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        </TableCell>
                        <TableCell>{daysUntilTarget(app.targetApprovalDate)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={e => { e.stopPropagation(); openApp(app); }}>
                            Open
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
