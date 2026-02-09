import { RagStatus } from "./dealers";

// Control check types matching the document framework
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
  status: "Pending" | "In Progress" | "Planned" | "Complete";
  notes: string;
}

export interface DealerAudit {
  dealerName: string;
  overallRag: RagStatus;
  overallScore: number;
  customerSentimentScore: number;
  customerSentimentTrend: number;
  lastAuditDate: string;
  sections: AuditSection[];
  keyActions: KeyAction[];
}

// Section definitions with icons (lucide icon names)
export const AUDIT_SECTIONS = [
  { id: "governance", name: "Corporate Governance", icon: "Building2" },
  { id: "permissions", name: "Permissions", icon: "ShieldCheck" },
  { id: "sales", name: "Sales Process", icon: "Receipt" },
  { id: "consumer-duty", name: "Consumer Duty", icon: "Users" },
  { id: "financial-crime", name: "Financial Crime / Fraud", icon: "AlertTriangle" },
  { id: "financial-promotions", name: "Financial Promotions", icon: "Megaphone" },
  { id: "communications", name: "Communications & Complaints", icon: "MessageSquare" },
  { id: "conduct", name: "Conduct Oversight", icon: "Eye" },
] as const;

// Generate realistic control checks for each section
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
      frequency: "Quarterly + Alert",
      riskRating: "green",
      comments: "All correct and verified",
      automated: true,
    },
    {
      id: "gov-2",
      controlArea: "Entity/Trading Names Alignment",
      objective: "Confirm consistency of trading identity",
      sourceMethod: "Hybrid (Web scan + Manual confirm)",
      evidence: "Screenshots & Registry Records",
      result: seed % 5 === 0 ? "partial" : "pass",
      frequency: "Quarterly + Alert",
      riskRating: seed % 5 === 0 ? "amber" : "green",
      comments: seed % 5 === 0 ? "Minor discrepancy in trading name" : "FCA & ICO confirmed",
      automated: false,
    },
    {
      id: "gov-3",
      controlArea: "Directors / PSCs Change History",
      objective: "Confirm governance structure stability",
      sourceMethod: "API Lookup",
      evidence: "PSC Change Log",
      result: "pass",
      frequency: "Quarterly + Alert",
      riskRating: "green",
      comments: "Enables trigger-based enhanced checks",
      automated: true,
    },
    {
      id: "gov-4",
      controlArea: "Adverse Media / Sanctions / PEP Screening",
      objective: "Identify potential compliance risks",
      sourceMethod: "Screening Service",
      evidence: "Report & Case Notes",
      result: seed % 8 === 0 ? "fail" : "pass",
      frequency: "Continuous / Quarterly Review",
      riskRating: seed % 8 === 0 ? "red" : "green",
      comments: seed % 8 === 0 ? "Alert flagged - review required" : "No adverse findings",
      automated: true,
    },
    {
      id: "gov-5",
      controlArea: "Declaration of Sanctions",
      objective: "Confirm no undisclosed sanctions",
      sourceMethod: "Signed Attestation",
      evidence: "Onboarding + Annual",
      result: "pass",
      frequency: "Annual",
      riskRating: "green",
      comments: "Self-declaration received",
      automated: false,
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
      frequency: "Quarterly",
      riskRating: seed % 12 === 0 ? "red" : "green",
      comments: seed % 12 === 0 ? "AR status verification required" : "Register checked, correct status",
      automated: true,
    },
    {
      id: "perm-2",
      controlArea: "Competence Training Matrix",
      objective: "Ensure staff have required knowledge",
      sourceMethod: "Training Records Review",
      evidence: "Certificates verified",
      result: seed % 4 === 0 ? "partial" : "pass",
      frequency: "Quarterly",
      riskRating: seed % 4 === 0 ? "amber" : "green",
      comments: seed % 4 === 0 ? "2 staff overdue for refresher" : "All training current",
      automated: false,
    },
    {
      id: "perm-3",
      controlArea: "SMF Allocation for Oversight",
      objective: "Ensure clear responsibility allocation",
      sourceMethod: "Org Chart Review",
      evidence: "SMF Attestation",
      result: "pass",
      frequency: "Annual + Alert",
      riskRating: "green",
      comments: "Clear oversight structure documented",
      automated: false,
    },
    {
      id: "perm-4",
      controlArea: "Trading Names Cross-Reference",
      objective: "Match Companies House, FCA, and website",
      sourceMethod: "Cross-check validation",
      evidence: "Comparison report",
      result: seed % 6 === 0 ? "partial" : "pass",
      frequency: "Annual",
      riskRating: seed % 6 === 0 ? "amber" : "green",
      comments: seed % 6 === 0 ? "Website name needs updating" : "All names aligned",
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
      objective: "Ensure proper disclosure before agreement",
      sourceMethod: "API / iVendi Assurance",
      evidence: "Event log + documents",
      result: "pass",
      frequency: "Per Application",
      riskRating: "green",
      comments: "All disclosures timestamped and logged",
      automated: true,
    },
    {
      id: "sales-2",
      controlArea: "Affordability / Eligibility Checks",
      objective: "Verify customer can afford product",
      sourceMethod: "API / iVendi Assurance",
      evidence: "Decisioning trace + policy map",
      result: seed % 7 === 0 ? "partial" : "pass",
      frequency: "Per Application",
      riskRating: seed % 7 === 0 ? "amber" : "green",
      comments: seed % 7 === 0 ? "Some manual overrides noted" : "Automated checks passing",
      automated: true,
    },
    {
      id: "sales-3",
      controlArea: "Suitability Assessment",
      objective: "Match product to customer needs",
      sourceMethod: "Application Review",
      evidence: "Suitability statement",
      result: "pass",
      frequency: "Per Application",
      riskRating: "green",
      comments: "Suitability documented",
      automated: false,
    },
  ];
}

function generateConsumerDutyControls(dealerIndex: number): ControlCheck[] {
  const seed = dealerIndex * 17;
  return [
    {
      id: "duty-1",
      controlArea: "Fair Value Benchmarking",
      objective: "APR vs aggregated benchmark comparison",
      sourceMethod: "iVendi Analytics",
      evidence: "Benchmark report + outlier list",
      result: seed % 5 === 0 ? "fail" : "pass",
      frequency: "Quarterly",
      riskRating: seed % 5 === 0 ? "red" : "green",
      comments: seed % 5 === 0 ? "APR outliers detected" : "Within benchmark range",
      automated: true,
    },
    {
      id: "duty-2",
      controlArea: "Products and Services Review",
      objective: "Confirm products meet FCA Consumer Duty",
      sourceMethod: "Product Review",
      evidence: "Benchmark report",
      result: seed % 6 === 0 ? "partial" : "pass",
      frequency: "Quarterly",
      riskRating: seed % 6 === 0 ? "amber" : "green",
      comments: seed % 6 === 0 ? "Partial selection reviewed" : "All products compliant",
      automated: false,
    },
    {
      id: "duty-3",
      controlArea: "Customer Understanding",
      objective: "Measure whether consumers understand products",
      sourceMethod: "Call Monitoring",
      evidence: "Call monitoring reports",
      result: "pass",
      frequency: "Quarterly",
      riskRating: "green",
      comments: "Customer comprehension verified",
      automated: false,
    },
    {
      id: "duty-4",
      controlArea: "Customer Support Review",
      objective: "Assess effectiveness of support and complaints",
      sourceMethod: "Call logs, complaint reports",
      evidence: "Support metrics",
      result: seed % 4 === 0 ? "partial" : "pass",
      frequency: "Monthly",
      riskRating: seed % 4 === 0 ? "amber" : "green",
      comments: seed % 4 === 0 ? "Response times need improvement" : "Support effective",
      automated: false,
    },
    {
      id: "duty-5",
      controlArea: "Vulnerability Identification",
      objective: "Identify and treat vulnerable customers",
      sourceMethod: "iVendi Flags",
      evidence: "Flags + file notes",
      result: "pass",
      frequency: "Quarterly",
      riskRating: "green",
      comments: "Vulnerability flags active",
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
      evidence: "Pass/fail + reason",
      result: "pass",
      frequency: "Per Application",
      riskRating: "green",
      comments: "All applicants verified",
      automated: true,
    },
    {
      id: "crime-2",
      controlArea: "AML / Sanction Screening",
      objective: "Screen against sanctions lists",
      sourceMethod: "Service Vendor",
      evidence: "Ref + case review",
      result: "pass",
      frequency: "Per Application",
      riskRating: "green",
      comments: "No sanctions hits",
      automated: true,
    },
    {
      id: "crime-3",
      controlArea: "Device/IP Anomaly Detection",
      objective: "Detect fraud patterns",
      sourceMethod: "Telemetry analytics",
      evidence: "Anomaly flag + score",
      result: seed % 10 === 0 ? "partial" : "pass",
      frequency: "Per Application",
      riskRating: seed % 10 === 0 ? "amber" : "green",
      comments: seed % 10 === 0 ? "Some anomalies flagged for review" : "No anomalies detected",
      automated: true,
    },
    {
      id: "crime-4",
      controlArea: "Velocity / Patterning",
      objective: "Detect multiple apps per customer/device",
      sourceMethod: "iVendi Analytics",
      evidence: "Velocity score",
      result: "pass",
      frequency: "Per Application",
      riskRating: "green",
      comments: "Velocity within normal range",
      automated: true,
    },
    {
      id: "crime-5",
      controlArea: "Bank Detail / Payout Mismatch",
      objective: "Detect payout fraud risk",
      sourceMethod: "From Lender",
      evidence: "Mismatch log",
      result: seed % 15 === 0 ? "fail" : "pass",
      frequency: "Triggered",
      riskRating: seed % 15 === 0 ? "red" : "green",
      comments: seed % 15 === 0 ? "Mismatch detected - investigation required" : "No mismatches",
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
      sourceMethod: "TCG Web Scan",
      evidence: "Scan report + screenshots",
      result: seed % 8 === 0 ? "partial" : "pass",
      frequency: "Risk Based",
      riskRating: seed % 8 === 0 ? "amber" : "green",
      comments: seed % 8 === 0 ? "Minor wording updates needed" : "Compliant promotions",
      automated: true,
    },
    {
      id: "promo-2",
      controlArea: "Privacy Policy & Cookie Management",
      objective: "Verify GDPR compliance",
      sourceMethod: "Website Review",
      evidence: "Policy documents",
      result: "pass",
      frequency: "Annual",
      riskRating: "green",
      comments: "Policies up to date",
      automated: false,
    },
    {
      id: "promo-3",
      controlArea: "Social Media Monitoring",
      objective: "Monitor for non-compliant promotional content",
      sourceMethod: "Feed Monitoring",
      evidence: "Posts archive",
      result: seed % 9 === 0 ? "partial" : "pass",
      frequency: "Risk Based",
      riskRating: seed % 9 === 0 ? "amber" : "green",
      comments: seed % 9 === 0 ? "Review flagged posts" : "Social content compliant",
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
      objective: "Ensure WhatsApp/SMS/Phone are monitored",
      sourceMethod: "Policy review + sampling",
      evidence: "Sampled logs",
      result: seed % 4 === 0 ? "partial" : "pass",
      frequency: "Monthly",
      riskRating: seed % 4 === 0 ? "amber" : "green",
      comments: seed % 4 === 0 ? "Sampling gaps identified" : "Channels monitored",
      automated: false,
    },
    {
      id: "comms-2",
      controlArea: "Complaints Benchmarking",
      objective: "Compare vs customer sentiment score",
      sourceMethod: "Reconciliation",
      evidence: "Ratio analysis",
      result: seed % 3 === 0 ? "fail" : "pass",
      frequency: "Monthly",
      riskRating: seed % 3 === 0 ? "red" : "green",
      comments: seed % 3 === 0 ? "Complaint ratio above threshold" : "Within acceptable range",
      automated: true,
    },
    {
      id: "comms-3",
      controlArea: "Root Cause Analysis & Remediation",
      objective: "Track and address complaint root causes",
      sourceMethod: "Policy Based",
      evidence: "RCA register",
      result: seed % 5 === 0 ? "fail" : "pass",
      frequency: "Monthly",
      riskRating: seed % 5 === 0 ? "red" : "green",
      comments: seed % 5 === 0 ? "RCA register incomplete" : "RCA process effective",
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
      objective: "Identify dealer-level poor outcome trends",
      sourceMethod: "Trigger from Lender",
      evidence: "Trend chart",
      result: seed % 10 === 0 ? "partial" : "pass",
      frequency: "Triggered",
      riskRating: seed % 10 === 0 ? "amber" : "green",
      comments: seed % 10 === 0 ? "Elevated arrears pattern noted" : "Patterns within normal range",
      automated: true,
    },
  ];
}

// Calculate section summary from controls
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

// Generate key actions based on failed/partial controls
function generateKeyActions(sections: AuditSection[], dealerIndex: number): KeyAction[] {
  const actions: KeyAction[] = [];
  const owners = ["Compliance", "Digital Team", "Tech Ops", "Sales", "Risk", "Legal"];
  const dueDates = ["Immediate", "15 Nov 2025", "30 Nov 2025", "Q1 2026"];
  
  sections.forEach(section => {
    section.controls.forEach(control => {
      if (control.result === "fail" || control.result === "partial") {
        actions.push({
          id: `action-${control.id}`,
          section: section.name,
          action: `Remediate: ${control.controlArea}`,
          priority: control.riskRating === "red" ? "High" : control.riskRating === "amber" ? "Medium" : "Low",
          owner: owners[(dealerIndex + actions.length) % owners.length],
          dueDate: dueDates[control.riskRating === "red" ? 0 : control.riskRating === "amber" ? 1 : 3],
          status: control.riskRating === "red" ? "Pending" : "In Progress",
          notes: control.comments,
        });
      }
    });
  });
  
  return actions.slice(0, 8); // Limit to 8 actions for display
}

// Generate a complete dealer audit
export function generateDealerAudit(dealerName: string, dealerIndex: number): DealerAudit {
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
  
  // Calculate summaries
  sections.forEach(section => {
    section.summary = calculateSectionSummary(section.controls);
  });
  
  // Calculate overall RAG
  const allControls = sections.flatMap(s => s.controls);
  const redCount = allControls.filter(c => c.riskRating === "red").length;
  const amberCount = allControls.filter(c => c.riskRating === "amber").length;
  
  let overallRag: RagStatus = "green";
  if (redCount > 0) overallRag = "red";
  else if (amberCount > 1) overallRag = "amber";
  
  // Calculate overall score
  const passCount = allControls.filter(c => c.result === "pass").length;
  const overallScore = Math.round((passCount / allControls.length) * 100);
  
  // Customer sentiment score (6.0 - 9.5 range)
  const baseCSS = 6.0 + (seed % 35) / 10;
  const cssTrend = ((seed % 10) - 5) / 10; // -0.5 to +0.5
  
  return {
    dealerName,
    overallRag,
    overallScore,
    customerSentimentScore: Math.round(baseCSS * 10) / 10,
    customerSentimentTrend: Math.round(cssTrend * 10) / 10,
    lastAuditDate: "05 Feb 2026",
    sections,
    keyActions: generateKeyActions(sections, dealerIndex),
  };
}
