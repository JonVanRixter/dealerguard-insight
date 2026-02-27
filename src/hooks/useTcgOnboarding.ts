import { useState, useCallback, useRef } from "react";
import { tcgDealers, type TcgDealer } from "@/data/tcg/dealers";
import { masterPolicyList } from "@/data/tcg/dealerPolicies";

// ── Types ──────────────────────────────────────────────────

export type PreScreenResult = "pass" | "fail" | "refer" | null;

export interface PreScreenCheck {
  id: string;
  label: string;
  description: string;
  result: PreScreenResult;
  notes: string;
}

export interface PolicyEntry {
  id: string;
  name: string;
  category: string;
  exists: "yes" | "no" | "na" | null;
  documentUploaded: boolean;
  fileName: string | null;
  lastUpdated: string | null;
  dateUnknown: boolean;
  notes: string;
}

export type AppStatus = "draft" | "in_progress" | "pending_approval" | "approved" | "rejected";

export interface TcgOnboardingApp {
  id: string;
  appRef: string;
  companyName: string;
  companiesHouseNumber: string;
  tradingName: string;
  websiteUrl: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  addressStreet: string;
  addressTown: string;
  addressCounty: string;
  addressPostcode: string;
  distributeInsurance: boolean | null;
  preScreenChecks: PreScreenCheck[];
  policies: PolicyEntry[];
  status: AppStatus;
  currentStage: 1 | 2 | 3;
  startedBy: string;
  startedDate: string;
  validityDays: number;
  approvedDate: string | null;
  approvedBy: string | null;
  rejectionReason: string | null;
  duplicateWarning: string | null;
  dndWarning: string | null;
}

const defaultPreScreenChecks: PreScreenCheck[] = [
  { id: "ch", label: "Companies House Status", description: "Company active, directors listed, PSCs disclosed", result: null, notes: "" },
  { id: "fca", label: "FCA Authorisation", description: "Authorised, permissions correct, not lapsed", result: null, notes: "" },
  { id: "fin", label: "Initial Financial Standing", description: "Credit score (manual entry), CCJs, accounts filed", result: null, notes: "" },
  { id: "aml", label: "Sanctions & AML Initial Screen", description: "Sanctions clear, no PEPs, adverse media check", result: null, notes: "" },
  { id: "web", label: "Website & Initial Trading Check", description: "Active website, APR visible, risk warnings present", result: null, notes: "" },
];

function buildEmptyPolicies(): PolicyEntry[] {
  return masterPolicyList.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    exists: null,
    documentUploaded: false,
    fileName: null,
    lastUpdated: null,
    dateUnknown: false,
    notes: "",
  }));
}

let appCounter = 100;

function genAppRef(): string {
  appCounter++;
  return `APP-${appCounter}-2026`;
}

function genId(): string {
  return `tcg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createBlankApp(): TcgOnboardingApp {
  return {
    id: genId(),
    appRef: genAppRef(),
    companyName: "",
    companiesHouseNumber: "",
    tradingName: "",
    websiteUrl: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    addressStreet: "",
    addressTown: "",
    addressCounty: "",
    addressPostcode: "",
    distributeInsurance: null,
    preScreenChecks: defaultPreScreenChecks.map((c) => ({ ...c })),
    policies: buildEmptyPolicies(),
    status: "draft",
    currentStage: 1,
    startedBy: "Tom Griffiths",
    startedDate: new Date().toISOString().slice(0, 10),
    validityDays: 92,
    approvedDate: null,
    approvedBy: null,
    rejectionReason: null,
    duplicateWarning: null,
    dndWarning: null,
  };
}

// ── Hook ───────────────────────────────────────────────────

export function useTcgOnboarding() {
  const [applications, setApplications] = useState<TcgOnboardingApp[]>([]);
  const [current, setCurrent] = useState<TcgOnboardingApp | null>(null);
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

  const updateCurrent = useCallback((partial: Partial<TcgOnboardingApp>) => {
    setCurrent((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      // debounced persist
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setApplications((apps) => apps.map((a) => (a.id === next.id ? next : a)));
        setSaving(false);
      }, 800);
      setSaving(true);
      return next;
    });
  }, []);

  const setStage = useCallback((stage: 1 | 2 | 3) => {
    updateCurrent({ currentStage: stage, status: "in_progress" });
  }, [updateCurrent]);

  const approve = useCallback((validityDays: number) => {
    const today = new Date().toISOString().slice(0, 10);
    const validUntil = new Date(Date.now() + validityDays * 86400000).toISOString().slice(0, 10);
    setCurrent((prev) => {
      if (!prev) return prev;
      const approved: TcgOnboardingApp = {
        ...prev,
        status: "approved",
        approvedDate: today,
        approvedBy: "Tom Griffiths",
        validityDays,
      };
      setApplications((apps) => apps.map((a) => (a.id === approved.id ? approved : a)));
      return approved;
    });
  }, []);

  const reject = useCallback((reason: string) => {
    setCurrent((prev) => {
      if (!prev) return prev;
      const rejected: TcgOnboardingApp = {
        ...prev,
        status: "rejected",
        rejectionReason: reason,
      };
      setApplications((apps) => apps.map((a) => (a.id === rejected.id ? rejected : a)));
      return rejected;
    });
  }, []);

  // Check for duplicate CH number against existing dealers
  const checkDuplicate = useCallback((chNumber: string): string | null => {
    if (!chNumber || chNumber.length < 4) return null;
    const match = tcgDealers.find((d) => d.companiesHouseNumber === chNumber);
    if (match) {
      return `This dealer (${match.name}) already has an active onboarding record valid until ${match.onboarding.validUntil}. A new record is not required until renewal.`;
    }
    return null;
  }, []);

  // Get approved dealers from tcgDealers (existing) + approved applications
  const getApprovedDealers = useCallback(() => {
    return tcgDealers.map((d) => ({
      id: d.id,
      name: d.name,
      tradingName: d.tradingName,
      lendersUsing: d.onboarding.lendersUsing,
      validFrom: d.onboarding.validFrom,
      validUntil: d.onboarding.validUntil,
      renewalDue: d.onboarding.renewalDue,
      status: d.onboarding.status,
    }));
  }, []);

  return {
    applications,
    current,
    saving,
    startNew,
    loadApp,
    updateCurrent,
    setStage,
    approve,
    reject,
    checkDuplicate,
    getApprovedDealers,
    setCurrent,
  };
}

// Export the master list for the policy framework stage
export { masterPolicyList } from "@/data/tcg/dealerPolicies";
