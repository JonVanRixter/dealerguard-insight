import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTcgOnboarding } from "@/hooks/useTcgOnboarding";
import { OnboardingStage1 } from "@/components/tcg-onboarding/OnboardingStage1";
import { OnboardingStage2 } from "@/components/tcg-onboarding/OnboardingStage2";
import { useToast } from "@/hooks/use-toast";

export default function TcgOnboardingWorkflow() {
  const { appId, stage } = useParams();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    current,
    saving,
    startNew,
    loadApp,
    updateCurrent,
    setStage,
    checkDuplicate,
  } = useTcgOnboarding();

  useEffect(() => {
    if (!current) {
      if (isNew || appId === "new") {
        startNew();
      } else if (appId) {
        loadApp(appId);
      }
    }
  }, [appId, isNew, current, startNew, loadApp]);

  const currentStage = stage ? parseInt(stage.replace("stage-", "")) as 1 | 2 : 1;

  const handleNavigate = (s: 1 | 2) => {
    if (!current) return;
    // Gate: cannot go to stage 2 unless all pre-screen checks are answered
    if (s === 2 && !current.checks.every(c => c.answered)) return;
    setStage(s);
    navigate(`/tcg/onboarding/${current.id}/stage-${s}`, { replace: true });
  };

  if (!current) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (currentStage === 1) {
    return (
      <OnboardingStage1
        app={current}
        onUpdate={updateCurrent}
        onContinue={() => handleNavigate(2)}
        onNavigate={handleNavigate}
        saving={saving}
        checkDuplicate={checkDuplicate}
      />
    );
  }

  return (
    <OnboardingStage2
      app={current}
      onUpdate={updateCurrent}
      onBack={() => handleNavigate(1)}
      onContinue={() => {}}
      onNavigate={handleNavigate}
      saving={saving}
    />
  );
}
