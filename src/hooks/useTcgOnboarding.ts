import { useState, useCallback, useRef } from "react";
import { masterPolicyList } from "@/data/tcg/dealerPolicies";
import { PRE_SCREEN_DEFS } from "@/data/tcg/onboardingApplications";
import type {
  OnboardingApplication,
  OnboardingAppStatus,
  PreScreenCheck,
  OnboardingPolicy,
  CompletionStatus,
} from "@/data/tcg/onboardingApplications";

// Re-export types for consuming components
export type { OnboardingApplication, OnboardingAppStatus, PreScreenCheck, OnboardingPolicy, CompletionStatus };

// ── Blank app builder ─────────────────────────────────────────

let appCounter = 100;

function genAppRef(): string {
  appCounter++;
  return `APP-${appCounter}-2026`;
}

function genId(): string {
  return `tcg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildEmptyPreScreenChecks(): Record<string, PreScreenCheck> {
  const checks: Record<string, PreScreenCheck> = {};
  for (const def of PRE_SCREEN_DEFS) {
    checks[def.key] = {
      checkId: def.id,
      label: def.label,
      answered: false,
      finding: "",
      answeredBy: null,
      answeredAt: null,
    };
  }
  return checks;
}

function buildEmptyPolicies(): OnboardingPolicy[] {
  return masterPolicyList.map((p) => ({
    policyId: p.id,
    name: p.name,
    category: p.category,
    dealerHasIt: null,
    notes: "",
    answeredBy: null,
    answeredAt: null,
  }));
}

function computeCompletion(
  checks: Record<string, PreScreenCheck>,
  policies: OnboardingPolicy[],
  app: Partial<OnboardingApplication>
): CompletionStatus {
  const allChecks = Object.values(checks).every((c) => c.answered);
  const allPolicies = policies.every((p) => p.dealerHasIt !== null && p.notes.trim() !== "");
  const detailsComplete = !!(
    (app as any).dealerName && (app as any).companiesHouseNo && (app as any).tradingName &&
    (app as any).primaryContact?.name
  );
  const complete = allChecks && allPolicies && detailsComplete;
  return {
    allPreScreenChecksAnswered: allChecks,
    allPoliciesAnswered: allPolicies,
    dealerDetailsComplete: detailsComplete,
    onboardingComplete: complete,
    completedBy: null,
    completedAt: null,
    readyToTransfer: false,
  };
}

function createBlankApp(): OnboardingApplication {
  const checks = buildEmptyPreScreenChecks();
  const policies = buildEmptyPolicies();
  return {
    id: genId(),
    appRef: genAppRef(),
    stage: 1,
    status: "Draft",
    dealerName: "",
    tradingName: "",
    companiesHouseNo: "",
    website: "",
    primaryContact: { name: "", email: "", phone: "" },
    registeredAddress: { street: "", town: "", county: "", postcode: "" },
    distributeInsurance: null,
    requestingLender: "",
    requestingLenderName: "",
    initiatedBy: "Tom Griffiths",
    initiatedDate: new Date().toISOString().slice(0, 10),
    assignedTo: "Tom Griffiths",
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: "Tom Griffiths",
    targetCompletionDate: new Date(Date.now() + 17 * 86400000).toISOString().slice(0, 10),
    preScreenChecks: checks,
    policies,
    completionStatus: computeCompletion(checks, policies, {}),
    dndClear: true,
    platformDndClear: true,
    notes: "",
    history: [{ date: new Date().toISOString(), action: "Application created", user: "Tom Griffiths" }],
  };
}

// ── Hook ───────────────────────────────────────────────────

export function useTcgOnboarding() {
  const [applications, setApplications] = useState<OnboardingApplication[]>([]);
  const [current, setCurrent] = useState<OnboardingApplication | null>(null);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const startNew = useCallback(() => {
    const app = createBlankApp();
    setApplications((prev) => [app, ...prev]);
    setCurrent(app);
    return app;
  }, []);

  const loadApp = useCallback((id: string) => {
    setApplications((prev) => {
      const found = prev.find((a) => a.id === id);
      if (found) setCurrent({ ...found });
      return prev;
    });
  }, []);

  const updateCurrent = useCallback((partial: Partial<OnboardingApplication>) => {
    setCurrent((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      // Recompute completion status
      const checks = partial.preScreenChecks || next.preScreenChecks;
      const policies = partial.policies || next.policies;
      next.completionStatus = computeCompletion(checks, policies, next);
      // Auto-set status
      if (next.completionStatus.onboardingComplete && next.status === "In Progress") {
        next.status = "Complete";
      }
      if (next.status === "Draft" && (next.dealerName || next.companiesHouseNo)) {
        next.status = "In Progress";
      }
      // Debounced persist
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setApplications((apps) => apps.map((a) => (a.id === next.id ? next : a)));
        setSaving(false);
      }, 800);
      setSaving(true);
      return next;
    });
  }, []);

  const setStage = useCallback((stage: 1 | 2) => {
    updateCurrent({ stage, status: "In Progress" });
  }, [updateCurrent]);

  const markReadyToTransfer = useCallback(() => {
    setCurrent((prev) => {
      if (!prev || !prev.completionStatus.onboardingComplete) return prev;
      const next: OnboardingApplication = {
        ...prev,
        status: "Ready to Transfer",
        completionStatus: {
          ...prev.completionStatus,
          readyToTransfer: true,
          completedBy: "Tom Griffiths",
          completedAt: new Date().toISOString(),
        },
      };
      setApplications((apps) => apps.map((a) => (a.id === next.id ? next : a)));
      return next;
    });
  }, []);

  // Check for duplicate CH number
  const checkDuplicate = useCallback((chNumber: string): string | null => {
    if (!chNumber || chNumber.length < 4) return null;
    // Could check against existing dealers here
    return null;
  }, []);

  return {
    applications,
    current,
    saving,
    startNew,
    loadApp,
    updateCurrent,
    setStage,
    markReadyToTransfer,
    checkDuplicate,
    setCurrent,
  };
}

export { masterPolicyList } from "@/data/tcg/dealerPolicies";
