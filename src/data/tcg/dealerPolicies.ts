export interface DealerPolicy {
  id: string;
  name: string;
  category: string;
  exists: boolean;
  documentUploaded: boolean;
  fileName: string | null;
  lastUpdated: string | null;
  notes: string;
}

export interface DealerPolicyRecord {
  dealerId: string;
  dealerName: string;
  lastReviewed: string;
  reviewedBy: string;
  distributeInsurance: boolean;
  policies: DealerPolicy[];
}

// Master policy template — 22 policies in new categories
export const masterPolicyList: Omit<DealerPolicy, "exists" | "documentUploaded" | "fileName" | "lastUpdated" | "notes">[] = [
  // Governance (4)
  { id: "pol01", name: "Compliance Monitoring Policy", category: "Governance" },
  { id: "pol02", name: "Business Continuity Plan", category: "Governance" },
  { id: "pol03", name: "Data Retention Policy", category: "Governance" },
  { id: "pol04", name: "Whistleblowing Policy", category: "Governance" },
  // Consumer Duty (5)
  { id: "pol05", name: "Consumer Duty Policy", category: "Consumer Duty" },
  { id: "pol06", name: "Treating Customers Fairly (TCF) Policy", category: "Consumer Duty" },
  { id: "pol07", name: "Vulnerable Customers Policy", category: "Consumer Duty" },
  { id: "pol08", name: "Complaints Handling Policy", category: "Consumer Duty" },
  { id: "pol09", name: "Customer Communications Policy", category: "Consumer Duty" },
  // Financial Crime (4)
  { id: "pol10", name: "AML / CTF Policy", category: "Financial Crime" },
  { id: "pol11", name: "Sanctions Policy", category: "Financial Crime" },
  { id: "pol12", name: "Fraud Prevention Policy", category: "Financial Crime" },
  { id: "pol13", name: "GDPR / Data Protection Policy", category: "Financial Crime" },
  // Permissions & Conduct (3)
  { id: "pol14", name: "Conduct Risk Policy", category: "Permissions & Conduct" },
  { id: "pol15", name: "Remuneration & Incentives Policy", category: "Permissions & Conduct" },
  { id: "pol16", name: "Conflicts of Interest Policy", category: "Permissions & Conduct" },
  // Financial Promotions (2)
  { id: "pol17", name: "Financial Promotions Policy", category: "Financial Promotions" },
  { id: "pol18", name: "Social Media Policy", category: "Financial Promotions" },
  // Insurance (4 — conditional)
  { id: "pol19", name: "Insurance Distribution Policy", category: "Insurance (if applicable)" },
  { id: "pol20", name: "Product Governance Policy", category: "Insurance (if applicable)" },
  { id: "pol21", name: "Demands & Needs Statement Procedure", category: "Insurance (if applicable)" },
  { id: "pol22", name: "ICOBS Compliance Policy", category: "Insurance (if applicable)" },
];

// Default file names for policies that have documents uploaded
const defaultFileNames: Record<string, string> = {
  pol01: "Compliance_Monitoring_Policy_v2.pdf",
  pol05: "Consumer_Duty_Policy_2025.pdf",
  pol08: "Complaints_Policy_2025.pdf",
  pol10: "AML_CTF_Policy_2025.pdf",
  pol13: "GDPR_Policy_2025.pdf",
  pol17: "Financial_Promotions_Policy.pdf",
  pol07: "Vulnerable_Customer_Policy.pdf",
  pol19: "Insurance_Distribution_Policy.pdf",
};

// Default update dates
const defaultDates: Record<string, string> = {
  pol01: "2025-11-01", pol02: "2025-09-15", pol03: "2025-08-01", pol04: "2025-10-12",
  pol05: "2025-07-20", pol06: "2025-06-01", pol07: "2025-09-01", pol08: "2025-09-01",
  pol09: "2025-10-01", pol10: "2025-08-15", pol11: "2025-11-10", pol12: "2025-06-01",
  pol13: "2025-07-01", pol14: "2025-07-01", pol15: "2025-07-01", pol16: "2025-09-01",
  pol17: "2025-08-20", pol18: "2025-06-15", pol19: "2025-06-15", pol20: "2025-07-01",
  pol21: "2025-09-01", pol22: "2025-09-01",
};

// Default notes for specific policies
const defaultNotes: Record<string, string> = {
  pol06: "Confirmed verbally — document requested",
  pol03: "Combined with GDPR policy — separate doc requested",
  pol19: "GAP and warranty products distributed",
};

// Policies that do NOT have docs uploaded by default (even when exists=true)
const noDocByDefault = new Set(["pol02", "pol03", "pol04", "pol06", "pol09", "pol11", "pol12", "pol14", "pol15", "pol16", "pol18", "pol20", "pol21", "pol22"]);

function buildFullPolicies(
  overrides: {
    missingPolicies?: string[];
    noDocPolicies?: string[];
    allDocsRemoved?: boolean;
    noInsurance?: boolean;
  } = {}
): DealerPolicy[] {
  const { missingPolicies = [], noDocPolicies = [], allDocsRemoved = false, noInsurance = false } = overrides;
  const missingSet = new Set(missingPolicies);
  const noDocExtra = new Set(noDocPolicies);

  return masterPolicyList
    .filter((p) => !(noInsurance && p.category === "Insurance (if applicable)"))
    .map((p) => {
      const exists = !missingSet.has(p.id);
      const hasDocDefault = !noDocByDefault.has(p.id) && !!defaultFileNames[p.id];
      const documentUploaded = exists && !allDocsRemoved && hasDocDefault && !noDocExtra.has(p.id);

      return {
        ...p,
        exists,
        documentUploaded,
        fileName: documentUploaded ? defaultFileNames[p.id] ?? null : null,
        lastUpdated: exists ? (defaultDates[p.id] ?? null) : null,
        notes: exists ? (defaultNotes[p.id] ?? "") : "Policy not in place",
      };
    });
}

// ── Per-dealer policy records ───────────────────────────────────

export const dealerPolicies: DealerPolicyRecord[] = [
  {
    dealerId: "d001", dealerName: "Blackmore Automotive Ltd",
    lastReviewed: "2026-01-15", reviewedBy: "Tom Griffiths",
    distributeInsurance: true, policies: buildFullPolicies(),
  },
  {
    dealerId: "d002", dealerName: "Meridian Motor Group",
    lastReviewed: "2026-01-22", reviewedBy: "Sarah Chen",
    distributeInsurance: true, policies: buildFullPolicies(),
  },
  {
    dealerId: "d003", dealerName: "Crown Car Sales",
    lastReviewed: "2026-02-01", reviewedBy: "Tom Griffiths",
    distributeInsurance: true, policies: buildFullPolicies(),
  },
  {
    dealerId: "d004", dealerName: "Lakeside Motors",
    lastReviewed: "2026-02-05", reviewedBy: "Amara Osei",
    distributeInsurance: true, policies: buildFullPolicies(),
  },
  {
    dealerId: "d005", dealerName: "Westfield Vehicle Solutions",
    lastReviewed: "2026-01-10", reviewedBy: "Sarah Chen",
    distributeInsurance: true,
    policies: buildFullPolicies({
      missingPolicies: ["pol04", "pol09", "pol14", "pol20"],
      noDocPolicies: ["pol05", "pol07", "pol10"],
    }),
  },
  {
    dealerId: "d006", dealerName: "Castle Cars Ltd",
    lastReviewed: "2025-12-18", reviewedBy: "Tom Griffiths",
    distributeInsurance: true,
    policies: buildFullPolicies({
      missingPolicies: ["pol12", "pol16", "pol18"],
      noDocPolicies: ["pol01", "pol05", "pol08", "pol10", "pol13"],
    }),
  },
  {
    dealerId: "d007", dealerName: "Northgate Auto Centre",
    lastReviewed: "2026-01-05", reviewedBy: "Sarah Chen",
    distributeInsurance: false,
    policies: buildFullPolicies({
      missingPolicies: ["pol06", "pol09", "pol14", "pol15"],
      noInsurance: true,
    }),
  },
  {
    dealerId: "d008", dealerName: "Pennine Motor Co",
    lastReviewed: "2026-01-12", reviewedBy: "Tom Griffiths",
    distributeInsurance: false,
    policies: buildFullPolicies({
      missingPolicies: ["pol03", "pol18"],
      noInsurance: true,
    }),
  },
  {
    dealerId: "d009", dealerName: "Riverside Car Group",
    lastReviewed: "2025-12-20", reviewedBy: "Amara Osei",
    distributeInsurance: true,
    policies: buildFullPolicies({
      missingPolicies: ["pol05", "pol09", "pol14", "pol16", "pol18"],
      noDocPolicies: ["pol01", "pol07", "pol08", "pol10", "pol13"],
    }),
  },
  {
    dealerId: "d010", dealerName: "Summit Automotive",
    lastReviewed: "2025-11-28", reviewedBy: "Sarah Chen",
    distributeInsurance: false,
    policies: buildFullPolicies({
      missingPolicies: ["pol05", "pol06", "pol09", "pol12", "pol14", "pol15", "pol17", "pol18"],
      noInsurance: true,
    }),
  },
  {
    dealerId: "d011", dealerName: "Horizon Motor Sales",
    lastReviewed: "2025-11-15", reviewedBy: "Tom Griffiths",
    distributeInsurance: true,
    policies: buildFullPolicies({
      missingPolicies: ["pol03", "pol05", "pol06", "pol09", "pol12", "pol14", "pol15", "pol16", "pol17", "pol18", "pol20", "pol22"],
      allDocsRemoved: true,
    }),
  },
];

// ── Helpers ──────────────────────────────────────────────────────

export function getPolicyRecord(dealerId: string): DealerPolicyRecord | undefined {
  return dealerPolicies.find((r) => r.dealerId === dealerId);
}

export function getPolicyRecordByName(dealerName: string): DealerPolicyRecord | undefined {
  return dealerPolicies.find((r) => r.dealerName === dealerName);
}

export function getPolicySummary(dealerId: string) {
  const record = getPolicyRecord(dealerId);
  if (!record) return null;

  const total = record.policies.length;
  const existing = record.policies.filter((p) => p.exists).length;
  const uploaded = record.policies.filter((p) => p.documentUploaded).length;
  const missing = total - existing;
  const categories = [...new Set(record.policies.map((p) => p.category))];

  return { total, existing, uploaded, missing, categories, distributeInsurance: record.distributeInsurance };
}
