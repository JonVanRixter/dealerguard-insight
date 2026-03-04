import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, AlertTriangle, ShieldAlert, ArrowRight } from "lucide-react";
import { tcgDealers } from "@/data/tcg/dealers";
import { seederApplications } from "@/data/tcg/onboardingApplications";
import { Button } from "@/components/ui/button";

export function OnboardingValidityWidget() {
  const navigate = useNavigate();

  const counts = useMemo(() => {
    let valid = 0;
    let renewalDue = 0;
    let expired = 0;

    tcgDealers.forEach((d) => {
      if (!d.onboarding.validUntil || d.onboarding.status !== "Approved") return;
      const days = Math.ceil((new Date(d.onboarding.validUntil).getTime() - Date.now()) / 86400000);
      if (days <= 0) expired++;
      else if (days <= 30) renewalDue++;
      else valid++;
    });

    return { valid, renewalDue, expired };
  }, []);

  const pipeline = useMemo(() => {
    const active = seederApplications.filter(a => a.status !== "Rejected" && a.status !== "Approved");
    const pending = seederApplications.filter(a => a.status === "Pending Approval").length;
    const unassigned = seederApplications.filter(a => a.assignedTo === "Unassigned").length;
    const drafts = seederApplications.filter(a => a.status === "Draft").length;
    const s1 = seederApplications.filter(a => a.status === "In Progress" && a.stage === 1).length;
    const s2 = seederApplications.filter(a => a.status === "In Progress" && a.stage === 2).length;
    const s3 = pending;
    const avgDays = active.length > 0
      ? (active.reduce((s, a) => s + (Date.now() - new Date(a.initiatedDate).getTime()) / 86400000, 0) / active.length).toFixed(1)
      : "0";
    return { active: active.length, pending, unassigned, avgDays, drafts, s1, s2, s3 };
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border space-y-0">
      {/* Validity section */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Onboarding Validity</h3>
        <p className="text-xs text-muted-foreground mt-0.5">TCG dealer onboarding status</p>
      </div>
      <div className="divide-y divide-border">
        <button
          onClick={() => navigate("/pre-onboarding?filter=valid")}
          className="flex items-center justify-between w-full px-5 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-outcome-pass" />
            <span className="text-foreground">Valid onboarding</span>
          </div>
          <span className="text-lg font-bold text-outcome-pass">{counts.valid}</span>
        </button>

        <button
          onClick={() => navigate("/pre-onboarding?filter=renewal")}
          className="flex items-center justify-between w-full px-5 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-outcome-pending" />
            <span className="text-foreground">Renewal due (≤30 days)</span>
          </div>
          <span className="text-lg font-bold text-outcome-pending">{counts.renewalDue}</span>
        </button>

        <button
          onClick={() => navigate("/pre-onboarding?filter=expired")}
          className="flex items-center justify-between w-full px-5 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <ShieldAlert className="w-4 h-4 text-outcome-fail" />
            <span className="text-foreground">Expired onboarding</span>
          </div>
          <span className="text-lg font-bold text-outcome-fail">{counts.expired}</span>
        </button>
      </div>

      {/* Pipeline section */}
      <div className="border-t border-border">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🏗️</span>
            <h3 className="text-sm font-semibold text-foreground">Onboarding Pipeline</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 text-primary h-7"
            onClick={() => navigate("/tcg/onboarding")}
          >
            View Pipeline <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="px-5 pb-3 space-y-2">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span>Active: <span className="font-semibold">{pipeline.active}</span></span>
            <span>Pending approval: <span className="font-semibold">{pipeline.pending}</span></span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span className={pipeline.unassigned > 0 ? "text-outcome-pending font-medium" : ""}>
              Unassigned: <span className="font-semibold">{pipeline.unassigned}</span>{pipeline.unassigned > 0 && " ⚠️"}
            </span>
            <span>Avg time: <span className="font-semibold">{pipeline.avgDays} days</span></span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
            <span>📋 Draft: {pipeline.drafts}</span>
            <span>·</span>
            <span>⚙️ Stage 1: {pipeline.s1}</span>
            <span>·</span>
            <span>📄 Stage 2: {pipeline.s2}</span>
            <span>·</span>
            <span>🔍 Stage 3: {pipeline.s3}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
