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
import { useToast } from "@/hooks/use-toast";
import {
  seederApplications, getOnboardingStats,
  type OnboardingApplication, type OnboardingAppStatus,
} from "@/data/tcg/onboardingApplications";
import {
  Plus, Search, Clock, CheckCircle2, AlertTriangle,
  FileText, Users, ArrowRight, BarChart3, Loader2, ChevronDown,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";

function statusBadge(status: OnboardingAppStatus) {
  const map: Record<OnboardingAppStatus, string> = {
    Draft: "bg-muted text-muted-foreground",
    "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Complete: "bg-outcome-pass-bg text-outcome-pass-text",
    Archived: "bg-muted text-muted-foreground/60",
  };
  return <Badge className={map[status]}>{status}</Badge>;
}

function preScreenSummary(app: OnboardingApplication) {
  const answered = app.checks.filter(c => c.answered).length;
  const total = app.checks.length;
  if (answered === 0) return <span className="text-muted-foreground text-xs">Not started</span>;
  if (answered === total) return <Badge className="bg-outcome-pass-bg text-outcome-pass-text text-xs">✓ All answered</Badge>;
  return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">{answered}/{total}</Badge>;
}

function daysUntilTarget(target: string) {
  const days = Math.ceil((new Date(target).getTime() - Date.now()) / 86400000);
  if (days < 0) return <span className="text-outcome-fail text-xs font-medium">⏰ {Math.abs(days)}d overdue</span>;
  if (days <= 3) return <span className="text-outcome-fail text-xs font-medium">🔴 {days}d</span>;
  if (days <= 7) return <span className="text-outcome-pending text-xs font-medium">🟡 {days}d</span>;
  return <span className="text-muted-foreground text-xs">{days}d</span>;
}

function stageBar(app: OnboardingApplication) {
  const answered = app.policies.filter(p => p.dealerHasIt !== null).length;
  const total = app.policies.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <Progress value={pct} className="h-2 flex-1" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">S{app.stage} · {pct}%</span>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
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
    complete: filtered.filter(a => a.status === "Complete"),
  }), [filtered]);

  const openApp = (app: OnboardingApplication) => navigate(`/tcg/onboarding/${app.id}`);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Onboarding Pipeline</h1>
            <p className="text-muted-foreground mt-1">{stats.total} applications across all stages.</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/tcg/onboarding/new")}><Plus className="w-4 h-4" /> New Application</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[
            { label: "Drafts", value: stats.drafts, icon: FileText, color: "text-muted-foreground" },
            { label: "In Progress", value: stats.inProgress, icon: Loader2, color: "text-blue-600" },
            { label: "Complete", value: stats.complete, icon: CheckCircle2, color: "text-outcome-pass" },
            { label: "Avg Policy %", value: `${stats.avgPolicyCompletion}%`, icon: BarChart3, color: "text-primary" },
          ].map(kpi => (
            <Card key={kpi.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                <div><p className="text-2xl font-bold">{kpi.value}</p><p className="text-xs text-muted-foreground">{kpi.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search dealer or ref..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Complete">Complete</SelectItem>
              <SelectItem value="Ready to Transfer">Ready to Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[170px]"><Users className="w-4 h-4 mr-2 shrink-0" /><SelectValue placeholder="All users" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="Tom Griffiths">Tom Griffiths</SelectItem>
              <SelectItem value="Amara Osei">Amara Osei</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-4 mt-4">
            {[
              { label: "📋 Draft", apps: byStage.drafts },
              { label: "⚙️ Stage 1 — Pre-Screen", apps: byStage.stage1 },
              { label: "📄 Stage 2 — Policies", apps: byStage.stage2 },
              { label: "✅ Complete", apps: byStage.complete },
            ].map(group => group.apps.length > 0 && (
              <Collapsible key={group.label} defaultOpen>
                <CollapsibleTrigger className="flex items-center gap-2 mb-2 group w-full text-left">
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
                  <h3 className="text-sm font-semibold">{group.label}</h3>
                  <Badge variant="secondary">{group.apps.length}</Badge>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.apps.map(app => (
                      <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openApp(app)}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{app.dealerName}</p>
                            {statusBadge(app.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">{app.appRef} · {app.requestingLenderName.split(" ").slice(0, 2).join(" ")}</p>
                          {stageBar(app)}
                          <div className="flex items-center justify-between text-xs">
                            <span className={app.assignedTo === "Unassigned" ? "text-outcome-pending font-medium" : "text-muted-foreground"}>👤 {app.assignedTo}</span>
                            {daysUntilTarget(app.targetCompletionDate)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Lender</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pre-Screen</TableHead>
                      <TableHead>Policies</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(app => {
                      const answered = app.policies.filter(p => p.dealerHasIt !== null).length;
                      const total = app.policies.length;
                      const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
                      return (
                        <TableRow key={app.id} className="cursor-pointer" onClick={() => openApp(app)}>
                          <TableCell className="font-mono text-xs">{app.appRef}</TableCell>
                          <TableCell className="font-medium text-sm">{app.dealerName}</TableCell>
                          <TableCell className="text-xs">{app.requestingLenderName.split(" ").slice(0, 2).join(" ")}</TableCell>
                          <TableCell className="text-xs">Stage {app.stage}</TableCell>
                          <TableCell>{statusBadge(app.status)}</TableCell>
                          <TableCell>{preScreenSummary(app)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-1.5 w-14" />
                              <span className="text-xs">{pct}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{app.assignedTo}</TableCell>
                          <TableCell>{daysUntilTarget(app.targetCompletionDate)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={e => { e.stopPropagation(); openApp(app); }}>Open</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
