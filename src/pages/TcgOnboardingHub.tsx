import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Search, LayoutGrid, List, ArrowRight, ArrowUpDown, ArrowUp, ArrowDown, Users, Archive, ChevronDown, Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTcgOnboarding } from "@/hooks/useTcgOnboarding";
import {
  seederApplications,
  type OnboardingApplication, type OnboardingAppStatus,
} from "@/data/tcg/onboardingApplications";

function daysUntilTarget(target: string) {
  const days = Math.ceil((new Date(target).getTime() - Date.now()) / 86400000);
  if (days < 0) return <span className="text-outcome-fail text-xs font-semibold">⏰ {Math.abs(days)}d overdue</span>;
  if (days <= 3) return <span className="text-outcome-fail text-xs font-semibold">🔴 {days}d</span>;
  if (days <= 7) return <span className="text-outcome-pending text-xs font-semibold">🟡 {days}d</span>;
  return <span className="text-muted-foreground text-xs">{days}d</span>;
}

function preScreenIcon(app: OnboardingApplication) {
  const answered = app.checks.filter(c => c.answered).length;
  const total = app.checks.length;
  if (answered === 0) return null;
  if (answered === total) return <Badge className="bg-outcome-pass-bg text-outcome-pass-text text-[10px]">✓ {answered}/{total}</Badge>;
  return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[10px]">{answered}/{total}</Badge>;
}

function statusBadge(status: OnboardingAppStatus) {
  const cls: Record<OnboardingAppStatus, string> = {
    Draft: "bg-muted text-muted-foreground",
    "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Complete: "bg-outcome-pass-bg text-outcome-pass-text",
    Archived: "bg-muted text-muted-foreground/60",
  };
  return <Badge className={cls[status]}>{status}</Badge>;
}

/* ── Standard card ──────────────────────────────────────────── */
function AppCard({ app, onClick }: { app: OnboardingApplication; onClick: () => void }) {
  const answered = app.policies.filter(p => p.dealerHasIt !== null).length;
  const total = app.policies.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-3 space-y-2">
        <p className="text-sm font-semibold leading-tight">{app.dealerName || "Unnamed"}</p>
        <p className="text-[11px] text-muted-foreground">{app.appRef} · {app.requestingLenderName.split(" ").slice(0, 2).join(" ")}</p>
        {app.stage > 0 && (
          <div className="space-y-1">
            <Progress value={pct} className="h-2" />
            <p className="text-[11px] text-muted-foreground">Stage {app.stage} — {pct}% policies</p>
          </div>
        )}
        <div className="flex items-center justify-between text-[11px]">
          <span className={app.assignedTo === "Unassigned" ? "text-outcome-pending font-medium" : "text-muted-foreground"}>👤 {app.assignedTo}</span>
          <span>🗓 {daysUntilTarget(app.targetCompletionDate)}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {preScreenIcon(app)}
          {!app.dndClear && <span className="text-[10px] text-outcome-fail font-medium">🔴 DND flagged</span>}
        </div>
        <div className="flex justify-end pt-1">
          <Button variant="ghost" size="sm" className="h-6 text-[11px] gap-1 text-primary" onClick={e => { e.stopPropagation(); onClick(); }}>
            Open <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Ready to Transfer card (green top border + transfer button) ── */
function ReadyCard({ app, onClick, onTransfer }: { app: OnboardingApplication; onClick: () => void; onTransfer: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border-t-4 border-t-[hsl(var(--outcome-pass))]" onClick={onClick}>
      <CardContent className="p-3 space-y-2">
        <p className="text-sm font-semibold leading-tight">{app.dealerName}</p>
        <p className="text-[11px] text-muted-foreground">{app.appRef} · {app.requestingLenderName.split(" ").slice(0, 2).join(" ")}</p>
        <Badge className="bg-outcome-pass-bg text-outcome-pass-text text-[10px]">✅ All checks complete</Badge>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">👤 {app.assignedTo}</span>
        </div>
        <Button size="sm" className="w-full gap-1 text-xs mt-1" onClick={e => { e.stopPropagation(); onTransfer(); }}>
          <Send className="w-3 h-3" /> Mark as Transferred →
        </Button>
      </CardContent>
    </Card>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function TcgOnboardingHub() {
  const navigate = useNavigate();
  const { startNew } = useTcgOnboarding();
  const { toast } = useToast();
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [lenderFilter, setLenderFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortCol, setSortCol] = useState<string>("appRef");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showArchived, setShowArchived] = useState(false);

  // Transfer modal
  const [transferApp, setTransferApp] = useState<OnboardingApplication | null>(null);
  // Archive modal (from hub — optional, mainly lives in detail)
  const [archiveApp, setArchiveApp] = useState<OnboardingApplication | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  // Local state for transferred/archived apps
  const [transferredIds, setTransferredIds] = useState<Set<string>>(new Set());
  const [archivedApps, setArchivedApps] = useState<Map<string, string>>(new Map()); // id -> reason

  const handleNew = () => { startNew(); navigate("/tcg/onboarding/new"); };

  const allApps = useMemo(() => {
    return seederApplications.map(app => {
      if (transferredIds.has(app.id)) return null; // removed from board
      if (archivedApps.has(app.id)) return { ...app, status: "Archived" as OnboardingAppStatus };
      return app;
    }).filter(Boolean) as OnboardingApplication[];
  }, [transferredIds, archivedApps]);

  const filtered = useMemo(() => {
    return allApps.filter(app => {
      if (!showArchived && app.status === "Archived") return false;
      if (showArchived && app.status !== "Archived") return false;
      if (search) {
        const q = search.toLowerCase();
        if (!app.dealerName.toLowerCase().includes(q) && !app.appRef.toLowerCase().includes(q)) return false;
      }
      if (assigneeFilter !== "all" && app.assignedTo !== assigneeFilter) return false;
      if (lenderFilter !== "all" && app.requestingLender !== lenderFilter) return false;
      return true;
    });
  }, [allApps, search, assigneeFilter, lenderFilter, showArchived]);

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
        case "lastUpdated": va = a.lastUpdated; vb = b.lastUpdated; break;
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
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === sorted.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(sorted.map(a => a.id)));
  }, [sorted, selectedIds.size]);

  // Board columns (4 columns)
  const columns = useMemo(() => {
    const active = filtered.filter(a => a.status !== "Archived");
    const checksAllAnswered = (a: OnboardingApplication) => a.checks.every(c => c.answered);
    return {
      drafts: active.filter(a => a.status === "Draft"),
      preScreen: active.filter(a => a.status === "In Progress" && !checksAllAnswered(a)),
      policies: active.filter(a => a.status === "In Progress" && checksAllAnswered(a)),
      complete: active.filter(a => a.status === "Complete"),
    };
  }, [filtered]);

  const activeApps = allApps.filter(a => a.status !== "Archived" && !transferredIds.has(a.id));
  const activeCount = activeApps.filter(a => a.status !== "Complete").length;
  const completeCount = activeApps.filter(a => a.status === "Complete").length;
  const unassigned = activeApps.filter(a => a.assignedTo === "Unassigned").length;
  const archivedCount = archivedApps.size;

  const openApp = (app: OnboardingApplication) => navigate(`/tcg/onboarding/${app.id}`);

  const handleTransferConfirm = () => {
    if (!transferApp) return;
    setTransferredIds(prev => new Set(prev).add(transferApp.id));
    toast({ title: "✅ Transferred", description: `${transferApp.dealerName} onboarding record is complete and has been added to the dealer directory.` });
    setTransferApp(null);
  };

  const handleArchiveConfirm = () => {
    if (!archiveApp || !archiveReason.trim()) return;
    setArchivedApps(prev => new Map(prev).set(archiveApp.id, archiveReason.trim()));
    toast({ title: "Archived", description: `${archiveApp.dealerName} has been archived.` });
    setArchiveApp(null);
    setArchiveReason("");
  };

  const lenders = useMemo(() => {
    const map = new Map<string, string>();
    seederApplications.forEach(a => map.set(a.requestingLender, a.requestingLenderName));
    return Array.from(map.entries());
  }, []);

  const columnDefs = [
    { key: "drafts", title: "📋 Draft", subtitle: "Not started", apps: columns.drafts, bg: "bg-muted/40 border-muted-foreground/20" },
    { key: "preScreen", title: "⚙️ Pre-Screen", subtitle: "Checks & Details", apps: columns.preScreen, bg: "bg-blue-50/60 dark:bg-blue-950/30 border-blue-300/40 dark:border-blue-700/40" },
    { key: "policies", title: "📄 Policies", subtitle: "Framework", apps: columns.policies, bg: "bg-[hsl(270_60%_97%)] dark:bg-[hsl(270_30%_12%)] border-[hsl(270_50%_80%)]/40 dark:border-[hsl(270_40%_30%)]/40" },
    { key: "complete", title: "✅ Complete", subtitle: "Added to dealer portfolio", apps: columns.complete, bg: "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/40 dark:border-emerald-700/40" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dealer Onboarding Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-1">{activeApps.length} active applications across all stages</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNew} className="gap-2"><Plus className="w-4 h-4" /> New Application</Button>
            <div className="flex border rounded-md">
              <Button variant={view === "board" ? "default" : "ghost"} size="sm" className="gap-1 rounded-r-none" onClick={() => setView("board")}><LayoutGrid className="w-4 h-4" /></Button>
              <Button variant={view === "list" ? "default" : "ghost"} size="sm" className="gap-1 rounded-l-none" onClick={() => setView("list")}><List className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-l-4 border-l-primary"><CardContent className="p-4 space-y-1"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Active</p><p className="text-3xl font-bold text-foreground">{activeCount}</p></CardContent></Card>
          <Card className="border-l-4 border-l-[hsl(var(--outcome-pass))]"><CardContent className="p-4 space-y-1"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Complete</p><p className="text-3xl font-bold text-foreground">{completeCount}</p></CardContent></Card>
          <Card className={`border-l-4 ${unassigned > 0 ? "border-l-[hsl(var(--outcome-pending))]" : "border-l-muted-foreground/30"}`}><CardContent className="p-4 space-y-1"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Unassigned</p><p className="text-3xl font-bold text-foreground">{unassigned} {unassigned > 0 && <span className="text-outcome-pending text-lg">⚠️</span>}</p></CardContent></Card>
          <Card className="border-l-4 border-l-muted-foreground/30"><CardContent className="p-4 space-y-1"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Archived</p><p className="text-3xl font-bold text-foreground">{archivedCount}</p></CardContent></Card>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search dealer or ref..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[180px]"><Users className="w-4 h-4 mr-2 shrink-0" /><SelectValue placeholder="Assigned User" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="Tom Griffiths">Tom Griffiths</SelectItem>
              <SelectItem value="Amara Osei">Amara Osei</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={lenderFilter} onValueChange={setLenderFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Lender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lenders</SelectItem>
              {lenders.map(([id, name]) => (<SelectItem key={id} value={id}>{name.split(" ").slice(0, 2).join(" ")}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button variant={showArchived ? "default" : "outline"} size="sm" className="gap-1" onClick={() => setShowArchived(!showArchived)}>
            <Archive className="w-4 h-4" /> {showArchived ? "Hide Archived" : "Show Archived"} <ChevronDown className="w-3 h-3" />
          </Button>
        </div>

        {/* Archived view */}
        {showArchived && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Archive className="w-4 h-4" /> Archived Applications</h3>
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No archived applications</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Lender</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(app => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-sm">{app.appRef}</TableCell>
                        <TableCell className="font-medium">{app.dealerName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{archivedApps.get(app.id) || app.archiveReason || "—"}</TableCell>
                        <TableCell className="text-sm">{app.requestingLenderName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Board view */}
        {!showArchived && view === "board" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
            {columnDefs.map(col => (
              <div key={col.key} className={`rounded-xl border ${col.bg} p-3 space-y-2 min-h-[200px]`}>
                <div className="pb-2 border-b border-border/50">
                  <h3 className="text-sm font-semibold flex items-center justify-between">{col.title}<Badge variant="secondary" className="text-xs ml-1">{col.apps.length}</Badge></h3>
                  {col.subtitle && <p className="text-[10px] text-muted-foreground">{col.subtitle}</p>}
                </div>
                <div className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto">
                  {col.apps.length === 0 && <p className="text-xs text-muted-foreground py-6 text-center">No applications</p>}
                  {col.apps.map(app => <AppCard key={app.id} app={app} onClick={() => openApp(app)} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {!showArchived && view === "list" && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"><Checkbox checked={selectedIds.size === sorted.length && sorted.length > 0} onCheckedChange={toggleSelectAll} /></TableHead>
                    {[
                      { key: "appRef", label: "Ref" }, { key: "dealerName", label: "Dealer" },
                      { key: "stage", label: "Stage" }, { key: "status", label: "Status" },
                      { key: "assignedTo", label: "Assigned" }, { key: "lastUpdated", label: "Updated" },
                    ].map(col => (
                      <TableHead key={col.key} className="cursor-pointer select-none" onClick={() => toggleSort(col.key)}>
                        <span className="flex items-center gap-1">{col.label}
                          {sortCol === col.key ? (sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                        </span>
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map(app => (
                    <TableRow key={app.id} className="cursor-pointer" onClick={() => openApp(app)}>
                      <TableCell onClick={e => e.stopPropagation()}><Checkbox checked={selectedIds.has(app.id)} onCheckedChange={() => toggleSelect(app.id)} /></TableCell>
                      <TableCell className="font-mono text-sm">{app.appRef}</TableCell>
                      <TableCell className="font-medium">{app.dealerName}</TableCell>
                      <TableCell><span className="text-xs">Stage {app.stage}</span></TableCell>
                      <TableCell>{statusBadge(app.status)}</TableCell>
                      <TableCell className="text-sm">{app.assignedTo}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(app.lastUpdated).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={e => { e.stopPropagation(); openApp(app); }}>Open</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transfer confirmation modal */}
      <Dialog open={!!transferApp} onOpenChange={open => !open && setTransferApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
            <DialogDescription>
              Confirm this dealer's onboarding record is complete and ready for the lender to proceed. This will move the dealer to the active dealer directory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {transferApp && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-sm font-semibold">{transferApp.dealerName}</p>
                <p className="text-xs text-muted-foreground">{transferApp.appRef} · {transferApp.requestingLenderName}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTransferApp(null)}>Cancel</Button>
              <Button onClick={handleTransferConfirm} className="gap-1"><Send className="w-4 h-4" /> Confirm Transfer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive modal */}
      <Dialog open={!!archiveApp} onOpenChange={open => { if (!open) { setArchiveApp(null); setArchiveReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Application</DialogTitle>
            <DialogDescription>
              This application will be removed from the pipeline board. Please provide a reason for archiving.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {archiveApp && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-sm font-semibold">{archiveApp.dealerName}</p>
                <p className="text-xs text-muted-foreground">{archiveApp.appRef}</p>
              </div>
            )}
            <Textarea placeholder="Reason for archiving (required)..." value={archiveReason} onChange={e => setArchiveReason(e.target.value)} className="min-h-[80px]" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setArchiveApp(null); setArchiveReason(""); }}>Cancel</Button>
              <Button variant="destructive" onClick={handleArchiveConfirm} disabled={!archiveReason.trim()} className="gap-1"><Archive className="w-4 h-4" /> Archive</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
