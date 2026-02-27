import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { StageIndicator } from "@/components/tcg-onboarding/StageIndicator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { TcgOnboardingApp, PreScreenResult, PolicyEntry } from "@/hooks/useTcgOnboarding";

interface Stage3Props {
  app: TcgOnboardingApp;
  onUpdate: (partial: Partial<TcgOnboardingApp>) => void;
  onBack: () => void;
  onNavigate: (stage: 1 | 2 | 3) => void;
  onApprove: (validityDays: number) => void;
  onReject: (reason: string) => void;
}

function preScreenPill(result: PreScreenResult) {
  if (!result) return <Badge variant="secondary">Not Set</Badge>;
  if (result === "pass") return <Badge className="bg-outcome-pass-bg text-outcome-pass-text">Pass</Badge>;
  if (result === "fail") return <Badge className="bg-outcome-fail-bg text-outcome-fail-text">Fail</Badge>;
  return <Badge className="bg-outcome-pending-bg text-outcome-pending-text">Refer</Badge>;
}

export function OnboardingStage3({ app, onUpdate, onBack, onNavigate, onApprove, onReject }: Stage3Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [validityDays, setValidityDays] = useState(app.validityDays);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const validUntil = new Date(Date.now() + validityDays * 86400000).toISOString().slice(0, 10);

  const referredChecks = app.preScreenChecks.filter((c) => c.result === "refer");

  // Policy summary by category
  const visiblePolicies = useMemo(() => {
    if (app.distributeInsurance === false) {
      return app.policies.filter((p) => p.category !== "Insurance (if applicable)");
    }
    return app.policies;
  }, [app.policies, app.distributeInsurance]);

  const categorySummary = useMemo(() => {
    const cats: Record<string, { total: number; yes: number; no: number; na: number; uploaded: number; missing: number }> = {};
    for (const p of visiblePolicies) {
      if (!cats[p.category]) cats[p.category] = { total: 0, yes: 0, no: 0, na: 0, uploaded: 0, missing: 0 };
      const c = cats[p.category];
      c.total++;
      if (p.exists === "yes") { c.yes++; if (p.documentUploaded) c.uploaded++; else c.missing++; }
      else if (p.exists === "no") c.no++;
      else if (p.exists === "na") c.na++;
    }
    return cats;
  }, [visiblePolicies]);

  const missingPolicies = visiblePolicies.filter((p) => p.exists === "no");

  const handleApproveConfirm = () => {
    onApprove(validityDays);
    setShowApproveModal(false);
    toast({
      title: "Dealer Approved",
      description: `${app.tradingName || app.companyName} has been approved and added to the dealer pool.`,
    });
    navigate("/tcg/onboarding");
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return;
    onReject(rejectReason);
    setShowRejectModal(false);
    toast({
      title: "Application Rejected",
      description: `${app.tradingName || app.companyName} has been rejected.`,
      variant: "destructive",
    });
    navigate("/tcg/onboarding");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <StageIndicator current={3} onNavigate={onNavigate} />

        <h1 className="text-2xl font-bold text-foreground">
          Review & Approve — {app.tradingName || app.companyName || "New Dealer"}
        </h1>

        {/* Section A — Pre-Screen */}
        <Card>
          <CardHeader><CardTitle>Pre-Screen Summary</CardTitle></CardHeader>
          <CardContent>
            {referredChecks.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-outcome-pending-bg text-outcome-pending-text text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>⚠️ {referredChecks.length} pre-screen check(s) have been referred to the manual review queue. You may still proceed with approval — these will be tracked separately.</span>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Check</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {app.preScreenChecks.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-sm">{c.label}</TableCell>
                    <TableCell>{preScreenPill(c.result)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.notes || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Section B — Policy Summary */}
        <Card>
          <CardHeader><CardTitle>Policy Framework Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Confirmed (Yes)</TableHead>
                  <TableHead className="text-center">Not Held (No)</TableHead>
                  <TableHead className="text-center">N/A</TableHead>
                  <TableHead className="text-center">Docs Uploaded</TableHead>
                  <TableHead className="text-center">Missing Docs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(categorySummary).map(([cat, s]) => (
                  <TableRow key={cat}>
                    <TableCell className="font-medium text-sm">{cat}</TableCell>
                    <TableCell className="text-center">{s.total}</TableCell>
                    <TableCell className="text-center">{s.yes}</TableCell>
                    <TableCell className="text-center">{s.no > 0 ? <span className="text-outcome-pending-text font-medium">{s.no}</span> : "0"}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{s.na}</TableCell>
                    <TableCell className="text-center">{s.uploaded}</TableCell>
                    <TableCell className="text-center">{s.missing > 0 ? <span className="text-outcome-fail-text font-medium">{s.missing}</span> : "0"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {missingPolicies.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-muted-foreground mr-1">Not held:</span>
                {missingPolicies.map((p) => (
                  <Badge key={p.id} className="bg-outcome-pending-bg text-outcome-pending-text">{p.name}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section C — Validity */}
        <Card>
          <CardHeader><CardTitle>Onboarding Validity</CardTitle></CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-5 space-y-2 font-mono text-sm">
              <div className="flex justify-between"><span>Approval date:</span><span>{today}</span></div>
              <div className="flex justify-between"><span>Valid until:</span><span className="font-bold">{validUntil}</span></div>
              <div className="flex justify-between items-center">
                <span>Validity period:</span>
                <Select value={String(validityDays)} onValueChange={(v) => setValidityDays(Number(v))}>
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="92">92 days (standard)</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-muted-foreground text-xs pt-2">This record will be valid for all lenders. Renewal will be required after {validUntil}.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section D — Decision */}
        <div className="flex gap-3 justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Refer Back to Stage 1
          </Button>
          <div className="flex gap-3">
            <Button variant="destructive" onClick={() => setShowRejectModal(true)}>
              Reject Application
            </Button>
            <Button className="bg-outcome-pass hover:bg-outcome-pass/90 text-white gap-2" onClick={() => setShowApproveModal(true)}>
              <CheckCircle2 className="w-4 h-4" /> Approve Onboarding
            </Button>
          </div>
        </div>

        {/* Approve Modal */}
        <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Dealer Onboarding</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p>Approving this onboarding will:</p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-outcome-pass" /> Add {app.tradingName || app.companyName} to the active dealer pool</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-outcome-pass" /> Make this record available to all lenders using DealerGuard</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-outcome-pass" /> Set validity until {validUntil}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-outcome-pass" /> Notify any waiting lenders that this dealer is now onboarded</li>
              </ul>
              <div className="pt-2 text-muted-foreground">
                <p>Approved by: Tom Griffiths (TCG Ops)</p>
                <p>Date: {today}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveModal(false)}>Cancel</Button>
              <Button className="bg-outcome-pass hover:bg-outcome-pass/90 text-white" onClick={handleApproveConfirm}>
                Confirm Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Rejection Reason *</Label>
              <Textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide the reason for rejection..."
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleRejectConfirm} disabled={!rejectReason.trim()}>
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
