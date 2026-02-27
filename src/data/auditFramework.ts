// Control check types matching the real audit document framework

// Internal result type for control risk ratings
type ControlRiskRating = "pass" | "attention" | "fail";

export interface ControlCheck {
  id: string;
  controlArea: string;
  objective: string;
  sourceMethod: string;
  evidence: string;
  result: "pass" | "fail" | "partial";
  frequency: string;
  riskRating: ControlRiskRating;
  comments: string;
  automated: boolean;
}

export interface AuditSection {
  id: string;
  name: string;
  icon: string;
  controls: ControlCheck[];
  summary: {
    pass: number;
    attention: number;
    fail: number;
    outcome: "pass" | "attention" | "fail";
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
      riskRating: "pass",
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
      riskRating: seed % 5 === 0 ? "attention" : "pass",
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
      riskRating: "pass",
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
      riskRating: seed % 8 === 0 ? "fail" : "pass",
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
      riskRating: "pass",
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
      riskRating: seed % 7 === 0 ? "attention" : "pass",
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
      riskRating: "pass",
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
      riskRating: seed % 12 === 0 ? "fail" : "pass",
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
      riskRating: seed % 4 === 0 ? "attention" : "pass",
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
      riskRating: "pass",
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
      riskRating: seed % 6 === 0 ? "attention" : "pass",
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
      riskRating: seed % 9 === 0 ? "fail" : "pass",
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
      riskRating: seed % 7 === 0 ? "fail" : "pass",
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
      riskRating: seed % 11 === 0 ? "attention" : "pass",
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
      riskRating: seed % 5 === 0 ? "fail" : "pass",
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
      riskRating: seed % 6 === 0 ? "attention" : "pass",
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
      riskRating: "pass",
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
      riskRating: seed % 4 === 0 ? "attention" : "pass",
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
      riskRating: "pass",
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
      riskRating: "pass",
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
      riskRating: "pass",
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
      riskRating: seed % 10 === 0 ? "attention" : "pass",
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
      riskRating: "pass",
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
      riskRating: seed % 15 === 0 ? "fail" : "pass",
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
      riskRating: seed % 3 === 0 ? "attention" : "pass",
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
      riskRating: "pass",
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
      riskRating: seed % 4 === 0 ? "attention" : "pass",
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
      riskRating: seed % 4 === 0 ? "attention" : "pass",
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
      riskRating: seed % 3 === 0 ? "fail" : "pass",
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
      riskRating: seed % 5 === 0 ? "fail" : "pass",
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
      riskRating: seed % 10 === 0 ? "attention" : "pass",
      comments: seed % 10 === 0 ? "Elevated arrears pattern noted; retain as early-warning control" : "Patterns within normal range; NA trends for ARs",
      automated: true,
    },
  ];
}

// ─── Section summary calculator ────────────────────────────

function calculateSectionSummary(controls: ControlCheck[]): AuditSection["summary"] {
  const pass = controls.filter(c => c.riskRating === "pass").length;
  const attention = controls.filter(c => c.riskRating === "attention").length;
  const fail = controls.filter(c => c.riskRating === "fail").length;
  
  let outcome: "pass" | "attention" | "fail" = "pass";
  let notes = "All controls operating effectively.";
  
  if (fail > 0) {
    outcome = "fail";
    notes = "Critical controls require immediate attention.";
  } else if (attention > 0) {
    outcome = "attention";
    notes = "Minor gaps identified; monitoring recommended.";
  }
  
  return { pass, attention, fail, outcome, notes };
}

// ─── Key actions generator (now includes BAU & Optional) ───

function generateKeyActions(sections: AuditSection[], dealerIndex: number): KeyAction[] {
  const actions: KeyAction[] = [];
  const owners = ["Compliance", "Digital / Compliance", "Marketing / Compliance", "Sales / Compliance", "Customer Ops", "Risk", "Compliance / IT"];
  const dueDates = ["Immediate", "Q1 2026", "Q2 2026", "Ongoing", "Annual (Nov)"];
  
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
  
  sections.forEach(section => {
    section.controls.forEach(control => {
      if (control.result === "fail" || control.result === "partial") {
        actions.push({
          id: `action-${control.id}`,
          section: section.name,
          action: `Remediate: ${control.controlArea}`,
          priority: control.riskRating === "fail" ? "High" : control.riskRating === "attention" ? "Medium" : "Low",
          owner: owners[(dealerIndex + actions.length) % owners.length],
          dueDate: control.riskRating === "fail" ? "Immediate" : dueDates[(dealerIndex + actions.length) % dueDates.length],
          status: control.riskRating === "fail" ? "Pending" : "In Progress",
          notes: control.comments,
        });
      }
    });
  });

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

  const combined = [...actions, ...bauActions.slice(0, 3), ...optionalActions.slice(0, 1)];
  return combined.slice(0, 12);
}

// ─── Special audit data for the 4 real sample dealers ──────

function generateRealDealerAudit(dealerName: string): DealerAudit | null {
  const realAudits: Record<string, () => DealerAudit> = {
    "Thurlby Motors": () => {
      const sections = buildSectionsFromSummary([
        { pass: 5, attention: 0, fail: 0, notes: "Strong governance controls observed; no material gaps identified." },
        { pass: 2, attention: 0, fail: 0, notes: "Mostly effective reporting, continue to monitor." },
        { pass: 3, attention: 0, fail: 0, notes: "Authorisations generally sound; AR status verification confirmed." },
        { pass: 3, attention: 0, fail: 0, notes: "Sales processes demonstrate compliance and effective monitoring." },
        { pass: 4, attention: 0, fail: 0, notes: "Fair value benchmarking active via Klassify system." },
        { pass: 4, attention: 0, fail: 0, notes: "AML, KYC, sanctions, and fraud controls operating effectively." },
        { pass: 0, attention: 2, fail: 0, notes: "Missing representative APR on website and social media channels where finance is incentivised." },
        { pass: 2, attention: 0, fail: 0, notes: "Complaints managed through Klassify; no concerns raised." },
        { pass: 1, attention: 0, fail: 0, notes: "Oversight controls effective; clear responsibilities in place." },
      ]);
      return {
        dealerName: "Thurlby Motors",
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
        { pass: 5, attention: 0, fail: 0, notes: "Strong governance controls observed; no material gaps identified." },
        { pass: 2, attention: 0, fail: 0, notes: "Mostly effective reporting, continue to monitor." },
        { pass: 3, attention: 0, fail: 0, notes: "Authorisations generally sound." },
        { pass: 3, attention: 0, fail: 0, notes: "Sales processes demonstrate compliance." },
        { pass: 4, attention: 0, fail: 0, notes: "Fair value benchmarking, Klassify system used." },
        { pass: 4, attention: 0, fail: 0, notes: "AML, KYC, sanctions, and fraud controls operating effectively." },
        { pass: 1, attention: 1, fail: 0, notes: "Website footnote disclosure requires updating: 'We will receive commission…'" },
        { pass: 2, attention: 0, fail: 0, notes: "Complaints managed through Klassify; no concerns raised." },
        { pass: 1, attention: 0, fail: 0, notes: "Oversight controls effective." },
      ]);
      return {
        dealerName: "Dynasty Partners Limited",
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
        { pass: 4, attention: 0, fail: 1, notes: "CreditSafe Category D with negative financials – high risk." },
        { pass: 2, attention: 0, fail: 0, notes: "Mostly effective reporting." },
        { pass: 3, attention: 0, fail: 0, notes: "Authorisations generally sound." },
        { pass: 1, attention: 0, fail: 1, notes: "2 instances of missing Demands & Needs Statement for finance customers." },
        { pass: 4, attention: 0, fail: 0, notes: "Fair value benchmarking, Klassify system used." },
        { pass: 4, attention: 0, fail: 0, notes: "AML, KYC, sanctions, and fraud controls operating effectively." },
        { pass: 0, attention: 2, fail: 0, notes: "Representative APR required on website and social media." },
        { pass: 2, attention: 0, fail: 0, notes: "Complaints managed through Klassify; 7 recent 1-star reviews noted." },
        { pass: 1, attention: 0, fail: 0, notes: "Oversight controls effective." },
      ]);
      return {
        dealerName: "Shirlaws Limited",
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
        { pass: 5, attention: 0, fail: 0, notes: "Strong governance controls observed." },
        { pass: 2, attention: 0, fail: 0, notes: "Mostly effective reporting." },
        { pass: 3, attention: 0, fail: 0, notes: "Authorisations generally sound." },
        { pass: 0, attention: 0, fail: 2, notes: "Missing IDD and Demands & Needs Statement for finance agreement." },
        { pass: 4, attention: 0, fail: 0, notes: "Fair value benchmarking, Klassify system used." },
        { pass: 4, attention: 0, fail: 0, notes: "AML, KYC, sanctions, and fraud controls operating effectively." },
        { pass: 0, attention: 2, fail: 0, notes: "Missing representative APR on website and social media." },
        { pass: 2, attention: 0, fail: 0, notes: "Complaints managed through Klassify; no concerns." },
        { pass: 1, attention: 0, fail: 0, notes: "Oversight controls effective." },
      ]);
      return {
        dealerName: "Platinum Vehicle Specialists",
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
function buildSectionsFromSummary(summaries: Array<{ pass: number; attention: number; fail: number; notes: string }>): AuditSection[] {
  return AUDIT_SECTIONS.map((def, i) => {
    const s = summaries[i];
    const outcome: "pass" | "attention" | "fail" = s.fail > 0 ? "fail" : s.attention > 0 ? "attention" : "pass";
    
    const controls: ControlCheck[] = [];
    
    for (let c = 0; c < s.pass; c++) {
      controls.push({
        id: `${def.id}-g${c}`,
        controlArea: `${def.name} Control ${c + 1}`,
        objective: "Verify compliance with regulatory requirements",
        sourceMethod: "API / Manual Review",
        evidence: "Documented evidence",
        result: "pass",
        frequency: "Quarterly",
        riskRating: "pass",
        comments: "Operating effectively",
        automated: c % 2 === 0,
      });
    }
    for (let c = 0; c < s.attention; c++) {
      controls.push({
        id: `${def.id}-a${c}`,
        controlArea: `${def.name} Control ${s.pass + c + 1}`,
        objective: "Monitor and remediate",
        sourceMethod: "Manual Review",
        evidence: "Review notes",
        result: "partial",
        frequency: "Risk Based",
        riskRating: "attention",
        comments: s.notes,
        automated: false,
      });
    }
    for (let c = 0; c < s.fail; c++) {
      controls.push({
        id: `${def.id}-r${c}`,
        controlArea: `${def.name} Control ${s.pass + s.attention + c + 1}`,
        objective: "Immediate remediation required",
        sourceMethod: "Review Required",
        evidence: "Under investigation",
        result: "fail",
        frequency: "Immediate",
        riskRating: "fail",
        comments: s.notes,
        automated: false,
      });
    }

    return {
      id: def.id,
      name: def.name,
      icon: def.icon,
      controls,
      summary: { pass: s.pass, attention: s.attention, fail: s.fail, outcome, notes: s.notes },
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
      summary: { pass: 0, attention: 0, fail: 0, outcome: "pass", notes: "" },
    },
    {
      id: "digital-reporting",
      name: "Digital & Reporting",
      icon: "Monitor",
      controls: generateDigitalReportingControls(dealerIndex),
      summary: { pass: 0, attention: 0, fail: 0, outcome: "pass", notes: "" },
    },
    {
      id: "permissions",
      name: "Permissions",
      icon: "ShieldCheck",
      controls: generatePermissionsControls(dealerIndex),
      summary: { pass: 0, attention: 0, fail: 0, outcome: "pass", notes: "" },
    },
    {
      id: "sales",
      name: "Sales Process",
      icon: "Receipt",
      controls: generateSalesControls(dealerIndex),
      summary: { pass: 0, attention: 0, fail: 0, outcome: "pass", notes: "" },
    },
    {
      id: "consumer-duty",
      name: "Consumer Duty",
      icon: "Users",
      controls: generateConsumerDutyControls(dealerIndex),
      summary: { pass: 0, attention: 0, fail: 0, outcome: "pass", notes: "" },
    },
    {
      id: "financial-crime",
      name: "Financial Crime / Fraud",
      icon: "AlertTriangle",
      controls: generateFinancialCrimeControls(dealerIndex),
      summary: { pass: 0, attention: 0, fail: 0, outcome: "pass", notes: "" },
    },
    {
      id: "financial-promotions",
      name: "Financial Promotions",
      icon: "Megaphone",
      controls: generateFinancialPromotionsControls(dealerIndex),
      summary: { pass: 0, attention: 0, fail: 0, outcome: "pass", notes: "" },
    },
    {
      id: "communications",
      name: "Communications & Complaints",
      icon: "MessageSquare",
      controls: generateCommunicationsControls(dealerIndex),
      summary: { pass: 0, attention: 0, fail: 0, outcome: "pass", notes: "" },
    },
    {
      id: "conduct",
      name: "Conduct Oversight",
      icon: "Eye",
      controls: generateConductControls(dealerIndex),
      summary: { pass: 0, attention: 0, fail: 0, outcome: "pass", notes: "" },
    },
  ];
  
  sections.forEach(section => {
    section.summary = calculateSectionSummary(section.controls);
  });
  
  const allControls = sections.flatMap(s => s.controls);
  
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

  const firmType = dealerIndex % 5 === 0 ? "DA" : "AR";

  return {
    dealerName,
    overallScore,
    customerSentimentScore: Math.round(baseCSS * 10) / 10,
    customerSentimentTrend: Math.round(cssTrend * 10) / 10,
    sentimentCategories,
    lastAuditDate: "05 Feb 2026",
    sections,
    keyActions: generateKeyActions(sections, dealerIndex),
    firmType,
    assuranceStatement: overallScore >= 80
      ? `${dealerName} remains compliant, well-controlled, and aligned with FCA expectations, with ongoing monitoring in place.`
      : overallScore >= 55
      ? `${dealerName} remains mainly compliant with minor risks raised. Continuous monitoring as BAU.`
      : `TCG recommends a review into the firm's compliance controls before proceeding.`,
  };
}
