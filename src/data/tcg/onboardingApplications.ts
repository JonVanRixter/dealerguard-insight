import { masterPolicyList } from "./dealerPolicies";

// ── Types ────────────────────────────────────────────────────

export type OnboardingAppStatus = "Draft" | "In Progress" | "Complete" | "Archived";
export type RiskRating = "High" | "Medium";

export interface PreScreenCheck {
  checkId: string;
  sectionId: string;
  sectionName: string;
  label: string;
  objective: string;
  riskRating: RiskRating;
  frequency: string;
  answered: boolean;
  finding: string;
  answeredBy: string | null;
  answeredAt: string | null;
}

export interface OnboardingPolicy {
  policyId: string;
  name: string;
  category: string;
  dealerHasIt: boolean | "na" | null;
  notes: string;
  answeredBy: string | null;
  answeredAt: string | null;
}

export interface SectionProgress {
  answered: number;
  total: number;
}

export interface CompletionStatus {
  checksAnswered: number;
  checksTotal: number;
  sectionProgress: Record<string, SectionProgress>;
  allPreScreenChecksAnswered: boolean;
  allPoliciesAnswered: boolean;
  dealerDetailsComplete: boolean;
  onboardingComplete: boolean;
  completedBy: string | null;
  completedAt: string | null;
}

export interface HistoryEntry {
  date: string;
  action: string;
  user: string;
}

export interface OnboardingApplication {
  id: string;
  appRef: string;
  stage: number;
  status: OnboardingAppStatus;
  dealerName: string;
  tradingName: string;
  companiesHouseNo: string;
  website: string;
  primaryContact: { name: string; email: string; phone: string };
  registeredAddress: { street: string; town: string; county: string; postcode: string };
  distributeInsurance: boolean | null;
  requestingLender: string;
  requestingLenderName: string;
  initiatedBy: string;
  initiatedDate: string;
  assignedTo: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  targetCompletionDate: string;
  checks: PreScreenCheck[];
  policies: OnboardingPolicy[];
  completionStatus: CompletionStatus;
  dndClear: boolean;
  platformDndClear: boolean;
  notes: string;
  history: HistoryEntry[];
  archiveReason?: string;
}

// ── Check Definitions (29 checks across 8 sections) ─────────

export const CHECK_DEFS: Omit<PreScreenCheck, "answered" | "finding" | "answeredBy" | "answeredAt">[] = [
  // Section 1: Corporate Governance
  { checkId: "s1_c1", sectionId: "s1", sectionName: "Corporate Governance", label: "Verify legal entity status (active/dissolved)", objective: "Confirm the entity is up to date, valid and operational", riskRating: "Medium", frequency: "Quarterly + Alert" },
  { checkId: "s1_c2", sectionId: "s1", sectionName: "Corporate Governance", label: "Verify entity/trading names alignment (FCA, ICO, website)", objective: "Confirm consistency of trading identity across FCA register, ICO registration and website", riskRating: "Medium", frequency: "Quarterly + Alert" },
  { checkId: "s1_c3", sectionId: "s1", sectionName: "Corporate Governance", label: "Directors / PSCs list + 24-month change history", objective: "Confirm governance structure stability. List all current directors and PSCs. Note any changes in the last 24 months.", riskRating: "Medium", frequency: "Quarterly + Alert" },
  { checkId: "s1_c4", sectionId: "s1", sectionName: "Corporate Governance", label: "Adverse media / sanctions / PEP screening (directors & controllers)", objective: "Identify potential compliance risks. Confirm no sanctions hits, no adverse media. Note PEP status of all directors and controllers.", riskRating: "High", frequency: "Continuous / Quarterly Review" },
  { checkId: "s1_c5", sectionId: "s1", sectionName: "Corporate Governance", label: "Declaration of criminal/regulatory sanctions", objective: "Confirm no undisclosed criminal or regulatory sanctions against the entity, directors or PSCs. Note self-declaration obtained.", riskRating: "Medium", frequency: "Onboarding + Annual" },

  // Section 2: Permissions Oversight
  { checkId: "s2_c1", sectionId: "s2", sectionName: "Permissions Oversight", label: "FCA authorisation & permissions (including AR status)", objective: "Confirm FCA authorisation status. Note FCA reference number, whether directly authorised or appointed representative, AR principal if applicable, and all relevant permissions.", riskRating: "High", frequency: "Quarterly + Alert" },
  { checkId: "s2_c2", sectionId: "s2", sectionName: "Permissions Oversight", label: "Competence — role-based training & competence matrix (SAF + lender-specific)", objective: "Confirm that all relevant staff have completed required training. Note SAF completion, lender-specific competence requirements, and any outstanding training.", riskRating: "High", frequency: "Annual" },
  { checkId: "s2_c3", sectionId: "s2", sectionName: "Permissions Oversight", label: "SMF allocation for oversight touchpoints (who, when, scope)", objective: "Confirm that a Senior Manager Function (SMF) holder has been allocated with responsibility for compliance oversight. Note who, their scope, and when last reviewed.", riskRating: "Medium", frequency: "Annual + Alert" },
  { checkId: "s2_c4", sectionId: "s2", sectionName: "Permissions Oversight", label: "Cross-reference Companies House / website / director names / trading names", objective: "Confirm that director names, trading names and registered details are consistent across Companies House, the FCA register and the dealer's website.", riskRating: "Medium", frequency: "Annual" },

  // Section 3: Sales Process
  { checkId: "s3_c1", sectionId: "s3", sectionName: "Sales Process", label: "Pre-contract disclosure provided before agreement", objective: "Confirm that the dealer provides all required pre-contract disclosures to customers before any finance agreement is signed. Note the process and any evidence.", riskRating: "High", frequency: "Per Application" },
  { checkId: "s3_c2", sectionId: "s3", sectionName: "Sales Process", label: "Affordability / eligibility checks (per lender policy)", objective: "Confirm that the dealer carries out affordability and eligibility checks in line with the lender's policy before submitting applications. Note the process used.", riskRating: "High", frequency: "Per Application" },

  // Section 4: Consumer Duty
  { checkId: "s4_c1", sectionId: "s4", sectionName: "Consumer Duty", label: "Fair value benchmarking (APR vs aggregated benchmark)", objective: "Confirm that the dealer actively benchmarks the APR offered to customers against an aggregated market benchmark. Note how this is done and how often it is reviewed.", riskRating: "High", frequency: "Quarterly" },
  { checkId: "s4_c2", sectionId: "s4", sectionName: "Consumer Duty", label: "Products and services — consumer outcomes", objective: "Confirm that the dealer's product and service offering is designed to meet the needs of their target customer base and delivers good outcomes. Note any concerns.", riskRating: "High", frequency: "Quarterly" },
  { checkId: "s4_c3", sectionId: "s4", sectionName: "Consumer Duty", label: "Consumer understanding", objective: "Confirm that customers are given sufficient, clear information to make informed decisions. Note how the dealer ensures customer understanding at point of sale.", riskRating: "High", frequency: "Quarterly" },
  { checkId: "s4_c4", sectionId: "s4", sectionName: "Consumer Duty", label: "Consumer support", objective: "Confirm that the dealer provides adequate post-sale support to customers, including accessible contact routes and timely responses to queries or issues.", riskRating: "High", frequency: "Monthly" },
  { checkId: "s4_c5", sectionId: "s4", sectionName: "Consumer Duty", label: "Vulnerability identification & treatment", objective: "Confirm that the dealer has processes to identify and appropriately support vulnerable customers at application and throughout the customer journey.", riskRating: "High", frequency: "Per Application & Quarterly" },

  // Section 5: Financial Crime & Fraud
  { checkId: "s5_c1", sectionId: "s5", sectionName: "Financial Crime & Fraud", label: "KYC / AML — KYC/IDV completed", objective: "Confirm that Know Your Customer and Identity Verification checks are completed for all relevant individuals. Note the process and any third-party tools used.", riskRating: "Medium", frequency: "Per Application" },
  { checkId: "s5_c2", sectionId: "s5", sectionName: "Financial Crime & Fraud", label: "Sanctions / PEP screening at application", objective: "Confirm that sanctions and PEP screening is conducted at application stage for all relevant parties. Note when last run and the outcome.", riskRating: "Medium", frequency: "Per Application" },
  { checkId: "s5_c3", sectionId: "s5", sectionName: "Financial Crime & Fraud", label: "Device / IP geolocation anomaly monitoring", objective: "Confirm that the dealer or their lending platform monitors for device and IP geolocation anomalies at application. Note how this is monitored.", riskRating: "Medium", frequency: "Per Application" },
  { checkId: "s5_c4", sectionId: "s5", sectionName: "Financial Crime & Fraud", label: "Velocity / patterning (multiple applications per customer/device/email)", objective: "Confirm that monitoring is in place for application velocity patterns that may indicate fraud — multiple applications from same customer, device or email address.", riskRating: "Medium", frequency: "AML / KYC monitoring" },
  { checkId: "s5_c5", sectionId: "s5", sectionName: "Financial Crime & Fraud", label: "Bank detail / payout mismatch", objective: "Confirm that controls are in place to detect mismatches between bank details submitted on application and payout destination. Note the process.", riskRating: "Medium", frequency: "AML / KYC monitoring" },
  { checkId: "s5_c6", sectionId: "s5", sectionName: "Financial Crime & Fraud", label: "Application data integrity (OCR vs keyed; cloning fingerprint)", objective: "Confirm that application data integrity checks are in place — including OCR vs manually keyed data comparison and detection of cloned or fraudulent application fingerprints.", riskRating: "Medium", frequency: "Fraud Indicators monitoring" },

  // Section 6: Financial Promotions
  { checkId: "s6_c1", sectionId: "s6", sectionName: "Financial Promotions", label: "Website compliance — clear, fair and not misleading (incl. APR display, privacy policy & cookie management)", objective: "Review the dealer's website for FCA-compliant financial promotions. Confirm APR is clearly displayed, risk warnings are present, no misleading claims are made, privacy policy is current, and cookie consent is correctly implemented.", riskRating: "Medium", frequency: "Risk Based" },
  { checkId: "s6_c2", sectionId: "s6", sectionName: "Financial Promotions", label: "Social media monitoring for financial promotion posts", objective: "Review the dealer's social media presence for any posts that constitute financial promotions. Confirm these are compliant — clear, fair and not misleading, with appropriate disclosures.", riskRating: "Medium", frequency: "Risk Based" },

  // Section 7: Communications & Complaints
  { checkId: "s7_c1", sectionId: "s7", sectionName: "Communications & Complaints", label: "Use of alternative channels — monitored & retained", objective: "Confirm that the dealer monitors and retains records of customer communications across all channels, including email, phone, SMS and any messaging tools used in the sales process.", riskRating: "Medium", frequency: "Monthly" },
  { checkId: "s7_c2", sectionId: "s7", sectionName: "Communications & Complaints", label: "Complaints volume benchmarking vs customer sentiment score", objective: "Confirm that the dealer tracks complaint volumes and benchmarks these against customer sentiment indicators. Note how complaints are recorded and what the current volume/trend is.", riskRating: "High", frequency: "Monthly" },
  { checkId: "s7_c3", sectionId: "s7", sectionName: "Communications & Complaints", label: "Root cause analysis & remediation tracking", objective: "Confirm that the dealer conducts root cause analysis on complaints and tracks remediation actions to completion. Note the process and any recent examples.", riskRating: "High", frequency: "Monthly" },
  { checkId: "s7_c4", sectionId: "s7", sectionName: "Communications & Complaints", label: "Complaints questionnaire completed", objective: "Confirm that the dealer has completed the TCG complaints questionnaire. Note date completed and any material findings from the questionnaire.", riskRating: "High", frequency: "Risk Based" },

  // Section 8: Conduct Oversight
  { checkId: "s8_c1", sectionId: "s8", sectionName: "Conduct Oversight", label: "Arrears / forbearance referral patterning (dealer-level trends)", objective: "Confirm that the dealer is aware of and engaged with arrears and forbearance referral processes. Note any observed trends in dealer-level arrears referral patterns and how these are managed.", riskRating: "Medium", frequency: "Trigger-based" },
];

export const TOTAL_CHECKS = CHECK_DEFS.length; // 29

// ── Builders ─────────────────────────────────────────────────

type FindingEntry = { finding: string; by: string; at: string };

const DEFAULT_FINDINGS: Record<string, string> = {
  s1_c1: "Company confirmed active on Companies House. No dissolution notices.",
  s1_c2: "Trading name consistent across FCA register, ICO and website.",
  s1_c3: "Directors and PSCs identified. No changes in last 24 months.",
  s1_c4: "No sanctions hits. No adverse media. PEP check clear for all directors.",
  s1_c5: "Self-declaration obtained. No undisclosed sanctions.",
  s2_c1: "FCA authorisation confirmed. Permissions include credit broking.",
  s2_c2: "SAF training completed. Lender-specific competence confirmed.",
  s2_c3: "SMF holder allocated for compliance oversight. Scope and review date confirmed.",
  s2_c4: "Director names and trading names consistent across CH, FCA and website.",
  s3_c1: "Pre-contract disclosures provided before agreement. Process confirmed.",
  s3_c2: "Affordability checks conducted per lender policy. Process confirmed.",
  s4_c1: "APR benchmarked against aggregated market data quarterly.",
  s4_c2: "Product offering meets target customer base needs. No concerns.",
  s4_c3: "Customers given clear information at point of sale. Process confirmed.",
  s4_c4: "Post-sale support accessible. Contact routes confirmed.",
  s4_c5: "Vulnerability identification process in place at application and ongoing.",
  s5_c1: "KYC/IDV completed for all relevant individuals.",
  s5_c2: "Sanctions and PEP screening conducted at application stage.",
  s5_c3: "Device and IP monitoring in place via lending platform.",
  s5_c4: "Application velocity monitoring active. No anomalies noted.",
  s5_c5: "Bank detail mismatch controls confirmed in place.",
  s5_c6: "OCR vs keyed data checks and cloning detection in place.",
  s6_c1: "Website reviewed. APR displayed. Risk warnings present. Privacy policy current.",
  s6_c2: "Social media reviewed. No non-compliant financial promotions found.",
  s7_c1: "Alternative channels monitored and retained.",
  s7_c2: "Complaints volume tracked and benchmarked against sentiment.",
  s7_c3: "Root cause analysis conducted on complaints. Remediation tracked.",
  s7_c4: "Complaints questionnaire completed. No material findings.",
  s8_c1: "Arrears referral patterns reviewed. No concerning dealer-level trends.",
};

function buildChecks(answers: Record<string, FindingEntry>): PreScreenCheck[] {
  return CHECK_DEFS.map(def => {
    const a = answers[def.checkId];
    return {
      ...def,
      answered: !!a,
      finding: a?.finding || "",
      answeredBy: a?.by || null,
      answeredAt: a?.at || null,
    };
  });
}

function allChecksAnswered(by: string, at: string, overrides?: Record<string, string>): Record<string, FindingEntry> {
  const result: Record<string, FindingEntry> = {};
  for (const def of CHECK_DEFS) {
    result[def.checkId] = {
      finding: overrides?.[def.checkId] || DEFAULT_FINDINGS[def.checkId] || "Confirmed — no issues identified.",
      by,
      at,
    };
  }
  return result;
}

function partialChecks(checkIds: string[], by: string, at: string, findings?: Record<string, string>): Record<string, FindingEntry> {
  const result: Record<string, FindingEntry> = {};
  for (const id of checkIds) {
    result[id] = {
      finding: findings?.[id] || DEFAULT_FINDINGS[id] || "Confirmed — no issues identified.",
      by,
      at,
    };
  }
  return result;
}

function buildPolicies(
  answered: { id: string; has: boolean; notes: string; by: string; at: string }[],
  excludeInsurance = false
): OnboardingPolicy[] {
  const map = new Map(answered.map((a) => [a.id, a]));
  return masterPolicyList
    .filter((p) => !(excludeInsurance && p.category === "Insurance (if applicable)"))
    .map((p) => {
      const a = map.get(p.id);
      return {
        policyId: p.id, name: p.name, category: p.category,
        dealerHasIt: a ? a.has : null, notes: a?.notes || "",
        answeredBy: a?.by || null, answeredAt: a?.at || null,
      };
    });
}

function buildSectionProgress(checks: PreScreenCheck[]): Record<string, SectionProgress> {
  const map: Record<string, SectionProgress> = {};
  for (const c of checks) {
    if (!map[c.sectionId]) map[c.sectionId] = { answered: 0, total: 0 };
    map[c.sectionId].total++;
    if (c.answered) map[c.sectionId].answered++;
  }
  return map;
}

function buildCompletion(
  checks: PreScreenCheck[],
  policies: OnboardingPolicy[],
  detailsComplete: boolean,
  completedBy?: string,
  completedAt?: string,
): CompletionStatus {
  const allChecks = checks.every((c) => c.answered);
  const allPolicies = policies.every((p) => p.dealerHasIt !== null);
  const answeredCount = checks.filter((c) => c.answered).length;
  const complete = allChecks && allPolicies && detailsComplete;
  const sectionProgress = buildSectionProgress(checks);
  // Add policies as s9_policies
  const policyAnswered = policies.filter((p) => p.dealerHasIt !== null).length;
  sectionProgress["s9_policies"] = { answered: policyAnswered, total: policies.length };
  return {
    checksAnswered: answeredCount,
    checksTotal: checks.length,
    sectionProgress,
    allPreScreenChecksAnswered: allChecks,
    allPoliciesAnswered: allPolicies,
    dealerDetailsComplete: detailsComplete,
    onboardingComplete: complete,
    completedBy: complete ? (completedBy || null) : null,
    completedAt: complete ? (completedAt || null) : null,
  };
}

function quickPolicies(
  count: number, by: string, atBase: string,
  excludeInsurance = false,
  overrides: { id: string; has: boolean; notes: string }[] = []
): OnboardingPolicy[] {
  const overrideMap = new Map(overrides.map((o) => [o.id, o]));
  const list = masterPolicyList.filter(
    (p) => !(excludeInsurance && p.category === "Insurance (if applicable)")
  );
  return list.map((p, i) => {
    const ovr = overrideMap.get(p.id);
    if (ovr) {
      return { policyId: p.id, name: p.name, category: p.category, dealerHasIt: ovr.has, notes: ovr.notes, answeredBy: by, answeredAt: atBase };
    }
    if (i < count) {
      return { policyId: p.id, name: p.name, category: p.category, dealerHasIt: true, notes: "Confirmed held.", answeredBy: by, answeredAt: atBase };
    }
    return { policyId: p.id, name: p.name, category: p.category, dealerHasIt: null, notes: "", answeredBy: null, answeredAt: null };
  });
}

// ── Seeder Applications ──────────────────────────────────────

const TG = "Tom Griffiths";
const AO = "Amara Osei";

// Section IDs for partial builders
const S1 = ["s1_c1", "s1_c2", "s1_c3", "s1_c4", "s1_c5"];
const S2 = ["s2_c1", "s2_c2", "s2_c3", "s2_c4"];
const S3 = ["s3_c1", "s3_c2"];
const S4 = ["s4_c1", "s4_c2", "s4_c3", "s4_c4", "s4_c5"];
const S5 = ["s5_c1", "s5_c2", "s5_c3", "s5_c4", "s5_c5", "s5_c6"];
const S6 = ["s6_c1", "s6_c2"];
const S7 = ["s7_c1", "s7_c2", "s7_c3", "s7_c4"];
const S8 = ["s8_c1"];

export const seederApplications: OnboardingApplication[] = [
  // app001 — Stage 1, In Progress, S1 fully done (5/5), S2 partial (2/4), S3-S8 unanswered = 7/29
  (() => {
    const chks = buildChecks(partialChecks(
      [...S1, "s2_c1", "s2_c2"],
      TG, "2026-02-18T10:15:00",
      {
        s1_c1: "Company confirmed active on Companies House. Incorporated 14 Mar 2018. No dissolution notices. Filing history up to date.",
        s1_c2: "Trading name 'Fordham Motors' consistent across FCA register (ref 812344), ICO registration (ZA458923) and website homepage.",
        s1_c3: "Lee Fordham (Director / PSC since incorporation) and Rachel Fordham (Director since 2019). No changes in last 24 months. No PSC warnings.",
        s1_c4: "No sanctions hits on OFSI or EU consolidated list. No adverse media identified via Experian AML screening. PEP check clear for Lee Fordham and Rachel Fordham. Checked 18 Feb 2026.",
        s1_c5: "Self-declaration form received from Lee Fordham dated 15 Feb 2026. No criminal or regulatory sanctions disclosed. Cross-referenced with FCA final notices — none found.",
        s2_c1: "Confirmed directly authorised under FCA ref 812344. Permissions include credit broking (consumer hire, hire purchase). Not an AR. Consumer credit permissions active since 2019.",
        s2_c2: "SAF training completed by Lee Fordham (Jan 2026) and Rachel Fordham (Jan 2026). Lender-specific competence for Apex Motor Finance confirmed via certificate on file. No outstanding training requirements.",
      }
    ));
    const pols = quickPolicies(0, TG, "2026-02-20T11:00:00"); // no policies started yet
    return {
      id: "app001", appRef: "APP-001-2026", stage: 1, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Fordham Motor Group Ltd", tradingName: "Fordham Motors",
      companiesHouseNo: "07391024", website: "https://www.fordhammotors.co.uk",
      primaryContact: { name: "Lee Fordham", email: "l.fordham@fordhammotors.co.uk", phone: "01443 882200" },
      registeredAddress: { street: "18 Station Road", town: "Pontypridd", county: "Rhondda Cynon Taf", postcode: "CF37 1PG" },
      distributeInsurance: true, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-18T09:00:00", assignedTo: TG,
      lastUpdated: "2026-02-24T14:30:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-07",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Corporate Governance section complete. Permissions in progress — SMF and cross-reference checks outstanding.",
      history: [
        { date: "2026-02-18T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-18T10:50:00", action: "Section 1 (Corporate Governance) — all 5 checks completed", user: TG },
        { date: "2026-02-18T11:20:00", action: "Section 2 — FCA authorisation and competence checks completed (2/4)", user: TG },
        { date: "2026-02-24T14:30:00", action: "Note added: Awaiting SMF allocation details from dealer", user: TG },
      ],
    };
  })(),

  // app002 — Stage 2, In Progress, all 29 checks, all policies (insurance excluded)
  (() => {
    const chks = buildChecks(allChecksAnswered(AO, "2026-02-16T09:00:00"));
    const pols = quickPolicies(22, AO, "2026-02-28T16:00:00", true);
    return {
      id: "app002", appRef: "APP-002-2026", stage: 2, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Kestrel Car Sales Ltd", tradingName: "Kestrel Cars",
      companiesHouseNo: "08124590", website: "https://www.kestrelcars.co.uk",
      primaryContact: { name: "Nina Shah", email: "n.shah@kestrelcars.co.uk", phone: "0117 946 1100" },
      registeredAddress: { street: "42 Queens Road", town: "Bristol", county: "Bristol", postcode: "BS8 1QU" },
      distributeInsurance: false, requestingLender: "l002", requestingLenderName: "Meridian Vehicle Finance Ltd",
      initiatedBy: AO, initiatedDate: "2026-02-15T11:00:00", assignedTo: AO,
      lastUpdated: "2026-02-28T16:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-05",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true, AO, "2026-02-28T16:00:00"),
      dndClear: true, platformDndClear: true,
      notes: "All checks and policies complete. Ready for review.",
      history: [
        { date: "2026-02-15T11:00:00", action: "Application created", user: AO },
        { date: "2026-02-16T09:00:00", action: "All 29 checks completed", user: AO },
        { date: "2026-02-28T16:00:00", action: "All policies confirmed — onboarding complete", user: AO },
      ],
    };
  })(),

  // app003 — Ready to Transfer, all 29 checks with realistic findings
  (() => {
    const chks = buildChecks(allChecksAnswered(TG, "2026-02-11T14:00:00", {
      s1_c1: "Company active on Companies House. Incorporated 22 Jun 2015. Filing history current. No dissolution or striking-off notices.",
      s1_c2: "Trading as 'Highfield Motors' — confirmed consistent across FCA register (ref 798211), ICO registration (ZA512834) and website.",
      s1_c3: "Richard Price (Director/PSC since incorporation), Sarah Price (Director since 2017). No governance changes in 24 months.",
      s1_c4: "No sanctions matches on OFSI, EU or UN lists. No adverse media via Experian AML. PEP clear for both directors. Screened 11 Feb 2026.",
      s1_c5: "Self-declaration received from Richard Price (10 Feb 2026). No criminal or regulatory sanctions disclosed. Cross-checked FCA final notices — nil.",
      s2_c1: "Directly authorised under FCA ref 798211. Permissions: credit broking (HP, PCP, personal loan). Consumer credit active since 2016. Not an AR.",
      s2_c2: "SAF training completed by Richard Price (Dec 2025) and Sarah Price (Dec 2025). Apex-specific competence module completed Jan 2026. Evidence on file.",
      s2_c3: "Richard Price allocated as SMF holder for compliance oversight. Scope covers all consumer credit activity. Last reviewed Nov 2025.",
      s2_c4: "Director names, trading name 'Highfield Motors' and registered address match across Companies House, FCA register and dealer website. No discrepancies.",
      s3_c1: "Pre-contract disclosures provided via standardised pack before agreement. Includes SECCI, privacy notice and right to withdraw. Process confirmed by DP.",
      s3_c2: "Affordability checks conducted per Apex policy using income verification and ONS data. Process confirmed. Sample checked — compliant.",
      s4_c1: "APR benchmarked quarterly against aggregated market data from iVendi platform. Current median APR 8.9% vs benchmark 9.2%. Within tolerance.",
      s4_c2: "Product range (HP, PCP) designed for target market — used car buyers £8k–£25k. No evidence of unsuitable product recommendations.",
      s4_c3: "Customers receive written summary of key terms at point of sale. Staff trained on plain-language explanations. Mystery shop confirmed understanding.",
      s4_c4: "Post-sale support via phone (Mon–Sat 9–5), email (24h response SLA) and in-person. No complaints about accessibility in last 12 months.",
      s4_c5: "Vulnerability identification process uses TEXAS model at application. Staff trained annually. 3 vulnerability cases recorded in last 6 months — all handled appropriately.",
      s5_c1: "KYC/IDV completed for all applicants via Experian Identity Check. Process automated through lender platform. Pass rate 94%.",
      s5_c2: "Sanctions and PEP screening run automatically at application via Experian AML module. No hits in last 12 months.",
      s5_c3: "Device fingerprinting and IP geolocation monitoring active via iVendi platform. Anomaly alerts reviewed daily by operations team.",
      s5_c4: "Velocity monitoring in place — flags >2 applications from same device/email in 24h period. 2 flags in last quarter, both resolved as legitimate.",
      s5_c5: "Bank detail mismatch detection active via lender platform. Payout destination verified against applicant bank details. No mismatches in Q4.",
      s5_c6: "OCR validation on uploaded documents vs keyed application data. Cloning fingerprint detection active. No fraudulent applications identified.",
      s6_c1: "Website reviewed 11 Feb. Representative APR displayed correctly (9.9% APR). Risk warnings present. Privacy policy dated Jan 2026. Cookie consent via OneTrust — compliant.",
      s6_c2: "Social media reviewed (Facebook, Instagram). No financial promotion posts identified. Dealer confirmed social media policy prohibits finance advertising without compliance review.",
      s7_c1: "Customer comms via email and phone. All calls recorded and retained 12 months. Email correspondence retained in CRM. No use of WhatsApp or SMS for regulated comms.",
      s7_c2: "12 complaints received in last 12 months (0.8% of applications). Benchmarked against 1.2% sector average. Google reviews 4.4/5 (186 reviews). Sentiment positive.",
      s7_c3: "Root cause analysis conducted quarterly. Last review identified documentation delays as primary theme. Remediation: new digital document upload flow implemented Jan 2026.",
      s7_c4: "TCG complaints questionnaire completed 8 Feb 2026. No material findings. Minor recommendation: formalise escalation timeline documentation.",
      s8_c1: "Arrears referral patterns reviewed. 2.1% early arrears rate (30+ days) vs 2.8% portfolio average. No concerning dealer-level trends. Forbearance referral process documented.",
    }));
    const pols = quickPolicies(22, TG, "2026-02-25T16:00:00");
    return {
      id: "app003", appRef: "APP-003-2026", stage: 2, status: "Ready to Transfer" as OnboardingAppStatus,
      dealerName: "Highfield Motor Company", tradingName: "Highfield Motors",
      companiesHouseNo: "09451230", website: "https://www.highfieldmotors.co.uk",
      primaryContact: { name: "Richard Price", email: "r.price@highfieldmotors.co.uk", phone: "01633 882100" },
      registeredAddress: { street: "7 Caerleon Road", town: "Newport", county: "Gwent", postcode: "NP19 7BX" },
      distributeInsurance: true, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-10T08:30:00", assignedTo: TG,
      lastUpdated: "2026-03-01T10:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-04",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true, TG, "2026-03-01T10:00:00", true),
      dndClear: true, platformDndClear: true,
      notes: "All sections verified. Marked as ready to transfer to lender.",
      history: [
        { date: "2026-02-10T08:30:00", action: "Application created", user: TG },
        { date: "2026-02-11T14:00:00", action: "All 29 checks completed", user: TG },
        { date: "2026-02-25T16:00:00", action: "All policies confirmed", user: TG },
        { date: "2026-03-01T10:00:00", action: "Marked as ready to transfer", user: TG },
      ],
    };
  })(),

  // app004 — Draft, nothing started
  (() => {
    const chks = buildChecks({});
    const pols = quickPolicies(0, "", "");
    return {
      id: "app004", appRef: "APP-004-2026", stage: 1, status: "Draft" as OnboardingAppStatus,
      dealerName: "Cornerstone Vehicles Ltd", tradingName: "Cornerstone Vehicles",
      companiesHouseNo: "", website: "",
      primaryContact: { name: "", email: "", phone: "" },
      registeredAddress: { street: "", town: "", county: "", postcode: "" },
      distributeInsurance: null, requestingLender: "l003", requestingLenderName: "Broadstone Motor Credit Plc",
      initiatedBy: "System", initiatedDate: "2026-03-03T08:00:00", assignedTo: "Unassigned",
      lastUpdated: "2026-03-03T08:00:00", lastUpdatedBy: "System", targetCompletionDate: "2026-03-20",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, false),
      dndClear: true, platformDndClear: true,
      notes: "New application — not yet started",
      history: [{ date: "2026-03-03T08:00:00", action: "Application created by lender request", user: "System" }],
    };
  })(),

  // app005 — Stage 1, In Progress, 5/29 checks (Corporate Governance section only)
  (() => {
    const chks = buildChecks(partialChecks(S1, AO, "2026-03-03T11:00:00", {
      s1_c1: "Company confirmed active. Incorporated 2015. 1 director, 1 PSC.",
      s1_c2: "Trading name consistent across FCA and website.",
      s1_c3: "Single director identified. No changes in 24 months.",
      s1_c4: "No sanctions hits. PEP check clear.",
      s1_c5: "Self-declaration obtained.",
    }));
    const pols = quickPolicies(0, "", "", true);
    return {
      id: "app005", appRef: "APP-005-2026", stage: 1, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Redbridge Auto Centre", tradingName: "Redbridge Auto",
      companiesHouseNo: "10283741", website: "https://www.redbridgeauto.co.uk",
      primaryContact: { name: "James Owens", email: "j.owens@redbridgeauto.co.uk", phone: "020 8530 4400" },
      registeredAddress: { street: "55 High Road", town: "Ilford", county: "Essex", postcode: "IG1 1DE" },
      distributeInsurance: false, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: AO, initiatedDate: "2026-03-01T10:00:00", assignedTo: AO,
      lastUpdated: "2026-03-03T11:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-14",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Corporate Governance section completed — 5/29 checks answered",
      history: [
        { date: "2026-03-01T10:00:00", action: "Application created", user: AO },
        { date: "2026-03-03T11:00:00", action: "Corporate Governance checks completed (5/29)", user: AO },
      ],
    };
  })(),

  // app006 — Stage 2, In Progress, all 29 checks, 14/22 policies
  (() => {
    const chks = buildChecks(allChecksAnswered(TG, "2026-02-13T11:00:00"));
    const pols = quickPolicies(14, TG, "2026-03-02T15:00:00");
    return {
      id: "app006", appRef: "APP-006-2026", stage: 2, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Moorland Motors Ltd", tradingName: "Moorland Motors",
      companiesHouseNo: "08765432", website: "https://www.moorlandmotors.co.uk",
      primaryContact: { name: "Helen Cross", email: "h.cross@moorlandmotors.co.uk", phone: "01onal 887200" },
      registeredAddress: { street: "12 Market Street", town: "Leek", county: "Staffordshire", postcode: "ST13 5HJ" },
      distributeInsurance: true, requestingLender: "l004", requestingLenderName: "Northern Rock Motor Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-12T09:00:00", assignedTo: TG,
      lastUpdated: "2026-03-02T15:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-10",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Missing AML and GDPR policies — chasing dealer",
      history: [
        { date: "2026-02-12T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-13T11:00:00", action: "All 29 checks completed", user: TG },
        { date: "2026-03-02T15:00:00", action: "Chased dealer for outstanding policies", user: TG },
      ],
    };
  })(),

  // app007 — Ready to Transfer
  (() => {
    const chks = buildChecks(allChecksAnswered(AO, "2026-02-06T10:00:00"));
    const pols = quickPolicies(22, AO, "2026-02-20T14:00:00", true);
    return {
      id: "app007", appRef: "APP-007-2026", stage: 2, status: "Ready to Transfer" as OnboardingAppStatus,
      dealerName: "Sterling Park Autos", tradingName: "Sterling Park",
      companiesHouseNo: "11234567", website: "https://www.sterlingparkautos.co.uk",
      primaryContact: { name: "Gareth Lloyd", email: "g.lloyd@sterlingpark.co.uk", phone: "029 2047 1100" },
      registeredAddress: { street: "3 Cathedral Road", town: "Cardiff", county: "South Glamorgan", postcode: "CF11 9HA" },
      distributeInsurance: false, requestingLender: "l002", requestingLenderName: "Meridian Vehicle Finance Ltd",
      initiatedBy: AO, initiatedDate: "2026-02-05T08:00:00", assignedTo: AO,
      lastUpdated: "2026-03-01T09:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-05",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true, AO, "2026-03-01T09:00:00", true),
      dndClear: true, platformDndClear: true,
      notes: "Full pack received — all information gathered. Marked ready to transfer.",
      history: [
        { date: "2026-02-05T08:00:00", action: "Application created", user: AO },
        { date: "2026-02-06T10:00:00", action: "All 29 checks completed", user: AO },
        { date: "2026-02-20T14:00:00", action: "All policies confirmed", user: AO },
        { date: "2026-03-01T09:00:00", action: "Marked as ready to transfer", user: AO },
      ],
    };
  })(),

  // app008 — Stage 1, In Progress, 15/29 checks (Corporate Gov + Permissions + Sales + s4_c1)
  (() => {
    const chks = buildChecks(partialChecks(
      [...S1, ...S2, ...S3, "s4_c1"],
      TG, "2026-02-25T09:30:00",
      {
        s1_c3: "Paul Simmons (Director/PSC) and Mary Simmons (Director). No changes in 24 months.",
        s2_c1: "FCA permissions unclear — need to confirm scope of credit broking permission. Follow-up call arranged.",
        s1_c4: "Director surname match flagged on sanctions screening. Manual review confirms false positive — common surname.",
      }
    ));
    const pols = quickPolicies(0, "", "");
    return {
      id: "app008", appRef: "APP-008-2026", stage: 1, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Clifton Vehicle Hire Ltd", tradingName: "Clifton Hire",
      companiesHouseNo: "09876543", website: "https://www.cliftonhire.co.uk",
      primaryContact: { name: "Paul Simmons", email: "p.simmons@cliftonhire.co.uk", phone: "0117 974 3300" },
      registeredAddress: { street: "28 Whiteladies Road", town: "Bristol", county: "Bristol", postcode: "BS8 2LG" },
      distributeInsurance: false, requestingLender: "l003", requestingLenderName: "Broadstone Motor Credit Plc",
      initiatedBy: TG, initiatedDate: "2026-02-25T09:00:00", assignedTo: TG,
      lastUpdated: "2026-03-02T10:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-12",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "FCA permissions need confirming. Sanctions flag was false positive.",
      history: [
        { date: "2026-02-25T09:00:00", action: "Application created", user: TG },
        { date: "2026-03-02T10:00:00", action: "12 checks completed — FCA and sanctions findings recorded", user: TG },
      ],
    };
  })(),

  // app009 — Draft
  (() => {
    const chks = buildChecks({});
    const pols = quickPolicies(0, "", "");
    return {
      id: "app009", appRef: "APP-009-2026", stage: 1, status: "Draft" as OnboardingAppStatus,
      dealerName: "Ashworth Motor Sales", tradingName: "Ashworth Motors",
      companiesHouseNo: "", website: "",
      primaryContact: { name: "", email: "", phone: "" },
      registeredAddress: { street: "", town: "", county: "", postcode: "" },
      distributeInsurance: null, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: "System", initiatedDate: "2026-03-04T08:00:00", assignedTo: "Unassigned",
      lastUpdated: "2026-03-04T08:00:00", lastUpdatedBy: "System", targetCompletionDate: "2026-03-21",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, false),
      dndClear: true, platformDndClear: true,
      notes: "Lender requested this morning",
      history: [{ date: "2026-03-04T08:00:00", action: "Application created by lender request", user: "System" }],
    };
  })(),

  // app010 — Stage 2, In Progress, all 29 checks, 20/22 policies
  (() => {
    const chks = buildChecks(allChecksAnswered(AO, "2026-02-15T14:00:00"));
    const pols = quickPolicies(20, AO, "2026-03-03T14:00:00");
    return {
      id: "app010", appRef: "APP-010-2026", stage: 2, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Beaumont Cars Ltd", tradingName: "Beaumont Cars",
      companiesHouseNo: "10482913", website: "https://www.beaumontcars.co.uk",
      primaryContact: { name: "Sophie Watts", email: "s.watts@beaumontcars.co.uk", phone: "01onal 553200" },
      registeredAddress: { street: "9 Park Lane", town: "Maidstone", county: "Kent", postcode: "ME15 6QA" },
      distributeInsurance: true, requestingLender: "l003", requestingLenderName: "Broadstone Motor Credit Plc",
      initiatedBy: AO, initiatedDate: "2026-02-14T10:00:00", assignedTo: AO,
      lastUpdated: "2026-03-03T14:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-08",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "One insurance policy outstanding",
      history: [
        { date: "2026-02-14T10:00:00", action: "Application created", user: AO },
        { date: "2026-02-15T14:00:00", action: "All 29 checks completed", user: AO },
        { date: "2026-03-03T14:00:00", action: "20/22 policies confirmed", user: AO },
      ],
    };
  })(),

  // app011 — Ready to Transfer
  (() => {
    const chks = buildChecks(allChecksAnswered(TG, "2026-02-04T11:00:00"));
    const pols = quickPolicies(22, TG, "2026-02-22T15:00:00");
    return {
      id: "app011", appRef: "APP-011-2026", stage: 2, status: "Ready to Transfer" as OnboardingAppStatus,
      dealerName: "Crown Garage (Newport) Ltd", tradingName: "Crown Garage",
      companiesHouseNo: "07654321", website: "https://www.crowngarage.co.uk",
      primaryContact: { name: "Alun Davies", email: "a.davies@crowngarage.co.uk", phone: "01633 221100" },
      registeredAddress: { street: "15 Commercial Street", town: "Newport", county: "Gwent", postcode: "NP20 1LR" },
      distributeInsurance: true, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-03T09:00:00", assignedTo: TG,
      lastUpdated: "2026-03-02T16:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-05",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true, TG, "2026-03-02T16:00:00", true),
      dndClear: true, platformDndClear: true,
      notes: "All clear — marked ready to transfer",
      history: [
        { date: "2026-02-03T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-04T11:00:00", action: "All 29 checks completed", user: TG },
        { date: "2026-02-22T15:00:00", action: "All policies confirmed", user: TG },
        { date: "2026-03-02T16:00:00", action: "Marked as ready to transfer", user: TG },
      ],
    };
  })(),

  // app012 — Archived (FCA authorisation lapsed)
  (() => {
    const chks = buildChecks(partialChecks(
      ["s1_c1", "s1_c2", "s2_c1"],
      TG, "2026-02-12T10:00:00",
      {
        s1_c1: "Company active on Companies House.",
        s1_c2: "Trading name consistent.",
        s2_c1: "FCA authorisation LAPSED — firm no longer authorised as of Jan 2026. Cannot proceed until resolved.",
      }
    ));
    const pols = quickPolicies(0, "", "", true);
    return {
      id: "app012", appRef: "APP-012-2026", stage: 1, status: "Archived" as OnboardingAppStatus,
      dealerName: "Apex Road Autos", tradingName: "Apex Road",
      companiesHouseNo: "06543210", website: "https://www.apexroadautos.co.uk",
      primaryContact: { name: "Dean Walker", email: "d.walker@apexroad.co.uk", phone: "01onal 332200" },
      registeredAddress: { street: "44 Ring Road", town: "Leeds", county: "West Yorkshire", postcode: "LS12 1BE" },
      distributeInsurance: false, requestingLender: "l002", requestingLenderName: "Meridian Vehicle Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-10T09:00:00", assignedTo: TG,
      lastUpdated: "2026-02-20T14:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-01",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "FCA authorisation lapsed — dealer unable to proceed.",
      archiveReason: "FCA authorisation lapsed — dealer unable to proceed",
      history: [
        { date: "2026-02-10T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-12T10:00:00", action: "FCA check — authorisation lapsed. Finding recorded.", user: TG },
        { date: "2026-02-20T14:00:00", action: "Application archived — FCA authorisation lapsed", user: TG },
      ],
    };
  })(),

  // app013 — Stage 2, In Progress, all 29 checks, 16/22 policies (no insurance)
  (() => {
    const chks = buildChecks(allChecksAnswered(AO, "2026-02-18T14:00:00"));
    const pols = quickPolicies(16, AO, "2026-03-03T09:00:00", true);
    return {
      id: "app013", appRef: "APP-013-2026", stage: 2, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Lakeside Vehicle Centre", tradingName: "Lakeside Vehicles",
      companiesHouseNo: "11345678", website: "https://www.lakesidevehicles.co.uk",
      primaryContact: { name: "Karen Malik", email: "k.malik@lakeside.co.uk", phone: "01onal 667700" },
      registeredAddress: { street: "22 Lake Road", town: "Windermere", county: "Cumbria", postcode: "LA23 1BJ" },
      distributeInsurance: false, requestingLender: "l004", requestingLenderName: "Northern Rock Motor Finance Ltd",
      initiatedBy: AO, initiatedDate: "2026-02-17T09:00:00", assignedTo: AO,
      lastUpdated: "2026-03-03T09:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-12",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Waiting on T&C policy and BCP",
      history: [
        { date: "2026-02-17T09:00:00", action: "Application created", user: AO },
        { date: "2026-02-18T14:00:00", action: "All 29 checks completed", user: AO },
        { date: "2026-03-03T09:00:00", action: "16/22 policies confirmed — chasing T&C and BCP", user: AO },
      ],
    };
  })(),

  // app014 — Draft
  (() => {
    const chks = buildChecks({});
    const pols = quickPolicies(0, "", "");
    return {
      id: "app014", appRef: "APP-014-2026", stage: 1, status: "Draft" as OnboardingAppStatus,
      dealerName: "Hartfield Motors Ltd", tradingName: "Hartfield Motors",
      companiesHouseNo: "", website: "",
      primaryContact: { name: "", email: "", phone: "" },
      registeredAddress: { street: "", town: "", county: "", postcode: "" },
      distributeInsurance: null, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: "System", initiatedDate: "2026-03-02T08:00:00", assignedTo: "Unassigned",
      lastUpdated: "2026-03-02T08:00:00", lastUpdatedBy: "System", targetCompletionDate: "2026-03-18",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, false),
      dndClear: true, platformDndClear: true,
      notes: "Awaiting Companies House number from lender",
      history: [{ date: "2026-03-02T08:00:00", action: "Application created by lender request", user: "System" }],
    };
  })(),

  // app015 — Stage 2, In Progress, all 29 checks, 19/26 policies
  (() => {
    const chks = buildChecks(allChecksAnswered(TG, "2026-02-12T11:00:00"));
    const pols = quickPolicies(19, TG, "2026-03-03T16:00:00");
    return {
      id: "app015", appRef: "APP-015-2026", stage: 2, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Valley Gate Autos Ltd", tradingName: "Valley Gate Autos",
      companiesHouseNo: "09123456", website: "https://www.valleygateautos.co.uk",
      primaryContact: { name: "Mark Jenkins", email: "m.jenkins@valleygate.co.uk", phone: "01443 776600" },
      registeredAddress: { street: "5 Bridge Street", town: "Bridgend", county: "Mid Glamorgan", postcode: "CF31 1EG" },
      distributeInsurance: true, requestingLender: "l003", requestingLenderName: "Broadstone Motor Credit Plc",
      initiatedBy: TG, initiatedDate: "2026-02-11T09:00:00", assignedTo: TG,
      lastUpdated: "2026-03-03T16:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-07",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Near complete — chasing 2 docs",
      history: [
        { date: "2026-02-11T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-12T11:00:00", action: "All 29 checks completed", user: TG },
        { date: "2026-03-03T16:00:00", action: "19/26 policies confirmed — 2 final policies being chased", user: TG },
      ],
    };
  })(),

  // app016 — Stage 1, In Progress, 19/29 checks (S1-S4 + S5 partial)
  (() => {
    const chks = buildChecks(partialChecks(
      [...S1, ...S2, ...S3, ...S4, "s5_c1", "s5_c2", "s5_c3", "s5_c4"],
      AO, "2026-03-03T12:00:00",
      { s1_c1: "CreditSafe score 48/100. Below typical threshold. No CCJs but thin credit file. Lender should be aware." }
    ));
    const pols = quickPolicies(0, "", "", true);
    return {
      id: "app016", appRef: "APP-016-2026", stage: 1, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Riverside Auto Group", tradingName: "Riverside Auto",
      companiesHouseNo: "10567890", website: "https://www.riversideauto.co.uk",
      primaryContact: { name: "Claire Bennett", email: "c.bennett@riverside.co.uk", phone: "020 7946 5500" },
      registeredAddress: { street: "100 River Road", town: "London", county: "Greater London", postcode: "SE1 7PB" },
      distributeInsurance: false, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: AO, initiatedDate: "2026-02-28T10:00:00", assignedTo: AO,
      lastUpdated: "2026-03-03T12:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-14",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "CreditSafe score 48 — finding recorded for lender awareness",
      history: [
        { date: "2026-02-28T10:00:00", action: "Application created", user: AO },
        { date: "2026-03-03T12:00:00", action: "20 checks completed — financial standing finding recorded", user: AO },
      ],
    };
  })(),

  // app017 — Ready to Transfer
  (() => {
    const chks = buildChecks(allChecksAnswered(TG, "2026-02-02T14:00:00"));
    const pols = quickPolicies(22, TG, "2026-02-20T16:00:00");
    return {
      id: "app017", appRef: "APP-017-2026", stage: 2, status: "Ready to Transfer" as OnboardingAppStatus,
      dealerName: "Pennfield Cars Ltd", tradingName: "Pennfield Cars",
      companiesHouseNo: "08901234", website: "https://www.pennfieldcars.co.uk",
      primaryContact: { name: "David Rees", email: "d.rees@pennfield.co.uk", phone: "01792 445500" },
      registeredAddress: { street: "33 Wind Street", town: "Swansea", county: "West Glamorgan", postcode: "SA1 1DY" },
      distributeInsurance: true, requestingLender: "l002", requestingLenderName: "Meridian Vehicle Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-01T09:00:00", assignedTo: TG,
      lastUpdated: "2026-03-01T15:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-04",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true, TG, "2026-03-01T15:00:00", true),
      dndClear: true, platformDndClear: true,
      notes: "Insurance products confirmed — all information gathered.",
      history: [
        { date: "2026-02-01T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-02T14:00:00", action: "All 29 checks completed", user: TG },
        { date: "2026-02-20T16:00:00", action: "All policies confirmed", user: TG },
        { date: "2026-03-01T15:00:00", action: "Marked as ready to transfer", user: TG },
      ],
    };
  })(),

  // app018 — Stage 2, In Progress, all 29 checks, 12/22 policies (no insurance)
  (() => {
    const chks = buildChecks(allChecksAnswered(AO, "2026-02-20T14:00:00"));
    const pols = quickPolicies(12, AO, "2026-03-03T10:00:00", true);
    return {
      id: "app018", appRef: "APP-018-2026", stage: 2, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Granary Motor Sales", tradingName: "Granary Motors",
      companiesHouseNo: "11678901", website: "https://www.granarymotors.co.uk",
      primaryContact: { name: "Steve Harvey", email: "s.harvey@granary.co.uk", phone: "01onal 889900" },
      registeredAddress: { street: "8 Mill Lane", town: "Shrewsbury", county: "Shropshire", postcode: "SY1 1PU" },
      distributeInsurance: false, requestingLender: "l003", requestingLenderName: "Broadstone Motor Credit Plc",
      initiatedBy: AO, initiatedDate: "2026-02-19T09:00:00", assignedTo: AO,
      lastUpdated: "2026-03-03T10:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-14",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Slow to respond — chased twice",
      history: [
        { date: "2026-02-19T09:00:00", action: "Application created", user: AO },
        { date: "2026-02-20T14:00:00", action: "All 29 checks completed", user: AO },
        { date: "2026-03-03T10:00:00", action: "Second chase sent — 12/22 policies complete", user: AO },
      ],
    };
  })(),

  // app019 — Draft
  (() => {
    const chks = buildChecks({});
    const pols = quickPolicies(0, "", "");
    return {
      id: "app019", appRef: "APP-019-2026", stage: 1, status: "Draft" as OnboardingAppStatus,
      dealerName: "Westbrook Autos Ltd", tradingName: "Westbrook Autos",
      companiesHouseNo: "", website: "",
      primaryContact: { name: "", email: "", phone: "" },
      registeredAddress: { street: "", town: "", county: "", postcode: "" },
      distributeInsurance: null, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: "System", initiatedDate: "2026-03-04T07:00:00", assignedTo: "Unassigned",
      lastUpdated: "2026-03-04T07:00:00", lastUpdatedBy: "System", targetCompletionDate: "2026-03-21",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, false),
      dndClear: true, platformDndClear: true,
      notes: "Just created",
      history: [{ date: "2026-03-04T07:00:00", action: "Application created", user: "System" }],
    };
  })(),

  // app020 — Stage 2, In Progress, all 29 checks, 21/26 policies
  (() => {
    const chks = buildChecks(allChecksAnswered(TG, "2026-02-09T11:00:00"));
    const pols = quickPolicies(21, TG, "2026-03-03T17:00:00");
    return {
      id: "app020", appRef: "APP-020-2026", stage: 2, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Kinsley Vehicle Sales", tradingName: "Kinsley Vehicles",
      companiesHouseNo: "10234567", website: "https://www.kinsleyvehicles.co.uk",
      primaryContact: { name: "Andy Moore", email: "a.moore@kinsley.co.uk", phone: "01924 553300" },
      registeredAddress: { street: "16 Wakefield Road", town: "Pontefract", county: "West Yorkshire", postcode: "WF8 4HB" },
      distributeInsurance: true, requestingLender: "l004", requestingLenderName: "Northern Rock Motor Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-08T09:00:00", assignedTo: TG,
      lastUpdated: "2026-03-03T17:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-06",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Final policy docs arriving tomorrow",
      history: [
        { date: "2026-02-08T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-09T11:00:00", action: "All 29 checks completed", user: TG },
        { date: "2026-03-03T17:00:00", action: "21/26 policies confirmed — final docs expected", user: TG },
      ],
    };
  })(),

  // app021 — Stage 1, all 29 checks done, policies not started
  (() => {
    const chks = buildChecks(allChecksAnswered(AO, "2026-03-04T09:00:00"));
    const pols = quickPolicies(0, "", "", true);
    return {
      id: "app021", appRef: "APP-021-2026", stage: 1, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Halton Motor Group", tradingName: "Halton Motors",
      companiesHouseNo: "11890123", website: "https://www.haltonmotors.co.uk",
      primaryContact: { name: "Emily Roberts", email: "e.roberts@halton.co.uk", phone: "0151 946 7700" },
      registeredAddress: { street: "60 Widnes Road", town: "Widnes", county: "Cheshire", postcode: "WA8 6AX" },
      distributeInsurance: false, requestingLender: "l002", requestingLenderName: "Meridian Vehicle Finance Ltd",
      initiatedBy: AO, initiatedDate: "2026-02-26T10:00:00", assignedTo: AO,
      lastUpdated: "2026-03-04T09:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-12",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "All checks complete — moving to policies",
      history: [
        { date: "2026-02-26T10:00:00", action: "Application created", user: AO },
        { date: "2026-03-04T09:00:00", action: "All 29 checks completed", user: AO },
      ],
    };
  })(),

  // app022 — Archived (Director sanctions match confirmed)
  (() => {
    const chks = buildChecks(partialChecks(
      ["s1_c1", "s1_c2", "s1_c3", "s1_c4", "s2_c1", "s2_c2", "s2_c3", "s2_c4", "s5_c1", "s5_c2"],
      AO, "2026-02-14T10:00:00",
      {
        s1_c1: "Company active.",
        s1_c2: "Names consistent.",
        s1_c3: "Brian Cole (sole director/PSC).",
        s1_c4: "SANCTIONS FLAG CONFIRMED — Director Brian Cole appears on OFSI consolidated list. Verified match. Finding escalated to requesting lender.",
        s2_c1: "Authorised. Permissions correct.",
        s5_c2: "Sanctions match confirmed at application screening level.",
      }
    ));
    const pols = quickPolicies(0, "", "", true);
    return {
      id: "app022", appRef: "APP-022-2026", stage: 1, status: "Archived" as OnboardingAppStatus,
      dealerName: "Clearway Cars Ltd", tradingName: "Clearway Cars",
      companiesHouseNo: "09012345", website: "https://www.clearwaycars.co.uk",
      primaryContact: { name: "Brian Cole", email: "b.cole@clearway.co.uk", phone: "020 7946 8800" },
      registeredAddress: { street: "77 Old Kent Road", town: "London", county: "Greater London", postcode: "SE1 5TY" },
      distributeInsurance: false, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: AO, initiatedDate: "2026-02-14T09:00:00", assignedTo: AO,
      lastUpdated: "2026-02-22T11:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-01",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: false, platformDndClear: true,
      notes: "Director sanctions match confirmed — archived following DND check",
      archiveReason: "Director sanctions match confirmed — archived following DND check",
      history: [
        { date: "2026-02-14T09:00:00", action: "Application created", user: AO },
        { date: "2026-02-16T10:00:00", action: "Sanctions flag confirmed on director — finding recorded", user: AO },
        { date: "2026-02-22T11:00:00", action: "Application archived — director sanctions match confirmed", user: AO },
      ],
    };
  })(),

  // app023 — Stage 2, In Progress, all 29 checks, 15/22 policies (no insurance)
  (() => {
    const chks = buildChecks(allChecksAnswered(TG, "2026-02-14T11:00:00"));
    const pols = quickPolicies(15, TG, "2026-03-03T13:00:00", true);
    return {
      id: "app023", appRef: "APP-023-2026", stage: 2, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Northwood Autos Ltd", tradingName: "Northwood Autos",
      companiesHouseNo: "10345678", website: "https://www.northwoodautos.co.uk",
      primaryContact: { name: "Lisa Thompson", email: "l.thompson@northwood.co.uk", phone: "01onal 224400" },
      registeredAddress: { street: "14 High Street", town: "Northwood", county: "Middlesex", postcode: "HA6 1BN" },
      distributeInsurance: false, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-13T09:00:00", assignedTo: TG,
      lastUpdated: "2026-03-03T13:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-10",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "No insurance products — 22 policies applicable. 15 confirmed.",
      history: [
        { date: "2026-02-13T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-14T11:00:00", action: "All 29 checks completed", user: TG },
        { date: "2026-03-03T13:00:00", action: "15/22 policies confirmed", user: TG },
      ],
    };
  })(),

  // app024 — Ready to Transfer
  (() => {
    const chks = buildChecks(allChecksAnswered(AO, "2026-02-05T11:00:00"));
    const pols = quickPolicies(22, AO, "2026-02-24T16:00:00");
    return {
      id: "app024", appRef: "APP-024-2026", stage: 2, status: "Ready to Transfer" as OnboardingAppStatus,
      dealerName: "Elmfield Motor Company", tradingName: "Elmfield Motors",
      companiesHouseNo: "08567890", website: "https://www.elmfieldmotors.co.uk",
      primaryContact: { name: "Rachel Hughes", email: "r.hughes@elmfield.co.uk", phone: "01onal 443300" },
      registeredAddress: { street: "21 Elm Avenue", town: "Cheltenham", county: "Gloucestershire", postcode: "GL50 2QE" },
      distributeInsurance: true, requestingLender: "l003", requestingLenderName: "Broadstone Motor Credit Plc",
      initiatedBy: AO, initiatedDate: "2026-02-04T09:00:00", assignedTo: AO,
      lastUpdated: "2026-03-02T14:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-05",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true, AO, "2026-03-02T14:00:00", true),
      dndClear: true, platformDndClear: true,
      notes: "All sections complete. Marked ready to transfer.",
      history: [
        { date: "2026-02-04T09:00:00", action: "Application created", user: AO },
        { date: "2026-02-05T11:00:00", action: "All 29 checks completed", user: AO },
        { date: "2026-02-24T16:00:00", action: "All policies confirmed", user: AO },
        { date: "2026-03-02T14:00:00", action: "Marked as ready to transfer", user: AO },
      ],
    };
  })(),

  // app025 — Stage 2, In Progress, all 29 checks, 10/22 policies (no insurance)
  (() => {
    const chks = buildChecks(allChecksAnswered(TG, "2026-03-02T10:00:00"));
    const pols = quickPolicies(10, TG, "2026-03-04T08:00:00", true);
    return {
      id: "app025", appRef: "APP-025-2026", stage: 2, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Brooklands Car Sales Ltd", tradingName: "Brooklands Cars",
      companiesHouseNo: "12345678", website: "https://www.brooklandscars.co.uk",
      primaryContact: { name: "Tom Harris", email: "t.harris@brooklands.co.uk", phone: "01932 445500" },
      registeredAddress: { street: "6 Brooklands Road", town: "Weybridge", county: "Surrey", postcode: "KT13 0RZ" },
      distributeInsurance: false, requestingLender: "l002", requestingLenderName: "Meridian Vehicle Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-03-01T09:00:00", assignedTo: TG,
      lastUpdated: "2026-03-04T08:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-18",
      checks: chks, policies: pols,
      completionStatus: buildCompletion(chks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "New instruction this week — early stage policies",
      history: [
        { date: "2026-03-01T09:00:00", action: "Application created", user: TG },
        { date: "2026-03-02T10:00:00", action: "All 29 checks completed", user: TG },
        { date: "2026-03-04T08:00:00", action: "10/22 policies confirmed", user: TG },
      ],
    };
  })(),
];

// ── Stats helper ─────────────────────────────────────────────

export function getOnboardingStats(apps: OnboardingApplication[]) {
  const active = apps.filter((a) => a.status !== "Ready to Transfer" && a.status !== "Archived");
  const totalPolicies = apps.reduce((s, a) => s + a.policies.length, 0);
  const answeredPolicies = apps.reduce((s, a) => s + a.policies.filter((p) => p.dealerHasIt !== null).length, 0);
  return {
    total: apps.length,
    drafts: apps.filter((a) => a.status === "Draft").length,
    inProgress: apps.filter((a) => a.status === "In Progress").length,
    readyToTransfer: apps.filter((a) => a.status === "Ready to Transfer").length,
    archived: apps.filter((a) => a.status === "Archived").length,
    avgPolicyCompletion: totalPolicies > 0 ? Math.round((answeredPolicies / totalPolicies) * 100) : 0,
    unassigned: apps.filter((a) => a.assignedTo === "Unassigned").length,
  };
}
