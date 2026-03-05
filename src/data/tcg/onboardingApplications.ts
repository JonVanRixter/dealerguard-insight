import { masterPolicyList } from "./dealerPolicies";

// ── Types ────────────────────────────────────────────────────

export type OnboardingAppStatus = "Draft" | "In Progress" | "Complete" | "Ready to Transfer" | "Archived";

export interface PreScreenCheck {
  checkId: string;
  label: string;
  answered: boolean;
  finding: string;
  answeredBy: string | null;
  answeredAt: string | null;
}

export interface OnboardingPolicy {
  policyId: string;
  name: string;
  category: string;
  dealerHasIt: boolean | null; // null = unanswered
  notes: string;
  answeredBy: string | null;
  answeredAt: string | null;
}

export interface CompletionStatus {
  allPreScreenChecksAnswered: boolean;
  allPoliciesAnswered: boolean;
  dealerDetailsComplete: boolean;
  onboardingComplete: boolean;
  completedBy: string | null;
  completedAt: string | null;
  readyToTransfer: boolean;
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
  preScreenChecks: Record<string, PreScreenCheck>;
  policies: OnboardingPolicy[];
  completionStatus: CompletionStatus;
  dndClear: boolean;
  platformDndClear: boolean;
  notes: string;
  history: HistoryEntry[];
}

// ── Pre-Screen Definitions ───────────────────────────────────

export const PRE_SCREEN_DEFS = [
  { key: "legalEntityStatus", id: "ps01", label: "Legal entity status — active/dissolved", guidance: "Confirm the company is active on Companies House, incorporation date, and that no dissolution or winding-up notice has been filed." },
  { key: "tradingNameAlignment", id: "ps02", label: "Trading name alignment — FCA, ICO, website", guidance: "Confirm the trading name used on the website and in promotional materials matches the FCA register and ICO registration." },
  { key: "directorsAndPSCs", id: "ps03", label: "Directors and PSCs — identities confirmed", guidance: "List all current directors and PSC(s). Note any changes in the last 24 months. Confirm identities are consistent across Companies House." },
  { key: "fcaAuthorisation", id: "ps04", label: "FCA authorisation / AR status confirmed", guidance: "Confirm FCA authorisation status (directly authorised or appointed representative). Note FCA reference number, AR principal if applicable, and relevant permissions." },
  { key: "sanctionsAndAml", id: "ps05", label: "Sanctions / AML / adverse media screening", guidance: "Confirm no sanctions hits against the company, directors or PSCs. Confirm no adverse media. Note PEP status of directors." },
  { key: "creditAndFinancialStanding", id: "ps06", label: "Financial standing — credit and CCJs", guidance: "Note CreditSafe or equivalent score. Confirm no CCJs on company record. Note most recent filed accounts and whether trading position appears solvent." },
  { key: "websiteAndMarketingCheck", id: "ps07", label: "Website and financial promotions review", guidance: "Review website for FCA-compliant financial promotions, APR display, risk warnings, and privacy/cookie compliance." },
  { key: "dndCheck", id: "ps08", label: "Do Not Deal — TCG platform and lender DND lists", guidance: "Check dealer against TCG platform DND list and the requesting lender's DND list. Note outcome." },
] as const;

// ── Builders ─────────────────────────────────────────────────

type FindingEntry = { finding: string; by: string; at: string };

function buildPreScreenChecks(
  answers: Partial<Record<string, FindingEntry>>
): Record<string, PreScreenCheck> {
  const checks: Record<string, PreScreenCheck> = {};
  for (const def of PRE_SCREEN_DEFS) {
    const a = answers[def.key];
    checks[def.key] = {
      checkId: def.id,
      label: def.label,
      answered: !!a,
      finding: a?.finding || "",
      answeredBy: a?.by || null,
      answeredAt: a?.at || null,
    };
  }
  return checks;
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
        policyId: p.id,
        name: p.name,
        category: p.category,
        dealerHasIt: a ? a.has : null,
        notes: a?.notes || "",
        answeredBy: a?.by || null,
        answeredAt: a?.at || null,
      };
    });
}

function buildCompletion(
  checks: Record<string, PreScreenCheck>,
  policies: OnboardingPolicy[],
  detailsComplete: boolean,
  completedBy?: string,
  completedAt?: string,
  readyToTransfer = false
): CompletionStatus {
  const allChecks = Object.values(checks).every((c) => c.answered);
  const allPolicies = policies.every((p) => p.dealerHasIt !== null);
  const complete = allChecks && allPolicies && detailsComplete;
  return {
    allPreScreenChecksAnswered: allChecks,
    allPoliciesAnswered: allPolicies,
    dealerDetailsComplete: detailsComplete,
    onboardingComplete: complete,
    completedBy: complete ? (completedBy || null) : null,
    completedAt: complete ? (completedAt || null) : null,
    readyToTransfer,
  };
}

// Shorthand for generating N answered policies from masterPolicyList
function quickPolicies(
  count: number,
  by: string,
  atBase: string,
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
      return {
        policyId: p.id, name: p.name, category: p.category,
        dealerHasIt: ovr.has, notes: ovr.notes,
        answeredBy: by, answeredAt: atBase,
      };
    }
    if (i < count) {
      return {
        policyId: p.id, name: p.name, category: p.category,
        dealerHasIt: true, notes: "Confirmed held.",
        answeredBy: by, answeredAt: atBase,
      };
    }
    return {
      policyId: p.id, name: p.name, category: p.category,
      dealerHasIt: null, notes: "",
      answeredBy: null, answeredAt: null,
    };
  });
}

// Full 8-check answers helper (all answered by same person)
function allChecksAnswered(by: string, atBase: string, overrides: Partial<Record<string, string>> = {}): Partial<Record<string, FindingEntry>> {
  const defaults: Record<string, string> = {
    legalEntityStatus: "Company confirmed active on Companies House. Directors and PSCs on record.",
    tradingNameAlignment: "Trading name consistent across FCA register, ICO and website.",
    directorsAndPSCs: "Directors identified and confirmed. No undisclosed changes in last 24 months.",
    fcaAuthorisation: "Confirmed directly authorised. Permissions include credit broking.",
    sanctionsAndAml: "No sanctions hits. No adverse media identified. PEP check clear.",
    creditAndFinancialStanding: "CreditSafe score acceptable. No CCJs on company record.",
    websiteAndMarketingCheck: "Website reviewed. APR visible on finance pages.",
    dndCheck: "Checked against TCG and lender DND lists. No matches found.",
  };
  const result: Partial<Record<string, FindingEntry>> = {};
  for (const def of PRE_SCREEN_DEFS) {
    result[def.key] = {
      finding: overrides[def.key] || defaults[def.key],
      by,
      at: atBase,
    };
  }
  return result;
}

// ── Seeder Applications ──────────────────────────────────────

const TG = "Tom Griffiths";
const AO = "Amara Osei";

// app001 — Stage 2 In Progress, 7/8 checks done, 18/22 policies
const app001checks = buildPreScreenChecks({
  ...allChecksAnswered(TG, "2026-02-18T10:15:00", {
    legalEntityStatus: "Company confirmed active on Companies House. Incorporated 14 Mar 2018. 2 directors, 1 PSC on record.",
    tradingNameAlignment: "Trading name 'Fordham Motors' consistent across FCA register, ICO and website homepage.",
    directorsAndPSCs: "Lee Fordham (Director / PSC) and Rachel Fordham (Director) identified. No undisclosed changes in last 24 months.",
    fcaAuthorisation: "Confirmed directly authorised under FCA ref 812344. Permissions include credit broking and insurance distribution.",
    sanctionsAndAml: "No sanctions hits. No adverse media identified. PEP check clear for both directors.",
    creditAndFinancialStanding: "CreditSafe score 74/100. No CCJs on company record. Filed accounts to Nov 2024 show solvent position.",
    dndCheck: "Checked against TCG platform DND list and Apex Motor Finance DND list. No matches found.",
  }),
  websiteAndMarketingCheck: undefined, // Not yet answered
});
// Remove the undefined entry
delete app001checks.websiteAndMarketingCheck;
const app001checksFixed = buildPreScreenChecks(
  (() => {
    const a = allChecksAnswered(TG, "2026-02-18T10:15:00", {
      legalEntityStatus: "Company confirmed active on Companies House. Incorporated 14 Mar 2018. 2 directors, 1 PSC on record.",
      tradingNameAlignment: "Trading name 'Fordham Motors' consistent across FCA register, ICO and website homepage.",
      directorsAndPSCs: "Lee Fordham (Director / PSC) and Rachel Fordham (Director) identified. No undisclosed changes in last 24 months.",
      fcaAuthorisation: "Confirmed directly authorised under FCA ref 812344. Permissions include credit broking and insurance distribution.",
      sanctionsAndAml: "No sanctions hits. No adverse media identified. PEP check clear for both directors.",
      creditAndFinancialStanding: "CreditSafe score 74/100. No CCJs on company record. Filed accounts to Nov 2024 show solvent position.",
      dndCheck: "Checked against TCG platform DND list and Apex Motor Finance DND list. No matches found.",
    });
    delete a.websiteAndMarketingCheck;
    return a;
  })()
);

export const seederApplications: OnboardingApplication[] = [
  // app001 — Stage 2, In Progress, 7/8 checks, 18/26 policies
  (() => {
    const checks = app001checksFixed;
    const pols = quickPolicies(18, TG, "2026-02-20T11:00:00");
    return {
      id: "app001", appRef: "APP-001-2026", stage: 2, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Fordham Motor Group Ltd", tradingName: "Fordham Motors",
      companiesHouseNo: "07391024", website: "https://www.fordhammotors.co.uk",
      primaryContact: { name: "Lee Fordham", email: "l.fordham@fordhammotors.co.uk", phone: "01443 882200" },
      registeredAddress: { street: "18 Station Road", town: "Pontypridd", county: "Rhondda Cynon Taf", postcode: "CF37 1PG" },
      distributeInsurance: true, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-18T09:00:00", assignedTo: TG,
      lastUpdated: "2026-02-24T14:30:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-07",
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Dealer has been responsive. Website check still outstanding. 18/26 policies confirmed.",
      history: [
        { date: "2026-02-18T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-18T10:50:00", action: "7 of 8 pre-screen checks completed — website check outstanding", user: TG },
        { date: "2026-02-20T14:00:00", action: "Stage 2 started — policy framework in progress", user: TG },
        { date: "2026-02-24T14:30:00", action: "Note added: Dealer chased re outstanding policies", user: TG },
      ],
    };
  })(),

  // app002 — Stage 2, In Progress, all checks, all policies
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(AO, "2026-02-16T09:00:00"));
    const pols = quickPolicies(22, AO, "2026-02-28T16:00:00", true);
    return {
      id: "app002", appRef: "APP-002-2026", stage: 2, status: "Complete" as OnboardingAppStatus,
      dealerName: "Kestrel Car Sales Ltd", tradingName: "Kestrel Cars",
      companiesHouseNo: "08124590", website: "https://www.kestrelcars.co.uk",
      primaryContact: { name: "Nina Shah", email: "n.shah@kestrelcars.co.uk", phone: "0117 946 1100" },
      registeredAddress: { street: "42 Queens Road", town: "Bristol", county: "Bristol", postcode: "BS8 1QU" },
      distributeInsurance: false, requestingLender: "l002", requestingLenderName: "Meridian Vehicle Finance Ltd",
      initiatedBy: AO, initiatedDate: "2026-02-15T11:00:00", assignedTo: AO,
      lastUpdated: "2026-02-28T16:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-05",
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true, AO, "2026-02-28T16:00:00"),
      dndClear: true, platformDndClear: true,
      notes: "All pre-screen checks and policies complete. Ready for review.",
      history: [
        { date: "2026-02-15T11:00:00", action: "Application created", user: AO },
        { date: "2026-02-16T09:00:00", action: "All 8 pre-screen checks completed", user: AO },
        { date: "2026-02-28T16:00:00", action: "All policies confirmed — onboarding complete", user: AO },
      ],
    };
  })(),

  // app003 — Complete and Ready to Transfer
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(TG, "2026-02-11T14:00:00"));
    const pols = quickPolicies(26, TG, "2026-02-25T16:00:00");
    return {
      id: "app003", appRef: "APP-003-2026", stage: 2, status: "Ready to Transfer" as OnboardingAppStatus,
      dealerName: "Highfield Motor Company", tradingName: "Highfield Motors",
      companiesHouseNo: "09451230", website: "https://www.highfieldmotors.co.uk",
      primaryContact: { name: "Richard Price", email: "r.price@highfieldmotors.co.uk", phone: "01633 882100" },
      registeredAddress: { street: "7 Caerleon Road", town: "Newport", county: "Gwent", postcode: "NP19 7BX" },
      distributeInsurance: true, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-10T08:30:00", assignedTo: TG,
      lastUpdated: "2026-03-01T10:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-04",
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true, TG, "2026-03-01T10:00:00", true),
      dndClear: true, platformDndClear: true,
      notes: "All sections verified. Marked as ready to transfer to lender.",
      history: [
        { date: "2026-02-10T08:30:00", action: "Application created", user: TG },
        { date: "2026-02-11T14:00:00", action: "All pre-screen checks completed", user: TG },
        { date: "2026-02-25T16:00:00", action: "All policies confirmed", user: TG },
        { date: "2026-03-01T10:00:00", action: "Marked as ready to transfer", user: TG },
      ],
    };
  })(),

  // app004 — Draft, nothing started
  (() => {
    const checks = buildPreScreenChecks({});
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, false),
      dndClear: true, platformDndClear: true,
      notes: "New application — not yet started",
      history: [{ date: "2026-03-03T08:00:00", action: "Application created by lender request", user: "System" }],
    };
  })(),

  // app005 — Stage 1, In Progress, 2/8 checks answered
  (() => {
    const checks = buildPreScreenChecks({
      legalEntityStatus: { finding: "Company confirmed active. Incorporated 2015. 1 director, 1 PSC.", by: AO, at: "2026-03-03T11:00:00" },
      tradingNameAlignment: { finding: "Trading name consistent across FCA and website.", by: AO, at: "2026-03-03T11:15:00" },
    });
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Pre-screen checks in progress — 2 of 8 completed",
      history: [
        { date: "2026-03-01T10:00:00", action: "Application created", user: AO },
        { date: "2026-03-03T11:00:00", action: "2 pre-screen checks completed", user: AO },
      ],
    };
  })(),

  // app006 — Stage 2, In Progress, all checks, 14/22 policies
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(TG, "2026-02-13T11:00:00"));
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Missing AML and GDPR policies — chasing dealer",
      history: [
        { date: "2026-02-12T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-13T11:00:00", action: "All pre-screen checks completed", user: TG },
        { date: "2026-03-02T15:00:00", action: "Chased dealer for outstanding policies", user: TG },
      ],
    };
  })(),

  // app007 — Complete
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(AO, "2026-02-06T10:00:00"));
    const pols = quickPolicies(22, AO, "2026-02-20T14:00:00", true);
    return {
      id: "app007", appRef: "APP-007-2026", stage: 3, status: "Complete" as OnboardingAppStatus,
      dealerName: "Sterling Park Autos", tradingName: "Sterling Park",
      companiesHouseNo: "11234567", website: "https://www.sterlingparkautos.co.uk",
      primaryContact: { name: "Gareth Lloyd", email: "g.lloyd@sterlingpark.co.uk", phone: "029 2047 1100" },
      registeredAddress: { street: "3 Cathedral Road", town: "Cardiff", county: "South Glamorgan", postcode: "CF11 9HA" },
      distributeInsurance: false, requestingLender: "l002", requestingLenderName: "Meridian Vehicle Finance Ltd",
      initiatedBy: AO, initiatedDate: "2026-02-05T08:00:00", assignedTo: AO,
      lastUpdated: "2026-03-01T09:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-05",
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true, AO, "2026-03-01T09:00:00"),
      dndClear: true, platformDndClear: true,
      notes: "Full pack received — all information gathered",
      history: [
        { date: "2026-02-05T08:00:00", action: "Application created", user: AO },
        { date: "2026-02-06T10:00:00", action: "All pre-screen checks completed", user: AO },
        { date: "2026-02-20T14:00:00", action: "All policies confirmed", user: AO },
        { date: "2026-03-01T09:00:00", action: "Onboarding marked complete", user: AO },
      ],
    };
  })(),

  // app008 — Stage 1, In Progress, 5/8 checks (some with concerning findings)
  (() => {
    const checks = buildPreScreenChecks({
      legalEntityStatus: { finding: "Company active. Incorporated 2012. 2 directors.", by: TG, at: "2026-02-25T09:30:00" },
      tradingNameAlignment: { finding: "Trading name consistent.", by: TG, at: "2026-02-25T09:35:00" },
      directorsAndPSCs: { finding: "Paul Simmons (Director/PSC) and Mary Simmons (Director). No changes in 24 months.", by: TG, at: "2026-02-25T09:40:00" },
      fcaAuthorisation: { finding: "FCA permissions unclear — need to confirm scope of credit broking permission. Follow-up call arranged.", by: TG, at: "2026-03-02T10:00:00" },
      sanctionsAndAml: { finding: "Director surname match flagged on sanctions screening. Manual review confirms false positive — common surname.", by: TG, at: "2026-03-02T10:30:00" },
    });
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "FCA permissions need confirming. Sanctions flag was false positive.",
      history: [
        { date: "2026-02-25T09:00:00", action: "Application created", user: TG },
        { date: "2026-03-02T10:00:00", action: "5 pre-screen checks completed — FCA and sanctions findings recorded", user: TG },
      ],
    };
  })(),

  // app009 — Draft
  (() => {
    const checks = buildPreScreenChecks({});
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, false),
      dndClear: true, platformDndClear: true,
      notes: "Lender requested this morning",
      history: [{ date: "2026-03-04T08:00:00", action: "Application created by lender request", user: "System" }],
    };
  })(),

  // app010 — Stage 2, In Progress, all checks, 20/22 policies
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(AO, "2026-02-15T14:00:00"));
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "One insurance policy outstanding",
      history: [
        { date: "2026-02-14T10:00:00", action: "Application created", user: AO },
        { date: "2026-02-15T14:00:00", action: "All pre-screen checks completed", user: AO },
        { date: "2026-03-03T14:00:00", action: "20/22 policies confirmed — 1 insurance doc outstanding", user: AO },
      ],
    };
  })(),

  // app011 — Complete
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(TG, "2026-02-04T11:00:00"));
    const pols = quickPolicies(26, TG, "2026-02-22T15:00:00");
    return {
      id: "app011", appRef: "APP-011-2026", stage: 3, status: "Complete" as OnboardingAppStatus,
      dealerName: "Crown Garage (Newport) Ltd", tradingName: "Crown Garage",
      companiesHouseNo: "07654321", website: "https://www.crowngarage.co.uk",
      primaryContact: { name: "Alun Davies", email: "a.davies@crowngarage.co.uk", phone: "01633 221100" },
      registeredAddress: { street: "15 Commercial Street", town: "Newport", county: "Gwent", postcode: "NP20 1LR" },
      distributeInsurance: true, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-03T09:00:00", assignedTo: TG,
      lastUpdated: "2026-03-02T16:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-05",
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true, TG, "2026-03-02T16:00:00"),
      dndClear: true, platformDndClear: true,
      notes: "All clear — onboarding complete",
      history: [
        { date: "2026-02-03T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-04T11:00:00", action: "All pre-screen checks completed", user: TG },
        { date: "2026-02-22T15:00:00", action: "All policies confirmed", user: TG },
        { date: "2026-03-02T16:00:00", action: "Onboarding marked complete", user: TG },
      ],
    };
  })(),

  // app012 — Stage 1, In Progress (was Rejected — FCA lapsed, now just a finding)
  (() => {
    const checks = buildPreScreenChecks({
      legalEntityStatus: { finding: "Company active on Companies House.", by: TG, at: "2026-02-12T10:00:00" },
      fcaAuthorisation: { finding: "FCA authorisation LAPSED — firm no longer authorised as of Jan 2026. Cannot proceed until resolved.", by: TG, at: "2026-02-12T10:30:00" },
    });
    const pols = quickPolicies(0, "", "", true);
    return {
      id: "app012", appRef: "APP-012-2026", stage: 1, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Apex Road Autos", tradingName: "Apex Road",
      companiesHouseNo: "06543210", website: "https://www.apexroadautos.co.uk",
      primaryContact: { name: "Dean Walker", email: "d.walker@apexroad.co.uk", phone: "01onal 332200" },
      registeredAddress: { street: "44 Ring Road", town: "Leeds", county: "West Yorkshire", postcode: "LS12 1BE" },
      distributeInsurance: false, requestingLender: "l002", requestingLenderName: "Meridian Vehicle Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-10T09:00:00", assignedTo: TG,
      lastUpdated: "2026-02-20T14:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-01",
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "FCA authorisation lapsed — cannot proceed. Finding recorded for lender visibility.",
      history: [
        { date: "2026-02-10T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-12T10:00:00", action: "FCA check — authorisation lapsed. Finding recorded.", user: TG },
        { date: "2026-02-20T14:00:00", action: "Note: Lender informed of FCA status", user: TG },
      ],
    };
  })(),

  // app013 — Stage 2, In Progress, all checks, 16/22 policies
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(AO, "2026-02-18T14:00:00"));
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Waiting on T&C policy and BCP",
      history: [
        { date: "2026-02-17T09:00:00", action: "Application created", user: AO },
        { date: "2026-02-18T14:00:00", action: "All pre-screen checks completed", user: AO },
        { date: "2026-03-03T09:00:00", action: "16/22 policies confirmed — chasing T&C and BCP", user: AO },
      ],
    };
  })(),

  // app014 — Draft
  (() => {
    const checks = buildPreScreenChecks({});
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, false),
      dndClear: true, platformDndClear: true,
      notes: "Awaiting Companies House number from lender",
      history: [{ date: "2026-03-02T08:00:00", action: "Application created by lender request", user: "System" }],
    };
  })(),

  // app015 — Stage 2, In Progress, all checks, 19/26 policies
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(TG, "2026-02-12T11:00:00"));
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Near complete — chasing 2 docs",
      history: [
        { date: "2026-02-11T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-12T11:00:00", action: "All pre-screen checks completed", user: TG },
        { date: "2026-03-03T16:00:00", action: "19/26 policies confirmed — 2 final policies being chased", user: TG },
      ],
    };
  })(),

  // app016 — Stage 1, In Progress, 6/8 checks (financial standing finding)
  (() => {
    const partial = allChecksAnswered(AO, "2026-03-03T12:00:00", {
      creditAndFinancialStanding: "CreditSafe score 48/100. Below typical threshold. No CCJs but thin credit file. Lender should be aware.",
    });
    delete partial.websiteAndMarketingCheck;
    delete partial.dndCheck;
    const checks = buildPreScreenChecks(partial);
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "CreditSafe score 48 — finding recorded for lender awareness",
      history: [
        { date: "2026-02-28T10:00:00", action: "Application created", user: AO },
        { date: "2026-03-03T12:00:00", action: "6 pre-screen checks completed — financial standing finding recorded", user: AO },
      ],
    };
  })(),

  // app017 — Complete
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(TG, "2026-02-02T14:00:00"));
    const pols = quickPolicies(26, TG, "2026-02-20T16:00:00");
    return {
      id: "app017", appRef: "APP-017-2026", stage: 3, status: "Complete" as OnboardingAppStatus,
      dealerName: "Pennfield Cars Ltd", tradingName: "Pennfield Cars",
      companiesHouseNo: "08901234", website: "https://www.pennfieldcars.co.uk",
      primaryContact: { name: "David Rees", email: "d.rees@pennfield.co.uk", phone: "01792 445500" },
      registeredAddress: { street: "33 Wind Street", town: "Swansea", county: "West Glamorgan", postcode: "SA1 1DY" },
      distributeInsurance: true, requestingLender: "l002", requestingLenderName: "Meridian Vehicle Finance Ltd",
      initiatedBy: TG, initiatedDate: "2026-02-01T09:00:00", assignedTo: TG,
      lastUpdated: "2026-03-01T15:00:00", lastUpdatedBy: TG, targetCompletionDate: "2026-03-04",
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true, TG, "2026-03-01T15:00:00"),
      dndClear: true, platformDndClear: true,
      notes: "Insurance products confirmed — all information gathered",
      history: [
        { date: "2026-02-01T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-02T14:00:00", action: "All pre-screen checks completed", user: TG },
        { date: "2026-02-20T16:00:00", action: "All policies confirmed", user: TG },
        { date: "2026-03-01T15:00:00", action: "Onboarding marked complete", user: TG },
      ],
    };
  })(),

  // app018 — Stage 2, In Progress, all checks, 12/22 policies
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(AO, "2026-02-20T14:00:00"));
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Slow to respond — chased twice",
      history: [
        { date: "2026-02-19T09:00:00", action: "Application created", user: AO },
        { date: "2026-02-20T14:00:00", action: "All pre-screen checks completed", user: AO },
        { date: "2026-02-28T09:00:00", action: "First chase sent", user: AO },
        { date: "2026-03-03T10:00:00", action: "Second chase sent — 12/22 policies complete", user: AO },
      ],
    };
  })(),

  // app019 — Draft
  (() => {
    const checks = buildPreScreenChecks({});
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, false),
      dndClear: true, platformDndClear: true,
      notes: "Just created",
      history: [{ date: "2026-03-04T07:00:00", action: "Application created", user: "System" }],
    };
  })(),

  // app020 — Stage 2, In Progress, all checks, 21/26 policies
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(TG, "2026-02-09T11:00:00"));
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "Final policy docs arriving tomorrow",
      history: [
        { date: "2026-02-08T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-09T11:00:00", action: "All pre-screen checks completed", user: TG },
        { date: "2026-03-03T17:00:00", action: "21/26 policies confirmed — final docs expected", user: TG },
      ],
    };
  })(),

  // app021 — Stage 1, all checks done, policies not started
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(AO, "2026-03-04T09:00:00"));
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "All pre-screen checks complete — moving to policies",
      history: [
        { date: "2026-02-26T10:00:00", action: "Application created", user: AO },
        { date: "2026-03-04T09:00:00", action: "All pre-screen checks completed", user: AO },
      ],
    };
  })(),

  // app022 — Stage 1, In Progress (was Rejected — sanctions, now just a finding)
  (() => {
    const checks = buildPreScreenChecks({
      legalEntityStatus: { finding: "Company active.", by: AO, at: "2026-02-14T10:00:00" },
      tradingNameAlignment: { finding: "Names consistent.", by: AO, at: "2026-02-14T10:10:00" },
      directorsAndPSCs: { finding: "Brian Cole (sole director/PSC).", by: AO, at: "2026-02-14T10:15:00" },
      fcaAuthorisation: { finding: "Authorised. Permissions correct.", by: AO, at: "2026-02-14T10:20:00" },
      sanctionsAndAml: { finding: "SANCTIONS FLAG CONFIRMED — Director Brian Cole appears on OFSI consolidated list. Verified match. This finding has been escalated to the requesting lender.", by: AO, at: "2026-02-16T10:00:00" },
    });
    const pols = quickPolicies(0, "", "", true);
    return {
      id: "app022", appRef: "APP-022-2026", stage: 1, status: "In Progress" as OnboardingAppStatus,
      dealerName: "Clearway Cars Ltd", tradingName: "Clearway Cars",
      companiesHouseNo: "09012345", website: "https://www.clearwaycars.co.uk",
      primaryContact: { name: "Brian Cole", email: "b.cole@clearway.co.uk", phone: "020 7946 8800" },
      registeredAddress: { street: "77 Old Kent Road", town: "London", county: "Greater London", postcode: "SE1 5TY" },
      distributeInsurance: false, requestingLender: "l001", requestingLenderName: "Apex Motor Finance Ltd",
      initiatedBy: AO, initiatedDate: "2026-02-14T09:00:00", assignedTo: AO,
      lastUpdated: "2026-02-22T11:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-01",
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: false, platformDndClear: true,
      notes: "Director sanctions flag confirmed — finding recorded for lender",
      history: [
        { date: "2026-02-14T09:00:00", action: "Application created", user: AO },
        { date: "2026-02-16T10:00:00", action: "Sanctions flag confirmed on director — finding recorded", user: AO },
        { date: "2026-02-22T11:00:00", action: "Lender notified of sanctions finding", user: AO },
      ],
    };
  })(),

  // app023 — Stage 2, In Progress, all checks, 15/22 policies
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(TG, "2026-02-14T11:00:00"));
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "No insurance products — 22 policies applicable. 15 confirmed.",
      history: [
        { date: "2026-02-13T09:00:00", action: "Application created", user: TG },
        { date: "2026-02-14T11:00:00", action: "All pre-screen checks completed", user: TG },
        { date: "2026-03-03T13:00:00", action: "15/22 policies confirmed", user: TG },
      ],
    };
  })(),

  // app024 — Complete, Ready to Transfer
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(AO, "2026-02-05T11:00:00"));
    const pols = quickPolicies(26, AO, "2026-02-24T16:00:00");
    return {
      id: "app024", appRef: "APP-024-2026", stage: 3, status: "Ready to Transfer" as OnboardingAppStatus,
      dealerName: "Elmfield Motor Company", tradingName: "Elmfield Motors",
      companiesHouseNo: "08567890", website: "https://www.elmfieldmotors.co.uk",
      primaryContact: { name: "Rachel Hughes", email: "r.hughes@elmfield.co.uk", phone: "01onal 443300" },
      registeredAddress: { street: "21 Elm Avenue", town: "Cheltenham", county: "Gloucestershire", postcode: "GL50 2QE" },
      distributeInsurance: true, requestingLender: "l003", requestingLenderName: "Broadstone Motor Credit Plc",
      initiatedBy: AO, initiatedDate: "2026-02-04T09:00:00", assignedTo: AO,
      lastUpdated: "2026-03-02T14:00:00", lastUpdatedBy: AO, targetCompletionDate: "2026-03-05",
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true, AO, "2026-03-02T14:00:00", true),
      dndClear: true, platformDndClear: true,
      notes: "All sections complete. Marked ready to transfer.",
      history: [
        { date: "2026-02-04T09:00:00", action: "Application created", user: AO },
        { date: "2026-02-05T11:00:00", action: "All pre-screen checks completed", user: AO },
        { date: "2026-02-24T16:00:00", action: "All policies confirmed", user: AO },
        { date: "2026-03-02T14:00:00", action: "Marked as ready to transfer", user: AO },
      ],
    };
  })(),

  // app025 — Stage 2, In Progress, all checks, 10/22 policies
  (() => {
    const checks = buildPreScreenChecks(allChecksAnswered(TG, "2026-03-02T10:00:00"));
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
      preScreenChecks: checks, policies: pols,
      completionStatus: buildCompletion(checks, pols, true),
      dndClear: true, platformDndClear: true,
      notes: "New instruction this week — early stage policies",
      history: [
        { date: "2026-03-01T09:00:00", action: "Application created", user: TG },
        { date: "2026-03-02T10:00:00", action: "All pre-screen checks completed", user: TG },
        { date: "2026-03-04T08:00:00", action: "10/22 policies confirmed", user: TG },
      ],
    };
  })(),
];

// ── Stats helper ─────────────────────────────────────────────

export function getOnboardingStats(apps: OnboardingApplication[]) {
  const active = apps.filter((a) => a.status !== "Complete" && a.status !== "Ready to Transfer");
  const totalPolicies = apps.reduce((s, a) => s + a.policies.length, 0);
  const answeredPolicies = apps.reduce((s, a) => s + a.policies.filter((p) => p.dealerHasIt !== null).length, 0);
  return {
    total: apps.length,
    drafts: apps.filter((a) => a.status === "Draft").length,
    inProgress: apps.filter((a) => a.status === "In Progress").length,
    complete: apps.filter((a) => a.status === "Complete").length,
    readyToTransfer: apps.filter((a) => a.status === "Ready to Transfer").length,
    avgPolicyCompletion: totalPolicies > 0 ? Math.round((answeredPolicies / totalPolicies) * 100) : 0,
    unassigned: apps.filter((a) => a.assignedTo === "Unassigned").length,
  };
}
