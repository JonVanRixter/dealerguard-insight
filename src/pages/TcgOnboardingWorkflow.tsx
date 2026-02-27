import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTcgOnboarding } from "@/hooks/useTcgOnboarding";
import { OnboardingStage1 } from "@/components/tcg-onboarding/OnboardingStage1";
import { OnboardingStage2 } from "@/components/tcg-onboarding/OnboardingStage2";
import { OnboardingStage3 } from "@/components/tcg-onboarding/OnboardingStage3";

export default function TcgOnboardingWorkflow() {
  const { appId, stage } = useParams();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/new");
  const navigate = useNavigate();
  const {
    current,
    saving,
    startNew,
    loadApp,
    updateCurrent,
    setStage,
    approve,
    reject,
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

  const currentStage = stage ? parseInt(stage.replace("stage-", "")) as 1 | 2 | 3 : 1;

  const handleNavigate = (s: 1 | 2 | 3) => {
    if (!current) return;
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

  if (currentStage === 2) {
    return (
      <OnboardingStage2
        app={current}
        onUpdate={updateCurrent}
        onBack={() => handleNavigate(1)}
        onContinue={() => handleNavigate(3)}
        onNavigate={handleNavigate}
        saving={saving}
      />
    );
  }

  return (
    <OnboardingStage3
      app={current}
      onUpdate={updateCurrent}
      onBack={() => handleNavigate(1)}
      onNavigate={handleNavigate}
      onApprove={approve}
      onReject={reject}
    />
  );
}
