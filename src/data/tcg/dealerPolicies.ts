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

// Master policy template — all 26 policies
const masterPolicies: Omit<DealerPolicy, "exists" | "documentUploaded" | "fileName" | "lastUpdated" | "notes">[] = [
  { id: "pol01", name: "Compliance Monitoring Policy", category: "Core Compliance" },
  { id: "pol02", name: "Consumer Duty Policy", category: "Core Compliance" },
  { id: "pol03", name: "Treating Customers Fairly (TCF) Policy", category: "Core Compliance" },
  { id: "pol04", name: "Complaints Handling Policy (DISP compliant)", category: "Core Compliance" },
  { id: "pol05", name: "Financial Promotions Policy", category: "Core Compliance" },
  { id: "pol06", name: "Conflicts of Interest Policy", category: "Core Compliance" },
  { id: "pol07", name: "Credit Broking Policy", category: "Finance & Credit" },
  { id: "pol08", name: "Affordability & Creditworthiness Assessment Policy", category: "Finance & Credit" },
  { id: "pol09", name: "Commission Disclosure Policy", category: "Finance & Credit" },
  { id: "pol10", name: "Vulnerable Customer Policy", category: "Customer Protection" },
  { id: "pol11", name: "Financial Crime / Anti-Money Laundering (AML) Policy", category: "Financial Crime" },
  { id: "pol12", name: "Anti-Bribery & Corruption Policy", category: "Financial Crime" },
  { id: "pol13", name: "Data Protection (UK GDPR) Policy", category: "Data & Information" },
  { id: "pol14", name: "Data Breach Response / FCA Notification Policy", category: "Data & Information" },
  { id: "pol15", name: "Information Security Policy", category: "Data & Information" },
  { id: "pol16", name: "Record Retention Policy", category: "Data & Information" },
  { id: "pol17", name: "Training & Competence (T&C) Policy", category: "People & Governance" },
  { id: "pol18", name: "Fit & Proper Assessment Policy", category: "People & Governance" },
  { id: "pol19", name: "Remuneration Policy", category: "People & Governance" },
  { id: "pol20", name: "Whistleblowing Policy", category: "People & Governance" },
  { id: "pol21", name: "Business Continuity Plan (BCP)", category: "Operational" },
  { id: "pol22", name: "Risk Management Policy / Risk Register", category: "Operational" },
  { id: "pol23", name: "Insurance Distribution Policy", category: "Insurance (if applicable)" },
  { id: "pol24", name: "Product Oversight & Governance (POG) Policy", category: "Insurance (if applicable)" },
  { id: "pol25", name: "Demands & Needs Statement Procedure", category: "Insurance (if applicable)" },
  { id: "pol26", name: "Insurance Training & Competency Policy", category: "Insurance (if applicable)" },
];

// Default file names for policies that have documents uploaded
const defaultFileNames: Record<string, string> = {
  pol01: "Compliance_Monitoring_Policy_v2.pdf",
  pol02: "Consumer_Duty_Policy_2025.pdf",
  pol04: "Complaints_Policy_DISP_2025.pdf",
  pol05: "Financial_Promotions_Policy.pdf",
  pol07: "Credit_Broking_Policy.pdf",
  pol08: "Affordability_Policy_2025.pdf",
  pol09: "Commission_Disclosure_2025.pdf",
  pol10: "Vulnerable_Customer_Policy.pdf",
  pol11: "AML_Policy_2025.pdf",
  pol13: "GDPR_Policy_2025.pdf",
  pol17: "TC_Policy_2025.pdf",
  pol20: "Whistleblowing_Policy.pdf",
  pol23: "Insurance_Distribution_Policy.pdf",
  pol25: "Demands_Needs_Procedure.pdf",
};

// Default update dates
const defaultDates: Record<string, string> = {
  pol01: "2025-11-01", pol02: "2025-09-15", pol03: "2025-08-01", pol04: "2025-10-12",
  pol05: "2025-07-20", pol06: "2025-06-01", pol07: "2025-09-01", pol08: "2025-09-01",
  pol09: "2025-10-01", pol10: "2025-08-15", pol11: "2025-11-10", pol12: "2025-06-01",
  pol13: "2025-07-01", pol14: "2025-07-01", pol15: "2025-07-01", pol16: "2025-09-01",
  pol17: "2025-08-20", pol18: "2025-06-15", pol19: "2025-06-15", pol20: "2025-07-01",
  pol21: "2025-09-01", pol22: "2025-09-01", pol23: "2025-10-01", pol24: "2025-10-01",
  pol25: "2025-10-01", pol26: "2025-10-01",
};

// Default notes for specific policies
const defaultNotes: Record<string, string> = {
  pol03: "Confirmed verbally — document requested",
  pol14: "Combined with GDPR policy — separate doc requested",
  pol23: "GAP and warranty products distributed",
};

// Policies that do NOT have docs uploaded by default (even when exists=true)
const noDocByDefault = new Set(["pol03", "pol06", "pol12", "pol14", "pol15", "pol16", "pol18", "pol19", "pol21", "pol22", "pol24", "pol26"]);

function buildFullPolicies(
  overrides: {
    missingPolicies?: string[];      // policy ids where exists=false
    noDocPolicies?: string[];        // additional policy ids where documentUploaded=false
    allDocsRemoved?: boolean;        // all documentUploaded=false
    noInsurance?: boolean;           // exclude insurance policies
  } = {}
): DealerPolicy[] {
  const { missingPolicies = [], noDocPolicies = [], allDocsRemoved = false, noInsurance = false } = overrides;
  const missingSet = new Set(missingPolicies);
  const noDocExtra = new Set(noDocPolicies);

  return masterPolicies
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
  // d001 Blackmore — full compliance, all green
  {
    dealerId: "d001",
    dealerName: "Blackmore Automotive Ltd",
    lastReviewed: "2026-01-15",
    reviewedBy: "Tom Griffiths",
    distributeInsurance: true,
    policies: buildFullPolicies(),
  },
  // d002 Meridian — full compliance
  {
    dealerId: "d002",
    dealerName: "Meridian Motor Group",
    lastReviewed: "2026-01-22",
    reviewedBy: "Sarah Chen",
    distributeInsurance: true,
    policies: buildFullPolicies(),
  },
  // d003 Crown — full compliance
  {
    dealerId: "d003",
    dealerName: "Crown Car Sales",
    lastReviewed: "2026-02-01",
    reviewedBy: "Tom Griffiths",
    distributeInsurance: true,
    policies: buildFullPolicies(),
  },
  // d004 Lakeside — full compliance
  {
    dealerId: "d004",
    dealerName: "Lakeside Motors",
    lastReviewed: "2026-02-05",
    reviewedBy: "Amara Osei",
    distributeInsurance: true,
    policies: buildFullPolicies(),
  },
  // d005 Westfield — 4 missing, 6 extra no-doc
  {
    dealerId: "d005",
    dealerName: "Westfield Vehicle Solutions",
    lastReviewed: "2026-01-10",
    reviewedBy: "Sarah Chen",
    distributeInsurance: true,
    policies: buildFullPolicies({
      missingPolicies: ["pol06", "pol14", "pol21", "pol24"],
      noDocPolicies: ["pol02", "pol07", "pol09", "pol10", "pol17", "pol25"],
    }),
  },
  // d006 Castle Cars — 3 missing, 8 extra no-doc
  {
    dealerId: "d006",
    dealerName: "Castle Cars Ltd",
    lastReviewed: "2025-12-18",
    reviewedBy: "Tom Griffiths",
    distributeInsurance: true,
    policies: buildFullPolicies({
      missingPolicies: ["pol05", "pol12", "pol22"],
      noDocPolicies: ["pol01", "pol02", "pol04", "pol07", "pol08", "pol09", "pol11", "pol13"],
    }),
  },
  // d007 Northgate — 6 missing, no insurance
  {
    dealerId: "d007",
    dealerName: "Northgate Auto Centre",
    lastReviewed: "2026-01-05",
    reviewedBy: "Sarah Chen",
    distributeInsurance: false,
    policies: buildFullPolicies({
      missingPolicies: ["pol03", "pol06", "pol10", "pol14", "pol19", "pol21"],
      noInsurance: true,
    }),
  },
  // d008 Pennine — 2 missing, no insurance
  {
    dealerId: "d008",
    dealerName: "Pennine Motor Co",
    lastReviewed: "2026-01-12",
    reviewedBy: "Tom Griffiths",
    distributeInsurance: false,
    policies: buildFullPolicies({
      missingPolicies: ["pol15", "pol22"],
      noInsurance: true,
    }),
  },
  // d009 Riverside — 5 missing, 7 extra no-doc
  {
    dealerId: "d009",
    dealerName: "Riverside Car Group",
    lastReviewed: "2025-12-20",
    reviewedBy: "Amara Osei",
    distributeInsurance: true,
    policies: buildFullPolicies({
      missingPolicies: ["pol02", "pol06", "pol10", "pol17", "pol22"],
      noDocPolicies: ["pol01", "pol04", "pol05", "pol07", "pol08", "pol09", "pol11"],
    }),
  },
  // d010 Summit — 8 missing, no insurance
  {
    dealerId: "d010",
    dealerName: "Summit Automotive",
    lastReviewed: "2025-11-28",
    reviewedBy: "Sarah Chen",
    distributeInsurance: false,
    policies: buildFullPolicies({
      missingPolicies: ["pol02", "pol03", "pol05", "pol06", "pol10", "pol14", "pol17", "pol22"],
      noInsurance: true,
    }),
  },
  // d011 Horizon — 12 missing, all docs removed
  {
    dealerId: "d011",
    dealerName: "Horizon Motor Sales",
    lastReviewed: "2025-11-15",
    reviewedBy: "Tom Griffiths",
    distributeInsurance: true,
    policies: buildFullPolicies({
      missingPolicies: ["pol02", "pol03", "pol05", "pol06", "pol10", "pol12", "pol14", "pol15", "pol17", "pol19", "pol21", "pol22"],
      allDocsRemoved: true,
    }),
  },
];

// ── Helpers ──────────────────────────────────────────────────────

export function getPolicyRecord(dealerId: string): DealerPolicyRecord | undefined {
  return dealerPolicies.find((r) => r.dealerId === dealerId);
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
