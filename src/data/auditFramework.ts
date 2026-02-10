import { RagStatus } from "./dealers";

// Control check types matching the real audit document framework
export interface ControlCheck {
  id: string;
  controlArea: string;
  objective: string;
  sourceMethod: string;
  evidence: string;
  result: "pass" | "fail" | "partial";
  frequency: string;
  riskRating: RagStatus;
  comments: string;
  automated: boolean;
}

export interface AuditSection {
  id: string;
  name: string;
  icon: string;
  controls: ControlCheck[];
  summary: {
    green: number;
    amber: number;
    red: number;
    ragStatus: RagStatus;
    notes: string;
  };
}

export interface KeyAction {
  id: string;
  section: string;
  action: string;
  priority: "High" | "Medium" | "Low";
  owner: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Planned" | "Complete" | "BAU" | "Optional";
  notes: string;
}

export interface SentimentCategory {
  label: string;
  score: number;
  trend: number;
}

export interface DealerAudit {
  dealerName: string;
  overallRag: RagStatus;
  overallScore: number;
  customerSentimentScore: number;
  customerSentimentTrend: number;
  sentimentCategories: SentimentCategory[];
  lastAuditDate: string;
  sections: AuditSection[];
  keyActions: KeyAction[];
  firmType: "AR" | "DA";
  assuranceStatement: string;
}

// 9 section definitions matching real audit framework (with Digital & Reporting added)
export const AUDIT_SECTIONS = [
  { id: "governance", name: "Corporate Governance", icon: "Building2" },
  { id: "digital-reporting", name: "Digital & Reporting", icon: "Monitor" },
  { id: "permissions", name: "Permissions", icon: "ShieldCheck" },
  { id: "sales", name: "Sales Process", icon: "Receipt" },
  { id: "consumer-duty", name: "Consumer Duty", icon: "Users" },
  { id: "financial-crime", name: "Financial Crime / Fraud", icon: "AlertTriangle" },
  { id: "financial-promotions", name: "Financial Promotions", icon: "Megaphone" },
  { id: "communications", name: "Communications & Complaints", icon: "MessageSquare" },
  { id: "conduct", name: "Conduct Oversight", icon: "Eye" },
] as const;

// ─── Control generators ────────────────────────────────────

function generateGovernanceControls(dealerIndex: number): ControlCheck[] {
  const seed = dealerIndex * 7;
  return [
    {
      id: "gov-1",
      controlArea: "Legal Entity Status",
      objective: "Confirm the entity is valid and operational",
      sourceMethod: "Companies House API Lookup",
      evidence: "Extract from registry",
      result: "pass",
      frequency: "Quarterly",
      riskRating: "green",
      comments: "All correct and verified via Co House look up",
      automated: true,
    },
    {
      id: "gov-2",
      controlArea: "Entity/Trading Names Alignment",
      objective: "Confirm consistency of trading identity (FCA, ICO, website)",
      sourceMethod: "Hybrid (Web scan + Manual confirm)",
      evidence: "Screenshots & Registry Records",
      result: seed % 5 === 0 ? "partial" : "pass",
      frequency: "Quarterly",
      riskRating: seed % 5 === 0 ? "amber" : "green",
      comments: seed % 5 === 0 ? "Minor discrepancy in trading name on ICO register" : "FCA & ICO confirmed; names aligned",
      automated: false,
    },
    {
      id: "gov-3",
      controlArea: "Directors / PSCs Change History",
      objective: "Confirm governance structure stability",
      sourceMethod: "API Lookup",
      evidence: "PSC Change Log",
      result: "pass",
      frequency: "Biannual",
      riskRating: "green",
      comments: "Enables trigger-based enhanced checks via CreditSafe",
      automated: true,
    },
    {
      id: "gov-4",
      controlArea: "Adverse Media / Sanctions / PEP Screening",
      objective: "Identify potential compliance risks for directors & controllers",
      sourceMethod: "Screening Service",
      evidence: "Report & Case Notes",
      result: seed % 8 === 0 ? "fail" : "pass",
      frequency: "Continuous / Quarterly Review",
      riskRating: seed % 8 === 0 ? "red" : "green",
      comments: seed % 8 === 0 ? "High lender concern – adverse media flag requires review" : "No adverse findings; CreditSafe checks completed",
      automated: true,
    },
    {
      id: "gov-5",
      controlArea: "Declaration of Sanctions / DBS",
      objective: "Confirm no undisclosed sanctions",
      sourceMethod: "Signed Attestation Declaration",
      evidence: "Onboarding + Annual",
      result: "pass",
      frequency: "Annual",
      riskRating: "green",
      comments: "Self-declaration received; DBS status confirmed",
      automated: false,
    },
  ];
}

function generateDigitalReportingControls(dealerIndex: number): ControlCheck[] {
  const seed = dealerIndex * 41;
  return [
    {
      id: "digital-1",
      controlArea: "MI Dashboard & Reporting",
      objective: "Ensure management information is accurate and timely",
      sourceMethod: "System Review",
      evidence: "MI Pack + Dashboard Screenshots",
      result: seed % 7 === 0 ? "partial" : "pass",
      frequency: "Monthly",
      riskRating: seed % 7 === 0 ? "amber" : "green",
      comments: seed % 7 === 0 ? "MI pack delayed by 5 days; needs process tightening" : "Mostly effective reporting; continue to monitor",
      automated: true,
    },
    {
      id: "digital-2",
      controlArea: "Data Quality & Integrity",
      objective: "Verify data accuracy across systems",
      sourceMethod: "Reconciliation checks",
      evidence: "Reconciliation report",
      result: "pass",
      frequency: "Quarterly",
      riskRating: "green",
      comments: "Data reconciliation within tolerance; no escalation required",
      automated: true,
    },
  ];
}

function generatePermissionsControls(dealerIndex: number): ControlCheck[] {
  const seed = dealerIndex * 11;
  return [
    {
      id: "perm-1",
      controlArea: "FCA Authorisation & Permissions",
      objective: "Verify authorisation status including AR status",
      sourceMethod: "FCA Register API Lookup",
      evidence: "FCA register snapshot",
      result: seed % 12 === 0 ? "fail" : "pass",
      frequency: "Quarterly + Alert",
      riskRating: seed % 12 === 0 ? "red" : "green",
      comments: seed % 12 === 0 ? "AR status verification required – register discrepancy" : "Register checked, correct status; self-declaration on permissions",
      automated: true,
    },
    {
      id: "perm-2",
      controlArea: "Competence Training Matrix (SAF + Lender-specific)",
      objective: "Ensure staff have required knowledge and training",
      sourceMethod: "Training Records Review",
      evidence: "Certificates verified; Upload & Sampling",
      result: seed % 4 === 0 ? "partial" : "pass",
      frequency: "Annual",
      riskRating: seed % 4 === 0 ? "amber" : "green",
      comments: seed % 4 === 0 ? "2 staff overdue for refresher training on Klassify" : "All training current; certificates verified",
      automated: false,
    },
    {
      id: "perm-3",
      controlArea: "SMF Allocation for Oversight",
      objective: "Ensure clear responsibility and oversight touchpoints",
      sourceMethod: "Org Chart + FCA API check",
      evidence: "SMF Attestation + Org chart",
      result: "pass",
      frequency: "Annual + Alert",
      riskRating: "green",
      comments: "No SMF required for ARs; clear oversight structure documented",
      automated: false,
    },
    {
      id: "perm-4",
      controlArea: "Trading Names Cross-Reference",
      objective: "Match Companies House, FCA, and website identity",
      sourceMethod: "Cross-check validation",
      evidence: "Comparison report",
      result: seed % 6 === 0 ? "partial" : "pass",
      frequency: "Annual",
      riskRating: seed % 6 === 0 ? "amber" : "green",
      comments: seed % 6 === 0 ? "Website trading name needs updating to match FCA register" : "All names aligned; partial automation reduces manual effort",
      automated: true,
    },
  ];
}

function generateSalesControls(dealerIndex: number): ControlCheck[] {
  const seed = dealerIndex * 13;
  return [
    {
      id: "sales-1",
      controlArea: "Pre-contract Disclosure",
      objective: "Ensure IDD and disclosure provided before agreement",
      sourceMethod: "API / iVendi Assurance via Klassify",
      evidence: "Event log + documents checked",
      result: seed % 9 === 0 ? "fail" : "pass",
      frequency: "Per Application",
      riskRating: seed % 9 === 0 ? "red" : "green",
      comments: seed % 9 === 0 ? "Missing IDD identified for finance deal – remediation required" : "All disclosures timestamped and logged via Klassify",
      automated: true,
    },
    {
      id: "sales-2",
      controlArea: "Demands & Needs Statement",
      objective: "Ensure D&N completed for all finance customers",
      sourceMethod: "API / iVendi Assurance",
      evidence: "D&N document trail",
      result: seed % 7 === 0 ? "fail" : "pass",
      frequency: "Per Application",
      riskRating: seed % 7 === 0 ? "red" : "green",
      comments: seed % 7 === 0 ? "Missing Demands & Needs Statement – should be completed prior to pay out" : "D&N sent to customer for review prior to payout",
      automated: true,
    },
    {
      id: "sales-3",
      controlArea: "Affordability / Eligibility Checks",
      objective: "Verify customer can afford product per lender policy",
      sourceMethod: "API / iVendi Assurance",
      evidence: "Decisioning trace + policy map",
      result: seed % 11 === 0 ? "partial" : "pass",
      frequency: "Per Application",
      riskRating: seed % 11 === 0 ? "amber" : "green",
      comments: seed % 11 === 0 ? "Some manual overrides noted; TCG Access system review required" : "Automated checks passing; manual checks for ARs evidenced",
      automated: true,
    },
  ];
}

function generateConsumerDutyControls(dealerIndex: number): ControlCheck[] {
  const seed = dealerIndex * 17;
  return [
    {
      id: "duty-1",
      controlArea: "Fair Value Benchmarking",
      objective: "APR vs aggregated iVendi benchmark comparison",
      sourceMethod: "iVendi Analytics",
      evidence: "Benchmark report + outlier list",
      result: seed % 5 === 0 ? "fail" : "pass",
      frequency: "Quarterly",
      riskRating: seed % 5 === 0 ? "red" : "green",
      comments: seed % 5 === 0 ? "APR outliers detected; visible through the finance proposal" : "Within benchmark range; no outliers identified",
      automated: true,
    },
    {
      id: "duty-2",
      controlArea: "Products and Services Review",
      objective: "Confirm products meet FCA Consumer Duty standards",
      sourceMethod: "Product review / iVendi + Klassify",
      evidence: "Survey results, Measures",
      result: seed % 6 === 0 ? "partial" : "pass",
      frequency: "Quarterly",
      riskRating: seed % 6 === 0 ? "amber" : "green",
      comments: seed % 6 === 0 ? "Partial product selection reviewed; automation reduces manual effort" : "All products compliant; Klassify system used",
      automated: false,
    },
    {
      id: "duty-3",
      controlArea: "Consumer Understanding",
      objective: "Assess whether consumers understand products, terms, and obligations",
      sourceMethod: "Customer communications / test campaign",
      evidence: "Call monitoring reports, Trustpilot, Google reviews",
      result: "pass",
      frequency: "Quarterly",
      riskRating: "green",
      comments: "Customer comprehension verified through call monitoring and review analysis",
      automated: false,
    },
    {
      id: "duty-4",
      controlArea: "Consumer Support & Complaint Handling",
      objective: "Assess effectiveness of customer support and complaint resolution",
      sourceMethod: "Call logs, complaint reports, SQ, Withdrawals and CSS",
      evidence: "Complaint records, resolution logs",
      result: seed % 4 === 0 ? "partial" : "pass",
      frequency: "Monthly",
      riskRating: seed % 4 === 0 ? "amber" : "green",
      comments: seed % 4 === 0 ? "Response times need improvement; recent 1-star reviews noted" : "No complaints outstanding; sentiment positive",
      automated: false,
    },
    {
      id: "duty-5",
      controlArea: "Vulnerability Identification & Treatment",
      objective: "Identify and treat vulnerable customers appropriately",
      sourceMethod: "iVendi Flags + application checks + file note reviews",
      evidence: "Flags + file notes; all VC logged on Klassify",
      result: "pass",
      frequency: "Per Application",
      riskRating: "green",
      comments: "Vulnerability flags active; all cases logged on Klassify",
      automated: true,
    },
  ];
}

function generateFinancialCrimeControls(dealerIndex: number): ControlCheck[] {
  const seed = dealerIndex * 19;
  return [
    {
      id: "crime-1",
      controlArea: "KYC / IDV Completion",
      objective: "Identity verification for each applicant",
      sourceMethod: "Vendor API result",
      evidence: "Pass/fail + reason codes",
      result: "pass",
      frequency: "Per Application",
      riskRating: "green",
      comments: "Ensures identity verification is performed; critical for regulatory compliance and reducing fraud risk",
      automated: true,
    },
    {
      id: "crime-2",
      controlArea: "Sanctions / PEP Screening at Application",
      objective: "Screen against sanctions lists at point of application",
      sourceMethod: "Service Vendor",
      evidence: "Screening review",
      result: "pass",
      frequency: "Per Application",
      riskRating: "green",
      comments: "Eliminates manual review duplication; all clear",
      automated: true,
    },
    {
      id: "crime-3",
      controlArea: "Device/IP Geolocation Anomaly",
      objective: "Detect fraud patterns via telemetry",
      sourceMethod: "Telemetry analytics via KYC",
      evidence: "Anomaly flag + score",
      result: seed % 10 === 0 ? "partial" : "pass",
      frequency: "Per Application",
      riskRating: seed % 10 === 0 ? "amber" : "green",
      comments: seed % 10 === 0 ? "Some anomalies flagged for review" : "Addresses emerging fraud patterns; NA on AR",
      automated: true,
    },
    {
      id: "crime-4",
      controlArea: "Velocity / Patterning",
      objective: "Detect multiple apps per customer/device/email",
      sourceMethod: "iVendi Analytics",
      evidence: "Velocity score",
      result: "pass",
      frequency: "Per Application + Daily Cohort",
      riskRating: "green",
      comments: "Lender assurance beyond SUP; velocity within normal range",
      automated: true,
    },
    {
      id: "crime-5",
      controlArea: "Bank Detail / Payout Mismatch",
      objective: "Detect payout fraud risk from lender data",
      sourceMethod: "From Lender",
      evidence: "Mismatch log",
      result: seed % 15 === 0 ? "fail" : "pass",
      frequency: "Triggered",
      riskRating: seed % 15 === 0 ? "red" : "green",
      comments: seed % 15 === 0 ? "Mismatch detected – investigation required" : "Key payout risk control; not applicable for AR",
      automated: true,
    },
  ];
}

function generateFinancialPromotionsControls(dealerIndex: number): ControlCheck[] {
  const seed = dealerIndex * 23;
  return [
    {
      id: "promo-1",
      controlArea: "Website Financial Promotions",
      objective: "Ensure promotions are clear, fair, not misleading",
      sourceMethod: "TCG / Sedric Web Scan",
      evidence: "Scan report + screenshots",
      result: seed % 3 === 0 ? "partial" : "pass",
      frequency: "Risk Based",
      riskRating: seed % 3 === 0 ? "amber" : "green",
      comments: seed % 3 === 0 ? "Missing representative APR on website where finance is incentivised" : "Compliant promotions; Sedric automated checks confirm",
      automated: true,
    },
    {
      id: "promo-2",
      controlArea: "Privacy Policy & Cookie Management",
      objective: "Verify GDPR compliance and cookie consent",
      sourceMethod: "Website Review",
      evidence: "Policy documents",
      result: "pass",
      frequency: "Annual",
      riskRating: "green",
      comments: "Policies up to date; cookie management compliant",
      automated: false,
    },
    {
      id: "promo-3",
      controlArea: "Social Media Monitoring",
      objective: "Monitor for non-compliant financial promotion posts",
      sourceMethod: "Feed monitor + manual confirm via Sedric",
      evidence: "Posts archive",
      result: seed % 4 === 0 ? "partial" : "pass",
      frequency: "Risk Based",
      riskRating: seed % 4 === 0 ? "amber" : "green",
      comments: seed % 4 === 0 ? "Missing representative APR on social media channels where finance is incentivised" : "Social content compliant; Sedric automated monitoring",
      automated: true,
    },
  ];
}

function generateCommunicationsControls(dealerIndex: number): ControlCheck[] {
  const seed = dealerIndex * 29;
  return [
    {
      id: "comms-1",
      controlArea: "Alternative Channels Monitoring",
      objective: "Ensure WhatsApp/SMS/Phone communications monitored & retained",
      sourceMethod: "Policy review + sampling",
      evidence: "Majority comms logs via Klassify; pre-delivery checklist",
      result: seed % 4 === 0 ? "partial" : "pass",
      frequency: "Monthly",
      riskRating: seed % 4 === 0 ? "amber" : "green",
      comments: seed % 4 === 0 ? "Sampling gaps in invoice & warranty document retention" : "Channels monitored; readability for lenders confirmed",
      automated: false,
    },
    {
      id: "comms-2",
      controlArea: "Complaints Benchmarking vs CSS",
      objective: "Compare complaint volume vs customer sentiment score",
      sourceMethod: "Data reconciliation via Klassify MI",
      evidence: "MI pack + Customer Sentiment score",
      result: seed % 3 === 0 ? "fail" : "pass",
      frequency: "Monthly",
      riskRating: seed % 3 === 0 ? "red" : "green",
      comments: seed % 3 === 0 ? "Complaint ratio above threshold; Google reviews showing negative trend" : "Within acceptable range; no complaints outstanding",
      automated: true,
    },
    {
      id: "comms-3",
      controlArea: "Root Cause Analysis & Remediation",
      objective: "Track and address complaint root causes; harm prevention",
      sourceMethod: "Policy Based",
      evidence: "RCA managed register",
      result: seed % 5 === 0 ? "fail" : "pass",
      frequency: "Monthly",
      riskRating: seed % 5 === 0 ? "red" : "green",
      comments: seed % 5 === 0 ? "RCA register incomplete; addresses harm prevention" : "RCA process effective; consumer outcomes tested",
      automated: false,
    },
  ];
}

function generateConductControls(dealerIndex: number): ControlCheck[] {
  const seed = dealerIndex * 31;
  return [
    {
      id: "conduct-1",
      controlArea: "Arrears/Forbearance Referral Patterns",
      objective: "Early warning of poor outcome for dealer-level trends",
      sourceMethod: "Trigger from Lender",
      evidence: "Trend chart",
      result: seed % 10 === 0 ? "partial" : "pass",
      frequency: "Triggered from Lender",
      riskRating: seed % 10 === 0 ? "amber" : "green",
      comments: seed % 10 === 0 ? "Elevated arrears pattern noted; retain as early-warning control" : "Patterns within normal range; NA trends for ARs",
      automated: true,
    },
  ];
}

// ─── Section summary calculator ────────────────────────────

function calculateSectionSummary(controls: ControlCheck[]): AuditSection["summary"] {
  const green = controls.filter(c => c.riskRating === "green").length;
  const amber = controls.filter(c => c.riskRating === "amber").length;
  const red = controls.filter(c => c.riskRating === "red").length;
  
  let ragStatus: RagStatus = "green";
  let notes = "All controls operating effectively.";
  
  if (red > 0) {
    ragStatus = "red";
    notes = "Critical controls require immediate attention.";
  } else if (amber > 0) {
    ragStatus = "amber";
    notes = "Minor gaps identified; monitoring recommended.";
  }
  
  return { green, amber, red, ragStatus, notes };
}

// ─── Key actions generator (now includes BAU & Optional) ───

function generateKeyActions(sections: AuditSection[], dealerIndex: number): KeyAction[] {
  const actions: KeyAction[] = [];
  const owners = ["Compliance", "Digital / Compliance", "Marketing / Compliance", "Sales / Compliance", "Customer Ops", "Risk", "Compliance / IT"];
  const dueDates = ["Immediate", "Q1 2026", "Q2 2026", "Ongoing", "Annual (Nov)"];
  
  // Always include BAU monitoring actions based on real audit patterns
  const bauActions: KeyAction[] = [
    {
      id: "bau-governance",
      section: "Corporate Governance",
      action: "Maintain director & PSC sanctions screening as BAU monitoring",
      priority: "Medium",
      owner: "Compliance",
      dueDate: "Ongoing",
      status: "BAU",
      notes: "Completed via CreditSafe; no adverse findings",
    },
    {
      id: "bau-permissions",
      section: "Permissions",
      action: "Continue quarterly FCA Register & AR status verification",
      priority: "Medium",
      owner: "Compliance",
      dueDate: "Ongoing",
      status: "BAU",
      notes: "Permissions confirmed; no issues identified",
    },
    {
      id: "bau-sales",
      section: "Sales Process",
      action: "Maintain automated pre-contract disclosure logging via Klassify / iVendi",
      priority: "High",
      owner: "Compliance",
      dueDate: "Ongoing",
      status: "BAU",
      notes: "Operating effectively; no remediation required",
    },
    {
      id: "bau-consumer",
      section: "Consumer Duty",
      action: "Continue quarterly fair-value benchmarking reviews",
      priority: "High",
      owner: "Compliance",
      dueDate: "Ongoing",
      status: "BAU",
      notes: "Benchmarking active; no outliers identified",
    },
    {
      id: "bau-crime",
      section: "Financial Crime / Fraud",
      action: "Maintain KYC / AML & sanctions screening at application stage",
      priority: "High",
      owner: "Compliance",
      dueDate: "Ongoing",
      status: "BAU",
      notes: "CreditSafe checks completed; all clear",
    },
  ];
  
  // Add remediation actions for failed/partial controls
  sections.forEach(section => {
    section.controls.forEach(control => {
      if (control.result === "fail" || control.result === "partial") {
        actions.push({
          id: `action-${control.id}`,
          section: section.name,
          action: `Remediate: ${control.controlArea}`,
          priority: control.riskRating === "red" ? "High" : control.riskRating === "amber" ? "Medium" : "Low",
          owner: owners[(dealerIndex + actions.length) % owners.length],
          dueDate: control.riskRating === "red" ? "Immediate" : dueDates[(dealerIndex + actions.length) % dueDates.length],
          status: control.riskRating === "red" ? "Pending" : "In Progress",
          notes: control.comments,
        });
      }
    });
  });

  // Add optional enhancement actions
  const optionalActions: KeyAction[] = [
    {
      id: "opt-governance",
      section: "Corporate Governance",
      action: "Explore automation for web / registry consistency checks (Co House, FCA, ICO)",
      priority: "Low",
      owner: "Digital / Compliance",
      dueDate: "Q1 2026",
      status: "Optional",
      notes: "Automation enhancement, not a gap; manual controls effective",
    },
    {
      id: "opt-permissions",
      section: "Permissions",
      action: "Assess feasibility of API-based FCA permission checks",
      priority: "Low",
      owner: "Compliance / IT",
      dueDate: "Q2 2026",
      status: "Optional",
      notes: "Currently effective and evidenced; optional enhancement",
    },
  ];

  // Combine: remediation first, then BAU, then optional – limit total
  const combined = [...actions, ...bauActions.slice(0, 3), ...optionalActions.slice(0, 1)];
  return combined.slice(0, 12);
}

// ─── Special audit data for the 4 real sample dealers ──────

function generateRealDealerAudit(dealerName: string): DealerAudit | null {
  const realAudits: Record<string, () => DealerAudit> = {
    "Thurlby Motors": () => {
      const sections = buildSectionsFromSummary([
        { green: 5, amber: 0, red: 0, notes: "Strong governance controls observed; no material gaps identified." },
        { green: 2, amber: 0, red: 0, notes: "Mostly effective reporting, continue to monitor." },
        { green: 3, amber: 0, red: 0, notes: "Authorisations generally sound; AR status verification confirmed." },
        { green: 3, amber: 0, red: 0, notes: "Sales processes demonstrate compliance and effective monitoring." },
        { green: 4, amber: 0, red: 0, notes: "Fair value benchmarking active via Klassify system." },
        { green: 4, amber: 0, red: 0, notes: "AML, KYC, sanctions, and fraud controls operating effectively." },
        { green: 0, amber: 2, red: 0, notes: "Missing representative APR on website and social media channels where finance is incentivised." },
        { green: 2, amber: 0, red: 0, notes: "Complaints managed through Klassify; no concerns raised." },
        { green: 1, amber: 0, red: 0, notes: "Oversight controls effective; clear responsibilities in place." },
      ]);
      return {
        dealerName: "Thurlby Motors",
        overallRag: "amber",
        overallScore: 72,
        customerSentimentScore: 8.2,
        customerSentimentTrend: 0.4,
        sentimentCategories: [
          { label: "Reputation", score: 8.4, trend: 0.6 },
          { label: "Visibility", score: 8.0, trend: 0.1 },
          { label: "Performance", score: 8.4, trend: 0.2 },
        ],
        lastAuditDate: "05 Feb 2026",
        sections,
        keyActions: [
          { id: "tm-1", section: "Financial Promotions", action: "Update website and social media with representative APR where finance is incentivised", priority: "Medium", owner: "Marketing / Compliance", dueDate: "Q1 2026", status: "Planned", notes: "Financial promotions reviewed – representative APR required" },
          { id: "tm-2", section: "Corporate Governance", action: "Formalise annual director self-declaration (sanctions/DBS)", priority: "Medium", owner: "Compliance", dueDate: "Annual (Nov)", status: "Planned", notes: "Annual declaration sufficient for lender assurance" },
          { id: "tm-3", section: "Corporate Governance", action: "Maintain director & PSC sanctions screening as BAU monitoring", priority: "Medium", owner: "Compliance", dueDate: "Ongoing", status: "BAU", notes: "Completed via CreditSafe; no adverse findings" },
          { id: "tm-4", section: "Permissions", action: "Continue quarterly FCA Register & AR status verification", priority: "Medium", owner: "Compliance", dueDate: "Ongoing", status: "BAU", notes: "Permissions confirmed; no issues" },
          { id: "tm-5", section: "Sales Process", action: "Maintain automated pre-contract disclosure logging via Klassify / iVendi", priority: "High", owner: "Compliance", dueDate: "Ongoing", status: "BAU", notes: "Operating effectively; no remediation required" },
          { id: "tm-6", section: "Consumer Duty", action: "Maintain Demands & Needs confirmation prior to payout", priority: "High", owner: "Sales / Compliance", dueDate: "Ongoing", status: "BAU", notes: "Embedded in Klassify workflow" },
          { id: "tm-7", section: "Corporate Governance", action: "Explore automation for web / registry consistency checks", priority: "Low", owner: "Digital / Compliance", dueDate: "Q1 2026", status: "Optional", notes: "Manual controls effective; automation optional enhancement" },
        ],
        firmType: "AR",
        assuranceStatement: "TCG can take assurance that Thurlby Motors Automotive remains mainly compliant, well-controlled, and aligned with FCA expectations, with ongoing monitoring in place.",
      };
    },
    "Dynasty Partners Limited": () => {
      const sections = buildSectionsFromSummary([
        { green: 5, amber: 0, red: 0, notes: "Strong governance controls observed; no material gaps identified." },
        { green: 2, amber: 0, red: 0, notes: "Mostly effective reporting, continue to monitor." },
        { green: 3, amber: 0, red: 0, notes: "Authorisations generally sound." },
        { green: 3, amber: 0, red: 0, notes: "Sales processes demonstrate compliance." },
        { green: 4, amber: 0, red: 0, notes: "Fair value benchmarking, Klassify system used." },
        { green: 4, amber: 0, red: 0, notes: "AML, KYC, sanctions, and fraud controls operating effectively." },
        { green: 1, amber: 1, red: 0, notes: "Website footnote disclosure requires updating: 'We will receive commission…'" },
        { green: 2, amber: 0, red: 0, notes: "Complaints managed through Klassify; no concerns raised." },
        { green: 1, amber: 0, red: 0, notes: "Oversight controls effective." },
      ]);
      return {
        dealerName: "Dynasty Partners Limited",
        overallRag: "amber",
        overallScore: 68,
        customerSentimentScore: 8.2,
        customerSentimentTrend: 0.4,
        sentimentCategories: [
          { label: "Reputation", score: 8.4, trend: 0.6 },
          { label: "Visibility", score: 8.0, trend: 0.1 },
          { label: "Performance", score: 8.4, trend: 0.2 },
        ],
        lastAuditDate: "05 Feb 2026",
        sections,
        keyActions: [
          { id: "dp-1", section: "Financial Promotions", action: "Update website footnote disclosure to include 'We will receive commission…' wording", priority: "Medium", owner: "Marketing / Compliance", dueDate: "Q1 2026", status: "Planned", notes: "Footnote disclosure on website needs updating" },
          { id: "dp-2", section: "Corporate Governance", action: "Maintain director & PSC sanctions screening as BAU monitoring", priority: "Medium", owner: "Compliance", dueDate: "Ongoing", status: "BAU", notes: "Completed via CreditSafe; no adverse findings" },
          { id: "dp-3", section: "Permissions", action: "Continue quarterly FCA Register verification", priority: "Medium", owner: "Compliance", dueDate: "Ongoing", status: "BAU", notes: "Confirmed; no issues identified" },
          { id: "dp-4", section: "Consumer Duty", action: "Continue quarterly fair-value benchmarking reviews", priority: "High", owner: "Compliance", dueDate: "Ongoing", status: "BAU", notes: "Benchmarking active; no outliers" },
          { id: "dp-5", section: "Financial Crime / Fraud", action: "Maintain KYC / AML & sanctions screening at application stage", priority: "High", owner: "Compliance", dueDate: "Ongoing", status: "BAU", notes: "CreditSafe checks completed; all clear" },
        ],
        firmType: "DA",
        assuranceStatement: "Dynasty Partners Limited remains mainly compliant, well-controlled, and aligned with FCA expectations for a Directly Authorised firm.",
      };
    },
    "Shirlaws Limited": () => {
      const sections = buildSectionsFromSummary([
        { green: 4, amber: 0, red: 1, notes: "CreditSafe Category D with negative financials – high risk." },
        { green: 2, amber: 0, red: 0, notes: "Mostly effective reporting." },
        { green: 3, amber: 0, red: 0, notes: "Authorisations generally sound." },
        { green: 1, amber: 0, red: 1, notes: "2 instances of missing Demands & Needs Statement for finance customers." },
        { green: 4, amber: 0, red: 0, notes: "Fair value benchmarking, Klassify system used." },
        { green: 4, amber: 0, red: 0, notes: "AML, KYC, sanctions, and fraud controls operating effectively." },
        { green: 0, amber: 2, red: 0, notes: "Representative APR required on website and social media." },
        { green: 2, amber: 0, red: 0, notes: "Complaints managed through Klassify; 7 recent 1-star reviews noted." },
        { green: 1, amber: 0, red: 0, notes: "Oversight controls effective." },
      ]);
      return {
        dealerName: "Shirlaws Limited",
        overallRag: "red",
        overallScore: 38,
        customerSentimentScore: 5.1,
        customerSentimentTrend: -0.8,
        sentimentCategories: [
          { label: "Reputation", score: 4.2, trend: -1.2 },
          { label: "Visibility", score: 5.8, trend: -0.3 },
          { label: "Performance", score: 5.3, trend: -0.9 },
        ],
        lastAuditDate: "05 Feb 2026",
        sections,
        keyActions: [
          { id: "sl-1", section: "Corporate Governance", action: "Review firm's CreditSafe Category D rating and negative financial indicators", priority: "High", owner: "Risk", dueDate: "Immediate", status: "Pending", notes: "Category D CreditSafe with negative financials – operational resilience risk" },
          { id: "sl-2", section: "Sales Process", action: "Ensure all finance customers receive completed Demands & Needs Statement", priority: "High", owner: "Sales / Compliance", dueDate: "Immediate", status: "Pending", notes: "2 instances identified where D&N not completed" },
          { id: "sl-3", section: "Financial Promotions", action: "Add representative APR to website and social media channels", priority: "Medium", owner: "Marketing / Compliance", dueDate: "Q1 2026", status: "Planned", notes: "Where finance is being incentivised" },
          { id: "sl-4", section: "Communications & Complaints", action: "Investigate 7 recent 1-star reviews and address root causes", priority: "High", owner: "Customer Ops", dueDate: "Immediate", status: "Pending", notes: "Review Google / Trustpilot sentiment" },
          { id: "sl-5", section: "Sales Process", action: "Maintain automated pre-contract disclosure logging via Klassify / iVendi", priority: "High", owner: "Compliance", dueDate: "Ongoing", status: "BAU", notes: "Operating effectively" },
          { id: "sl-6", section: "Consumer Duty", action: "Continue quarterly fair-value benchmarking reviews", priority: "High", owner: "Compliance", dueDate: "Ongoing", status: "BAU", notes: "Active; no outliers" },
        ],
        firmType: "AR",
        assuranceStatement: "TCG recommends a review into the firm's financials and sales process before proceeding.",
      };
    },
    "Platinum Vehicle Specialists": () => {
      const sections = buildSectionsFromSummary([
        { green: 5, amber: 0, red: 0, notes: "Strong governance controls observed." },
        { green: 2, amber: 0, red: 0, notes: "Mostly effective reporting." },
        { green: 3, amber: 0, red: 0, notes: "Authorisations generally sound." },
        { green: 0, amber: 0, red: 2, notes: "Missing IDD and Demands & Needs Statement for finance agreement." },
        { green: 4, amber: 0, red: 0, notes: "Fair value benchmarking, Klassify system used." },
        { green: 4, amber: 0, red: 0, notes: "AML, KYC, sanctions, and fraud controls operating effectively." },
        { green: 0, amber: 2, red: 0, notes: "Missing representative APR on website and social media." },
        { green: 2, amber: 0, red: 0, notes: "Complaints managed through Klassify; no concerns." },
        { green: 1, amber: 0, red: 0, notes: "Oversight controls effective." },
      ]);
      return {
        dealerName: "Platinum Vehicle Specialists",
        overallRag: "red",
        overallScore: 42,
        customerSentimentScore: 8.2,
        customerSentimentTrend: 0.4,
        sentimentCategories: [
          { label: "Reputation", score: 8.4, trend: 0.6 },
          { label: "Visibility", score: 8.0, trend: 0.1 },
          { label: "Performance", score: 8.4, trend: 0.2 },
        ],
        lastAuditDate: "05 Feb 2026",
        sections,
        keyActions: [
          { id: "pvs-1", section: "Sales Process", action: "Ensure all finance customers receive IDD and completed Demands & Needs Statement", priority: "High", owner: "Sales / Compliance", dueDate: "Immediate", status: "Pending", notes: "1 instance of missing IDD and D&N Statement identified" },
          { id: "pvs-2", section: "Financial Promotions", action: "Add representative APR to website and social media channels", priority: "Medium", owner: "Marketing / Compliance", dueDate: "Q1 2026", status: "Planned", notes: "Where finance is being incentivised" },
          { id: "pvs-3", section: "Corporate Governance", action: "Maintain director & PSC sanctions screening as BAU monitoring", priority: "Medium", owner: "Compliance", dueDate: "Ongoing", status: "BAU", notes: "Screening completed via CreditSafe; no adverse findings" },
          { id: "pvs-4", section: "Sales Process", action: "Continue affordability & eligibility assurance per lender policy", priority: "High", owner: "Compliance", dueDate: "Ongoing", status: "BAU", notes: "Manual checks for ARs evidenced" },
          { id: "pvs-5", section: "Consumer Duty", action: "Maintain Demands & Needs confirmation prior to payout", priority: "High", owner: "Sales / Compliance", dueDate: "Ongoing", status: "BAU", notes: "Embedded in Klassify workflow; manual testing" },
          { id: "pvs-6", section: "Permissions", action: "Assess feasibility of API-based FCA permission checks", priority: "Low", owner: "Compliance / IT", dueDate: "Q2 2026", status: "Optional", notes: "Currently effective and evidenced" },
        ],
        firmType: "AR",
        assuranceStatement: "TCG recommends a review into the firm's sales process before proceeding.",
      };
    },
  };

  const generator = realAudits[dealerName];
  return generator ? generator() : null;
}

// Helper to build sections from summary data for real dealers
function buildSectionsFromSummary(summaries: Array<{ green: number; amber: number; red: number; notes: string }>): AuditSection[] {
  return AUDIT_SECTIONS.map((def, i) => {
    const s = summaries[i];
    const ragStatus: RagStatus = s.red > 0 ? "red" : s.amber > 0 ? "amber" : "green";
    
    // Generate appropriate controls for the section count
    const totalControls = s.green + s.amber + s.red;
    const controls: ControlCheck[] = [];
    
    for (let c = 0; c < s.green; c++) {
      controls.push({
        id: `${def.id}-g${c}`,
        controlArea: `${def.name} Control ${c + 1}`,
        objective: "Verify compliance with regulatory requirements",
        sourceMethod: "API / Manual Review",
        evidence: "Documented evidence",
        result: "pass",
        frequency: "Quarterly",
        riskRating: "green",
        comments: "Operating effectively",
        automated: c % 2 === 0,
      });
    }
    for (let c = 0; c < s.amber; c++) {
      controls.push({
        id: `${def.id}-a${c}`,
        controlArea: `${def.name} Control ${s.green + c + 1}`,
        objective: "Monitor and remediate",
        sourceMethod: "Manual Review",
        evidence: "Review notes",
        result: "partial",
        frequency: "Risk Based",
        riskRating: "amber",
        comments: s.notes,
        automated: false,
      });
    }
    for (let c = 0; c < s.red; c++) {
      controls.push({
        id: `${def.id}-r${c}`,
        controlArea: `${def.name} Control ${s.green + s.amber + c + 1}`,
        objective: "Immediate remediation required",
        sourceMethod: "Review Required",
        evidence: "Under investigation",
        result: "fail",
        frequency: "Immediate",
        riskRating: "red",
        comments: s.notes,
        automated: false,
      });
    }

    return {
      id: def.id,
      name: def.name,
      icon: def.icon,
      controls,
      summary: { green: s.green, amber: s.amber, red: s.red, ragStatus, notes: s.notes },
    };
  });
}

// ─── Main audit generator ──────────────────────────────────

export function generateDealerAudit(dealerName: string, dealerIndex: number): DealerAudit {
  // Check if this is one of the real sample dealers
  const realAudit = generateRealDealerAudit(dealerName);
  if (realAudit) return realAudit;

  const seed = dealerIndex * 37;
  
  const sections: AuditSection[] = [
    {
      id: "governance",
      name: "Corporate Governance",
      icon: "Building2",
      controls: generateGovernanceControls(dealerIndex),
      summary: { green: 0, amber: 0, red: 0, ragStatus: "green", notes: "" },
    },
    {
      id: "digital-reporting",
      name: "Digital & Reporting",
      icon: "Monitor",
      controls: generateDigitalReportingControls(dealerIndex),
      summary: { green: 0, amber: 0, red: 0, ragStatus: "green", notes: "" },
    },
    {
      id: "permissions",
      name: "Permissions",
      icon: "ShieldCheck",
      controls: generatePermissionsControls(dealerIndex),
      summary: { green: 0, amber: 0, red: 0, ragStatus: "green", notes: "" },
    },
    {
      id: "sales",
      name: "Sales Process",
      icon: "Receipt",
      controls: generateSalesControls(dealerIndex),
      summary: { green: 0, amber: 0, red: 0, ragStatus: "green", notes: "" },
    },
    {
      id: "consumer-duty",
      name: "Consumer Duty",
      icon: "Users",
      controls: generateConsumerDutyControls(dealerIndex),
      summary: { green: 0, amber: 0, red: 0, ragStatus: "green", notes: "" },
    },
    {
      id: "financial-crime",
      name: "Financial Crime / Fraud",
      icon: "AlertTriangle",
      controls: generateFinancialCrimeControls(dealerIndex),
      summary: { green: 0, amber: 0, red: 0, ragStatus: "green", notes: "" },
    },
    {
      id: "financial-promotions",
      name: "Financial Promotions",
      icon: "Megaphone",
      controls: generateFinancialPromotionsControls(dealerIndex),
      summary: { green: 0, amber: 0, red: 0, ragStatus: "green", notes: "" },
    },
    {
      id: "communications",
      name: "Communications & Complaints",
      icon: "MessageSquare",
      controls: generateCommunicationsControls(dealerIndex),
      summary: { green: 0, amber: 0, red: 0, ragStatus: "green", notes: "" },
    },
    {
      id: "conduct",
      name: "Conduct Oversight",
      icon: "Eye",
      controls: generateConductControls(dealerIndex),
      summary: { green: 0, amber: 0, red: 0, ragStatus: "green", notes: "" },
    },
  ];
  
  sections.forEach(section => {
    section.summary = calculateSectionSummary(section.controls);
  });
  
  const allControls = sections.flatMap(s => s.controls);
  const redCount = allControls.filter(c => c.riskRating === "red").length;
  const amberCount = allControls.filter(c => c.riskRating === "amber").length;
  
  let overallRag: RagStatus = "green";
  if (redCount > 0) overallRag = "red";
  else if (amberCount > 1) overallRag = "amber";
  
  const passCount = allControls.filter(c => c.result === "pass").length;
  const overallScore = Math.round((passCount / allControls.length) * 100);
  
  const baseCSS = 6.0 + (seed % 35) / 10;
  const cssTrend = ((seed % 10) - 5) / 10;
  
  const repScore = Math.round((baseCSS + ((seed % 7) - 3) / 10) * 10) / 10;
  const visScore = Math.round((baseCSS + ((seed % 5) - 2) / 10) * 10) / 10;
  const perfScore = Math.round((baseCSS + ((seed % 9) - 4) / 10) * 10) / 10;

  const sentimentCategories: SentimentCategory[] = [
    { label: "Reputation", score: Math.min(10, Math.max(0, repScore)), trend: Math.round(((seed % 12) - 6) / 10 * 10) / 10 },
    { label: "Visibility", score: Math.min(10, Math.max(0, visScore)), trend: Math.round(((seed % 8) - 4) / 10 * 10) / 10 },
    { label: "Performance", score: Math.min(10, Math.max(0, perfScore)), trend: Math.round(((seed % 6) - 3) / 10 * 10) / 10 },
  ];

  // Determine firm type from dealer index
  const firmType = dealerIndex % 5 === 0 ? "DA" : "AR";

  return {
    dealerName,
    overallRag,
    overallScore,
    customerSentimentScore: Math.round(baseCSS * 10) / 10,
    customerSentimentTrend: Math.round(cssTrend * 10) / 10,
    sentimentCategories,
    lastAuditDate: "05 Feb 2026",
    sections,
    keyActions: generateKeyActions(sections, dealerIndex),
    firmType,
    assuranceStatement: overallRag === "green"
      ? `${dealerName} remains compliant, well-controlled, and aligned with FCA expectations, with ongoing monitoring in place.`
      : overallRag === "amber"
      ? `${dealerName} remains mainly compliant with minor risks raised. Continuous monitoring as BAU.`
      : `TCG recommends a review into the firm's compliance controls before proceeding.`,
  };
}
