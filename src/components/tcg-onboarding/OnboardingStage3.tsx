import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { StageIndicator } from "@/components/tcg-onboarding/StageIndicator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { OnboardingApplication } from "@/hooks/useTcgOnboarding";

interface Stage3Props {
  app: OnboardingApplication;
  onUpdate: (partial: Partial<OnboardingApplication>) => void;
  onBack: () => void;
  onNavigate: (stage: 1 | 2 | 3) => void;
  onMarkReady: () => void;
}

export function OnboardingStage3({ app, onUpdate, onBack, onNavigate, onMarkReady }: Stage3Props) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const checks = Object.entries(app.preScreenChecks);
  const answeredChecks = checks.filter(([, c]) => c.answered).length;

  const visiblePolicies = useMemo(() => {
    if (app.distributeInsurance === false) {
      return app.policies.filter((p) => p.category !== "Insurance (if applicable)");
    }
    return app.policies;
  }, [app.policies, app.distributeInsurance]);

  const answeredPolicies = visiblePolicies.filter((p) => p.dealerHasIt !== null).length;
  const policiesYes = visiblePolicies.filter((p) => p.dealerHasIt === true).length;
  const policiesNo = visiblePolicies.filter((p) => p.dealerHasIt === false).length;

  const { completionStatus } = app;
  const canMarkReady = completionStatus.onboardingComplete && !completionStatus.readyToTransfer;

  const handleMarkReady = () => {
    onMarkReady();
    toast({
      title: "Ready to Transfer",
      description: `${app.tradingName || app.dealerName} has been marked as ready to transfer to the lender.`,
    });
    navigate("/tcg/onboarding");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <StageIndicator current={3} onNavigate={onNavigate} />

        <h1 className="text-2xl font-bold text-foreground">
          Completion Review — {app.tradingName || app.dealerName || "New Dealer"}
        </h1>

        {/* Completion status */}
        <Card>
          <CardHeader><CardTitle>Completion Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Dealer details complete", done: completionStatus.dealerDetailsComplete },
              { label: `Pre-screen checks answered (${answeredChecks}/${checks.length})`, done: completionStatus.allPreScreenChecksAnswered },
              { label: `Policies answered (${answeredPolicies}/${visiblePolicies.length})`, done: completionStatus.allPoliciesAnswered },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-outcome-pass" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-outcome-pending" />
                )}
                <span className={`text-sm ${item.done ? "text-foreground" : "text-outcome-pending-text font-medium"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pre-Screen Summary */}
        <Card>
          <CardHeader><CardTitle>Pre-Screen Findings</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Check</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Finding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checks.map(([key, c]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium text-sm">{c.label}</TableCell>
                    <TableCell>
                      {c.answered ? (
                        <Badge className="bg-outcome-pass-bg text-outcome-pass-text">✓ Answered</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{c.finding || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Policy Summary */}
        <Card>
          <CardHeader><CardTitle>Policy Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-6 text-sm">
              <span>Yes (held): <span className="font-semibold">{policiesYes}</span></span>
              <span>No (not held): <span className="font-semibold">{policiesNo}</span></span>
              <span>Unanswered: <span className="font-semibold">{visiblePolicies.length - answeredPolicies}</span></span>
            </div>
            {policiesNo > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-muted-foreground mr-1">Not held:</span>
                {visiblePolicies.filter((p) => p.dealerHasIt === false).map((p) => (
                  <Badge key={p.policyId} className="bg-outcome-pending-bg text-outcome-pending-text">{p.name}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Stage 1
          </Button>
          <Button
            className="gap-2"
            disabled={!canMarkReady}
            onClick={handleMarkReady}
          >
            <Send className="w-4 h-4" />
            {completionStatus.readyToTransfer
              ? "Already Marked Ready"
              : completionStatus.onboardingComplete
                ? "Mark as Ready to Transfer"
                : "Complete All Checks First"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
