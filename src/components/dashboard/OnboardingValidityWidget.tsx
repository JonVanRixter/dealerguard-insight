import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import { tcgDealers } from "@/data/tcg/dealers";

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

  return (
    <div className="bg-card rounded-xl border border-border">
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
            <ShieldCheck className="w-4 h-4 text-rag-green" />
            <span className="text-foreground">Valid onboarding</span>
          </div>
          <span className="text-lg font-bold text-rag-green">{counts.valid}</span>
        </button>

        <button
          onClick={() => navigate("/pre-onboarding?filter=renewal")}
          className="flex items-center justify-between w-full px-5 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-rag-amber" />
            <span className="text-foreground">Renewal due (≤30 days)</span>
          </div>
          <span className="text-lg font-bold text-rag-amber">{counts.renewalDue}</span>
        </button>

        <button
          onClick={() => navigate("/pre-onboarding?filter=expired")}
          className="flex items-center justify-between w-full px-5 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <ShieldAlert className="w-4 h-4 text-rag-red" />
            <span className="text-foreground">Expired onboarding</span>
          </div>
          <span className="text-lg font-bold text-rag-red">{counts.expired}</span>
        </button>
      </div>
    </div>
  );
}
