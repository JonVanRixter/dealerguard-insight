import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTcgOnboarding, type TcgOnboardingApp, type AppStatus } from "@/hooks/useTcgOnboarding";
import { getLenderName } from "@/data/tcg/lenders";

function statusPill(status: AppStatus) {
  const map: Record<AppStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    draft: { label: "Draft", variant: "secondary" },
    in_progress: { label: "In Progress", variant: "default" },
    pending_approval: { label: "Pending Approval", variant: "outline" },
    approved: { label: "Approved", variant: "default" },
    rejected: { label: "Rejected", variant: "destructive" },
  };
  const m = map[status];
  const colorClass = status === "draft" ? "bg-muted text-muted-foreground" :
    status === "in_progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
    status === "pending_approval" ? "bg-outcome-pending-bg text-outcome-pending-text" :
    status === "approved" ? "bg-outcome-pass-bg text-outcome-pass-text" :
    "bg-outcome-fail-bg text-outcome-fail-text";
  return <Badge className={colorClass}>{m.label}</Badge>;
}

function stageProgress(app: TcgOnboardingApp) {
  const stage = app.currentStage;
  return <span className="text-sm text-muted-foreground">{stage}/3 stages</span>;
}

function daysRemainingBadge(validUntil: string | null) {
  if (!validUntil) return <span className="text-muted-foreground">—</span>;
  const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / 86400000);
  if (days < 0) return <Badge className="bg-outcome-fail-bg text-outcome-fail-text">EXPIRED</Badge>;
  if (days <= 7) return <Badge className="bg-outcome-fail-bg text-outcome-fail-text">🚨 {days}d — Renewal urgent</Badge>;
  if (days <= 30) return <Badge className="bg-outcome-pending-bg text-outcome-pending-text">⚠️ {days}d — Renewal due</Badge>;
  return <Badge className="bg-outcome-pass-bg text-outcome-pass-text">{days}d</Badge>;
}

export default function TcgOnboardingHub() {
  const navigate = useNavigate();
  const { applications, startNew, getApprovedDealers, loadApp } = useTcgOnboarding();
  const approvedDealers = getApprovedDealers();

  const handleNew = () => {
    startNew();
    navigate("/tcg/onboarding/new");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dealer Onboarding</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Onboarding records are valid for all lenders for 92 days from approval. One record per dealer — no duplication.
            </p>
          </div>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Start New Onboarding
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Applications</TabsTrigger>
            <TabsTrigger value="approved">Approved Dealers</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card>
              <CardContent className="p-0">
                {applications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No active applications. Click "Start New Onboarding" to begin.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>App Ref</TableHead>
                        <TableHead>Dealer Name</TableHead>
                        <TableHead>CH Number</TableHead>
                        <TableHead>Started By</TableHead>
                        <TableHead>Started Date</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.filter((a) => a.status !== "approved").map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-mono text-sm">{app.appRef}</TableCell>
                          <TableCell>{app.companyName || "—"}</TableCell>
                          <TableCell className="font-mono">{app.companiesHouseNumber || "—"}</TableCell>
                          <TableCell>{app.startedBy}</TableCell>
                          <TableCell>{app.startedDate}</TableCell>
                          <TableCell>{stageProgress(app)}</TableCell>
                          <TableCell>{statusPill(app.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                loadApp(app.id);
                                navigate(`/tcg/onboarding/${app.id}/stage-${app.currentStage}`);
                              }}
                            >
                              {app.status === "draft" ? "Continue" : "View"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Lenders Using</TableHead>
                      <TableHead>Valid From</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Days Remaining</TableHead>
                      <TableHead>Renewal Due</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedDealers.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {d.lendersUsing.map((lid) => (
                              <Badge key={lid} variant="secondary" className="text-xs">
                                {getLenderName(lid)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{d.validFrom || "—"}</TableCell>
                        <TableCell>{d.validUntil || "—"}</TableCell>
                        <TableCell>{daysRemainingBadge(d.validUntil)}</TableCell>
                        <TableCell>
                          {d.renewalDue ? (
                            <Badge className="bg-outcome-pending-bg text-outcome-pending-text">⚠️ Yes</Badge>
                          ) : (
                            <span className="text-outcome-pass-text">✅ No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/tcg/dealers/${d.id}`)}>
                              <Eye className="w-3 h-3" /> View
                            </Button>
                            {d.renewalDue && (
                              <Button variant="outline" size="sm" className="gap-1">
                                <RefreshCw className="w-3 h-3" /> Renew
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
