import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tcgLenders } from "@/data/tcg/lenders";
import { tcgDealers } from "@/data/tcg/dealers";
import {
  ArrowLeft,
  Building2,
  Activity,
  AlertTriangle,
  FileText,
  Shield,
  ChevronRight,
  Lock,
  Eye,
  StickyNote,
  Power,
  Users,
  Clock,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

const LenderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lender = tcgLenders.find((l) => l.id === id);

  const [impersonating, setImpersonating] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [noteText, setNoteText] = useState("");
  const [tcgNotes, setTcgNotes] = useState<{ text: string; by: string; date: string }[]>([]);

  const lenderDealers = useMemo(
    () => (lender ? tcgDealers.filter((d) => d.onboarding.lendersUsing.includes(lender.id)) : []),
    [lender]
  );

  const scoreDistribution = useMemo(() => {
    const bands = [
      { label: "0–24", min: 0, max: 24 },
      { label: "25–49", min: 25, max: 49 },
      { label: "50–74", min: 50, max: 74 },
      { label: "75–100", min: 75, max: 100 },
    ];
    return bands.map((b) => ({
      band: b.label,
      count: lenderDealers.filter((d) => d.score >= b.min && d.score <= b.max).length,
    }));
  }, [lenderDealers]);

  if (!lender) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">Lender not found</p>
          <button onClick={() => navigate("/tcg/lenders")} className="text-primary underline mt-2 text-sm">
            Back to Lender Directory
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const statusColor = (s: string) => {
    if (s === "Active") return "hsl(var(--outcome-pass))";
    if (s === "Pending Activation") return "hsl(var(--outcome-pending))";
    return "hsl(var(--muted-foreground))";
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const formatDateTime = (iso: string | null) => {
    if (!iso) return "Never";
    const d = new Date(iso);
    return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const alertIndicator = (count: number) => {
    if (count === 0) return <span className="text-muted-foreground">0</span>;
    if (count <= 3) return <span className="text-[hsl(var(--outcome-pending))] font-semibold">🟡 {count}</span>;
    return <span className="text-[hsl(var(--outcome-fail))] font-semibold">🔴 {count}</span>;
  };



  const handleAddNote = () => {
    if (!noteText.trim()) return;
    setTcgNotes((prev) => [
      { text: noteText.trim(), by: "TCG Operator", date: new Date().toISOString() },
      ...prev,
    ]);
    setNoteText("");
    setNoteModalOpen(false);
    toast.success("TCG note added");
  };

  const handleDeactivate = () => {
    if (!deactivateReason.trim()) return;
    toast.success(`Lender deactivated: ${lender.tradingName}`);
    setDeactivateReason("");
    setDeactivateModalOpen(false);
  };

  const getOnboardingValidity = (d: typeof tcgDealers[0]) => {
    if (!d.onboarding.validUntil) return { label: "Pending", variant: "secondary" as const };
    const daysLeft = Math.ceil((new Date(d.onboarding.validUntil).getTime() - Date.now()) / 86400000);
    if (daysLeft < 0) return { label: "Expired", variant: "destructive" as const };
    if (daysLeft <= 30) return { label: "Renewal Due", variant: "outline" as const };
    return { label: "Valid", variant: "default" as const };
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-foreground" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-foreground" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Impersonation banner */}
        {impersonating && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4" /> 👁️ Viewing as {lender.tradingName} — Read Only
            </span>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setImpersonating(false)}>
              Exit Impersonation
            </Button>
          </div>
        )}

        {/* Header */}
        <div>
          <button
            onClick={() => navigate("/tcg/lenders")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Lender Directory
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{lender.name}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 font-mono text-xs">
                  <Shield className="w-3.5 h-3.5" /> FCA FRN: {lender.fcaFirmRef}
                </span>
                <span className="font-mono text-xs">Companies House: {lender.companiesHouseNo}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />
                {lender.billingAddress}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                On platform since: {formatDate(lender.contractStart)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  color: statusColor(lender.status),
                  backgroundColor: `color-mix(in srgb, ${statusColor(lender.status)} 12%, transparent)`,
                }}
              >
                ● {lender.status}
              </span>
              <div className="flex gap-2 flex-wrap justify-end">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setImpersonating(true)}>
                  <Eye className="w-3.5 h-3.5" /> View As Lender
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setNoteModalOpen(true)}>
                  <StickyNote className="w-3.5 h-3.5" /> Add TCG Note
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => setDeactivateModalOpen(true)}
                >
                  <Power className="w-3.5 h-3.5" /> Deactivate Lender
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <Building2 className="w-3.5 h-3.5" /> Dealers
            </div>
            <span className="text-2xl font-bold text-foreground">{lender.dealerCount}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <Activity className="w-3.5 h-3.5" /> Avg Score
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-foreground">
                {lender.avgPortfolioScore !== null ? lender.avgPortfolioScore : "—"}
              </span>
              {lender.avgPortfolioScore !== null && <span className="text-sm text-muted-foreground mb-0.5">/ 100</span>}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Pending Alerts
            </div>
            <span className="text-2xl font-bold">{alertIndicator(lender.pendingAlerts)}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <FileText className="w-3.5 h-3.5" /> Open Actions
            </div>
            <span className="text-2xl font-bold text-foreground">{lender.openActions}</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full justify-start bg-muted/50 h-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dealers">Dealers</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          {/* Tab 1 — Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact & Account */}
              <div className="bg-card rounded-xl border border-border">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Contact & Account Details</h3>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  {[
                    { icon: Mail, label: "Primary Contact", value: lender.contactName },
                    { icon: Mail, label: "Contact Email", value: lender.contactEmail },
                    { icon: Phone, label: "Contact Phone", value: lender.contactPhone },
                    { icon: MapPin, label: "Billing Address", value: lender.billingAddress },
                    { icon: Shield, label: "FCA FRN", value: lender.fcaFirmRef },
                    { icon: Shield, label: "Companies House No.", value: lender.companiesHouseNo },
                    { icon: Clock, label: "Contract Start", value: formatDate(lender.contractStart) },
                    { icon: Activity, label: "Account Status", value: lender.status },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3">
                      <row.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">{row.label}</p>
                        <p className="text-foreground">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Health */}
              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Portfolio Health Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dealers on platform</span>
                      <span className="font-semibold text-foreground">{lenderDealers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score range</span>
                      <span className="font-semibold text-foreground">
                        {lender.scoreRange ? `${lender.scoreRange.min} – ${lender.scoreRange.max}` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average score</span>
                      <span className="font-semibold text-foreground">
                        {lender.avgPortfolioScore !== null ? `${lender.avgPortfolioScore} / 100` : "—"}
                      </span>
                    </div>
                  </div>
                  {lenderDealers.length > 0 && (
                    <div className="mt-4 h-40">
                      <p className="text-xs text-muted-foreground mb-2">Score distribution</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreDistribution} barSize={36}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="band" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <RechartsTooltip
                            content={({ active, payload, label }: any) =>
                              active && payload?.length ? (
                                <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
                                  {label}: {payload[0].value} dealer{payload[0].value !== 1 ? "s" : ""}
                                </div>
                              ) : null
                            }
                          />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* TCG Internal Notes */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">TCG Internal Notes</h3>
                  {tcgNotes.length > 0 ? (
                    <div className="space-y-3">
                      {tcgNotes.map((n, i) => (
                        <div key={i} className="border border-border rounded-lg p-3">
                          <p className="text-sm text-foreground">{n.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {n.by} · {formatDateTime(n.date)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No TCG notes recorded for this lender.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2 — Dealers */}
          <TabsContent value="dealers">
            <div className="bg-card rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Dealer Portfolio ({lenderDealers.length})
                </h3>
              </div>
              {lenderDealers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dealer Name</TableHead>
                        <TableHead>Trading Name</TableHead>
                        <TableHead className="text-center">Overall Score</TableHead>
                        <TableHead className="text-center">Score Change</TableHead>
                        <TableHead>Last Audit</TableHead>
                        <TableHead className="text-center">Onboarding Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lenderDealers.map((d) => {
                        const validity = getOnboardingValidity(d);
                        return (
                          <TableRow
                            key={d.id}
                            className="cursor-pointer"
                            onClick={() => navigate(`/tcg/dealers/${d.id}`)}
                          >
                            <TableCell className="font-medium text-foreground">{d.name}</TableCell>
                            <TableCell className="text-muted-foreground">{d.tradingName}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center gap-2 justify-center">
                                <span className="font-semibold text-foreground">{d.score}</span>
                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary/50 rounded-full" style={{ width: `${d.score}%` }} />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <TrendIcon trend={d.trend} />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{d.lastAudit}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={validity.variant}>{validity.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="px-5 py-8 text-center text-muted-foreground text-sm">
                  No dealers onboarded yet.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 3 — Alerts */}
          <TabsContent value="alerts">
            <div className="bg-card rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Alerts
                </h3>
              </div>
              {lenderDealers.some((d) => d.alertCount > 0) ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alert Type</TableHead>
                        <TableHead>Dealer</TableHead>
                        <TableHead className="text-center">Severity</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lenderDealers
                        .filter((d) => d.alertCount > 0)
                        .map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium text-foreground">Score Alert</TableCell>
                            <TableCell className="text-foreground">{d.name}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={d.alertCount >= 4 ? "destructive" : "outline"}>
                                {d.alertCount >= 4 ? "High" : "Medium"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {d.alertCount} alert{d.alertCount > 1 ? "s" : ""} pending review
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{d.lastAudit}</TableCell>
                            <TableCell className="text-center">
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="secondary" className="gap-1">
                                    <Lock className="w-3 h-3" /> Pending
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>Acknowledgement is managed by the lender.</TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="px-5 py-8 text-center text-muted-foreground text-sm">
                  No alerts for this lender's dealers.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 4 — Documents */}
          <TabsContent value="documents">
            <div className="bg-card rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Documents
                </h3>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" /> Read-only
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Document management is handled by the lender.</TooltipContent>
                </Tooltip>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lenderDealers.length > 0 ? (
                      lenderDealers.slice(0, 5).map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium text-foreground">
                            {d.tradingName} — Compliance Pack
                          </TableCell>
                          <TableCell className="text-muted-foreground">{d.name}</TableCell>
                          <TableCell className="text-muted-foreground">Compliance</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{d.lastAudit}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {d.onboarding.validUntil ? formatDate(d.onboarding.validUntil) : "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default">Active</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No documents available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Tab 5 — Team */}
          <TabsContent value="team">
            <div className="bg-card rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" /> Team Members
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                  <Lock className="w-3 h-3" /> Read Only 🔒
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Role</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lender.teamMembers.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium text-foreground">
                          {m.name}
                          {m.isSuperAdmin && (
                            <Badge variant="outline" className="ml-2 text-[10px] border-primary text-primary">
                              Super Admin
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{m.email}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{m.role}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={m.status === "Active" ? "default" : "outline"}>{m.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {m.lastLogin ? formatDateTime(m.lastLogin) : "Never"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-5 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Team management is controlled by the lender's Super Admin. TCG cannot add, edit, or remove users on behalf of lenders.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Tab 6 — Activity Log */}
          <TabsContent value="activity">
            <div className="bg-card rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Activity Log
                </h3>
              </div>
              <div className="divide-y divide-border">
                {lender.recentActivity.map((a, i) => {
                  const d = new Date(a.date);
                  return (
                    <div key={i} className="px-5 py-3.5 flex gap-3">
                      <div className="mt-0.5">
                        <span className="block w-2 h-2 rounded-full bg-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground leading-snug">{a.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {a.user} · {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}{" "}
                          {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add TCG Note Modal */}
      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add TCG Note</DialogTitle>
            <DialogDescription>
              Internal note for {lender.tradingName}. This will not be visible to the lender.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNote} disabled={!noteText.trim()}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Modal */}
      <Dialog open={deactivateModalOpen} onOpenChange={setDeactivateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Lender</DialogTitle>
            <DialogDescription>
              This will deactivate {lender.tradingName}. This action can be reversed. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Reason for deactivation (required)"
            value={deactivateReason}
            onChange={(e) => setDeactivateReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={!deactivateReason.trim()}>
              Confirm Deactivation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default LenderProfile;
