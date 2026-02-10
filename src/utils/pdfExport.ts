import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DealerAudit, AuditSection, KeyAction } from "@/data/auditFramework";
import { getDealerRechecks, RecheckItem } from "@/utils/recheckSchedule";
import { detectDuplicates, MATCH_TYPE_LABELS } from "@/utils/duplicateDetection";
import { dealerTrends } from "@/data/trendData";

// Extend jsPDF type for autoTable
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

// RAG colors for PDF
const RAG_COLORS = {
  green: { r: 34, g: 197, b: 94 },
  amber: { r: 245, g: 158, b: 11 },
  red: { r: 239, g: 68, b: 68 },
};

export interface PassportCheckEntry {
  directorName: string;
  fileName: string;
  status: "pending" | "verified" | "rejected";
  uploadDate: string;
  expiryDate?: string;
  reviewNote?: string;
}

export interface FcaRegisterEntry {
  firmName: string;
  frn: string;
  status: string;
  statusDate?: string;
  firmType?: string;
  companiesHouseNumber?: string;
  individuals: { name: string; irn?: string; status?: string }[];
  permissions: string[];
}

export interface CreditSafeEntry {
  companyName: string;
  registrationNumber?: string;
  companyStatus?: string;
  creditScore?: string;
  creditScoreMax?: string;
  creditDescription?: string;
  creditLimit?: number;
  dbt?: number;
  ccjCount?: number;
  ccjTotal?: number;
  turnover?: number;
  equity?: number;
  riskLevel?: "Low Risk" | "Medium Risk" | "High Risk";
  previousScore?: string;
}

export function generateComplianceReportPDF(audit: DealerAudit, fcaRef: string, aiSummary?: string, passportChecks?: PassportCheckEntry[], fcaRegister?: FcaRegisterEntry, creditSafe?: CreditSafeEntry): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Helper: add new page if needed
  const checkPageBreak = (requiredSpace: number = 40) => {
    if (yPosition > doc.internal.pageSize.getHeight() - requiredSpace) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Helper: draw RAG badge
  const drawRagBadge = (x: number, y: number, status: string) => {
    const color = RAG_COLORS[status as keyof typeof RAG_COLORS] || RAG_COLORS.green;
    doc.setFillColor(color.r, color.g, color.b);
    doc.circle(x, y, 3, "F");
  };

  // === HEADER ===
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Compliance Audit Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // === DEALER INFO BOX ===
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPosition, pageWidth - 28, 30, 3, 3, "F");
  
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(audit.dealerName, 20, yPosition + 10);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`FCA Reference: ${fcaRef}`, 20, yPosition + 18);
  doc.text(`Last Audit: ${audit.lastAuditDate}`, 20, yPosition + 25);
  
  // Overall RAG indicator
  const ragLabel = audit.overallRag.charAt(0).toUpperCase() + audit.overallRag.slice(1);
  const ragColor = RAG_COLORS[audit.overallRag];
  doc.setFillColor(ragColor.r, ragColor.g, ragColor.b);
  doc.roundedRect(pageWidth - 60, yPosition + 5, 46, 20, 3, 3, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.text(`${ragLabel} - ${audit.overallScore}%`, pageWidth - 37, yPosition + 17, { align: "center" });
  
  yPosition += 40;

  // === AI EXECUTIVE SUMMARY (if available) ===
  if (aiSummary) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("AI Executive Summary", 14, yPosition);
    yPosition += 4;

    // Draw a subtle accent line
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(14, yPosition, pageWidth - 14, yPosition);
    yPosition += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50);

    // Strip markdown headers and format as plain text sections
    const lines = aiSummary.split("\n");
    for (const line of lines) {
      checkPageBreak(12);
      const trimmed = line.trim();
      if (!trimmed) {
        yPosition += 3;
        continue;
      }
      // Render markdown headers as bold section titles
      if (trimmed.startsWith("## ")) {
        yPosition += 3;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(trimmed.replace("## ", ""), 14, yPosition);
        yPosition += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(50);
        continue;
      }
      // Render bullet points
      const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
      const text = isBullet ? trimmed.slice(2) : trimmed;
      const xOffset = isBullet ? 20 : 14;
      const maxWidth = pageWidth - xOffset - 14;
      
      // Strip bold markers
      const cleanText = text.replace(/\*\*/g, "");
      const splitLines = doc.splitTextToSize(cleanText, maxWidth);
      
      for (let i = 0; i < splitLines.length; i++) {
        checkPageBreak(8);
        if (i === 0 && isBullet) {
          doc.text("•", 16, yPosition);
        }
        doc.text(splitLines[i], xOffset, yPosition);
        yPosition += 4.5;
      }
    }
    yPosition += 8;
  }

  // === CUSTOMER SENTIMENT ===
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Sentiment Score", 14, yPosition);
  yPosition += 8;
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  const trendSymbol = audit.customerSentimentTrend > 0 ? "↑" : audit.customerSentimentTrend < 0 ? "↓" : "";
  doc.text(`${audit.customerSentimentScore.toFixed(1)}/10 ${trendSymbol}${Math.abs(audit.customerSentimentTrend).toFixed(1)}`, 14, yPosition + 8);
  yPosition += 20;

  // === REPORT SUMMARY TABLE ===
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Report Summary", 14, yPosition);
  yPosition += 6;

  const summaryData = audit.sections.map(section => [
    section.name,
    section.summary.green.toString(),
    section.summary.amber.toString(),
    section.summary.red.toString(),
    section.summary.ragStatus.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Section", "Green", "Amber", "Red", "Status"]],
    body: summaryData,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 30, halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const status = data.cell.raw?.toString().toLowerCase() || "";
        if (status === "green") data.cell.styles.textColor = [34, 197, 94];
        else if (status === "amber") data.cell.styles.textColor = [245, 158, 11];
        else if (status === "red") data.cell.styles.textColor = [239, 68, 68];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // === 12-MONTH SCORE TREND ===
  const trend = dealerTrends.find((t) => t.dealerName === audit.dealerName);
  if (trend && trend.history.length > 0) {
    checkPageBreak(70);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("12-Month Score Trend", 14, yPosition);
    yPosition += 4;

    const changeLabel = trend.changeFromStart > 0
      ? `+${trend.changeFromStart}pts`
      : `${trend.changeFromStart}pts`;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Change over period: ${changeLabel}`, 14, yPosition + 4);
    yPosition += 10;

    const trendData = trend.history.map((h) => [
      h.month,
      h.score.toString(),
      h.rag.toUpperCase(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Month", "Score", "Status"]],
      body: trendData,
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 25, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const status = data.cell.raw?.toString().toLowerCase() || "";
          if (status === "green") data.cell.styles.textColor = [34, 197, 94];
          else if (status === "amber") data.cell.styles.textColor = [245, 158, 11];
          else if (status === "red") data.cell.styles.textColor = [239, 68, 68];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    // Draw a mini inline bar chart of scores
    const chartY = doc.lastAutoTable.finalY + 8;
    const chartX = 14;
    const chartW = pageWidth - 28;
    const barW = chartW / trend.history.length - 2;
    const maxBarH = 25;

    checkPageBreak(maxBarH + 20);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Score Trend (visual)", 14, chartY);

    const barStartY = chartY + 4;

    // Threshold lines
    const greenLineY = barStartY + maxBarH - (maxBarH * 80) / 100;
    const amberLineY = barStartY + maxBarH - (maxBarH * 55) / 100;
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.3);
    doc.line(chartX, greenLineY, chartX + chartW, greenLineY);
    doc.setDrawColor(245, 158, 11);
    doc.line(chartX, amberLineY, chartX + chartW, amberLineY);

    trend.history.forEach((h, i) => {
      const barH = (maxBarH * h.score) / 100;
      const x = chartX + i * (barW + 2);
      const y = barStartY + maxBarH - barH;
      const c = RAG_COLORS[h.rag];
      doc.setFillColor(c.r, c.g, c.b);
      doc.rect(x, y, barW, barH, "F");
    });

    yPosition = barStartY + maxBarH + 10;
  }

  // === SECTION COMPLIANCE RATES ===
  checkPageBreak(60);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Section Compliance Rates", 14, yPosition);
  yPosition += 6;

  const complianceData = audit.sections.map((s) => {
    const total = s.summary.green + s.summary.amber + s.summary.red;
    const passRate = total > 0 ? Math.round((s.summary.green / total) * 100) : 0;
    return [
      s.name,
      s.summary.green.toString(),
      s.summary.amber.toString(),
      s.summary.red.toString(),
      total.toString(),
      `${passRate}%`,
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [["Section", "Pass", "Attention", "Fail", "Total", "Pass Rate"]],
    body: complianceData,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 25, halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 5) {
        const rate = parseInt(data.cell.raw?.toString() || "0");
        if (rate >= 80) data.cell.styles.textColor = [34, 197, 94];
        else if (rate >= 55) data.cell.styles.textColor = [245, 158, 11];
        else data.cell.styles.textColor = [239, 68, 68];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
  yPosition = doc.lastAutoTable.finalY + 15;

  // === ACTION STATUS BREAKDOWN ===
  if (audit.keyActions.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Action Status Breakdown", 14, yPosition);
    yPosition += 6;

    const statusCounts: Record<string, number> = {};
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    audit.keyActions.forEach((a) => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
      priorityCounts[a.priority] = (priorityCounts[a.priority] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => [
        status,
        count.toString(),
        `${Math.round((count / audit.keyActions.length) * 100)}%`,
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Status", "Count", "% of Total"]],
      body: statusData,
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 30, halign: "center" },
      },
    });
    yPosition = doc.lastAutoTable.finalY + 8;

    // Priority summary line
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(
      `Priority: High ${priorityCounts.High} | Medium ${priorityCounts.Medium} | Low ${priorityCounts.Low}`,
      14,
      yPosition
    );
    yPosition += 12;
  }

  // === KEY ACTIONS ===
  checkPageBreak(50);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Key Actions", 14, yPosition);
  yPosition += 6;

  if (audit.keyActions.length > 0) {
    const actionsData = audit.keyActions.map(action => [
      action.section,
      action.action,
      action.priority,
      action.owner,
      action.dueDate,
      action.status,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Section", "Action", "Priority", "Owner", "Due Date", "Status"]],
      body: actionsData,
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 50 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const priority = data.cell.raw?.toString() || "";
          if (priority === "High") data.cell.styles.textColor = [239, 68, 68];
          else if (priority === "Medium") data.cell.styles.textColor = [245, 158, 11];
        }
      },
    });
    yPosition = doc.lastAutoTable.finalY + 15;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("No outstanding actions.", 14, yPosition + 5);
    yPosition += 15;
  }

  // === RE-CHECK SCHEDULE ===
  const rechecks = getDealerRechecks(audit.dealerName);
  if (rechecks.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Re-Check Schedule", 14, yPosition);
    yPosition += 6;

    const overdueCount = rechecks.filter((r) => r.isOverdue).length;
    if (overdueCount > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(RAG_COLORS.red.r, RAG_COLORS.red.g, RAG_COLORS.red.b);
      doc.text(`${overdueCount} overdue re-check${overdueCount > 1 ? "s" : ""} require attention`, 14, yPosition + 4);
      yPosition += 10;
    }

    const recheckData = rechecks
      .sort((a, b) => a.recheckMonth - b.recheckMonth)
      .map((r) => [
        `${r.recheckMonth}-Month`,
        r.recheckDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        r.isOverdue ? `${r.daysOverdue} days overdue` : r.status === "due-soon" ? `${Math.abs(r.daysOverdue)} days remaining` : "Upcoming",
        r.isOverdue ? "OVERDUE" : r.status === "due-soon" ? "DUE SOON" : "SCHEDULED",
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Re-Check", "Due Date", "Timeline", "Status"]],
      body: recheckData,
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 45, halign: "center" },
        2: { cellWidth: 50, halign: "center" },
        3: { cellWidth: 35, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 3) {
          const status = data.cell.raw?.toString() || "";
          if (status === "OVERDUE") {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = "bold";
          } else if (status === "DUE SOON") {
            data.cell.styles.textColor = [245, 158, 11];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // === DUPLICATE FLAGS ===
  const allDuplicates = detectDuplicates();
  const dealerDuplicates = allDuplicates.filter((g) =>
    g.dealers.some((d) => d.name === audit.dealerName)
  );
  if (dealerDuplicates.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Duplicate Flags", 14, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(RAG_COLORS.amber.r, RAG_COLORS.amber.g, RAG_COLORS.amber.b);
    doc.text(`${dealerDuplicates.length} potential duplicate${dealerDuplicates.length > 1 ? "s" : ""} detected — review recommended`, 14, yPosition + 4);
    yPosition += 10;

    const dupData = dealerDuplicates.map((g) => [
      MATCH_TYPE_LABELS[g.matchType],
      g.matchValue,
      g.dealers.filter((d) => d.name !== audit.dealerName).map((d) => d.name).join(", "),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Match Type", "Shared Value", "Matching Dealer(s)"]],
      body: dupData,
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { cellWidth: 75 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          data.cell.styles.textColor = [245, 158, 11];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // === DIRECTOR PASSPORT / ID VERIFICATION ===
  if (passportChecks && passportChecks.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Director Passport / ID Verification", 14, yPosition);
    yPosition += 4;

    const verifiedCount = passportChecks.filter((p) => p.status === "verified").length;
    const pendingCount = passportChecks.filter((p) => p.status === "pending").length;
    const rejectedCount = passportChecks.filter((p) => p.status === "rejected").length;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(
      `${passportChecks.length} document${passportChecks.length !== 1 ? "s" : ""}: ${verifiedCount} verified, ${pendingCount} pending, ${rejectedCount} rejected`,
      14,
      yPosition + 4
    );
    yPosition += 10;

    const passportData = passportChecks.map((p) => [
      p.directorName,
      p.fileName,
      p.status.toUpperCase(),
      p.uploadDate,
      p.expiryDate || "—",
      p.reviewNote || "—",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Director", "Document", "Status", "Uploaded", "Expiry", "Review Note"]],
      body: passportData,
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 25, halign: "center" },
        4: { cellWidth: 25, halign: "center" },
        5: { cellWidth: 30 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const status = data.cell.raw?.toString().toLowerCase() || "";
          if (status === "verified") data.cell.styles.textColor = [34, 197, 94];
          else if (status === "pending") data.cell.styles.textColor = [245, 158, 11];
          else if (status === "rejected") data.cell.styles.textColor = [239, 68, 68];
          data.cell.styles.fontStyle = "bold";
        }
        // Highlight expired dates
        if (data.section === "body" && data.column.index === 4) {
          const val = data.cell.raw?.toString() || "";
          if (val !== "—" && new Date(val) < new Date()) {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // === FCA REGISTER STATUS ===
  if (fcaRegister) {
    checkPageBreak(60);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("FCA Register Status", 14, yPosition);
    yPosition += 4;

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(14, yPosition, pageWidth - 14, yPosition);
    yPosition += 8;

    // Firm summary box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, yPosition, pageWidth - 28, 24, 3, 3, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(fcaRegister.firmName, 20, yPosition + 7);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(`FRN: ${fcaRegister.frn}`, 20, yPosition + 14);

    const statusText = fcaRegister.status;
    const isAuthorised = statusText.toLowerCase().includes("authorised") || statusText.toLowerCase().includes("registered");
    const statusColor = isAuthorised ? RAG_COLORS.green : RAG_COLORS.red;
    doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
    doc.roundedRect(pageWidth - 70, yPosition + 4, 50, 14, 2, 2, "F");
    doc.setTextColor(255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(statusText, pageWidth - 45, yPosition + 13, { align: "center" });

    yPosition += 30;

    // Additional firm details
    doc.setTextColor(80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const details: string[] = [];
    if (fcaRegister.firmType) details.push(`Firm Type: ${fcaRegister.firmType}`);
    if (fcaRegister.companiesHouseNumber) details.push(`Companies House: ${fcaRegister.companiesHouseNumber}`);
    if (fcaRegister.statusDate) details.push(`Status Effective: ${fcaRegister.statusDate}`);
    if (details.length > 0) {
      doc.text(details.join("  |  "), 14, yPosition);
      yPosition += 8;
    }

    // Approved Individuals
    if (fcaRegister.individuals.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text(`Approved Individuals (${fcaRegister.individuals.length})`, 14, yPosition);
      yPosition += 6;

      const indData = fcaRegister.individuals.slice(0, 30).map((ind) => [
        ind.name,
        ind.irn || "—",
        ind.status || "—",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Name", "IRN", "Status"]],
        body: indData,
        theme: "striped",
        headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 40, halign: "center" },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 2) {
            const status = data.cell.raw?.toString().toLowerCase() || "";
            if (status.includes("active") || status.includes("current")) data.cell.styles.textColor = [34, 197, 94];
            else if (status.includes("inactive") || status.includes("withdrawn")) data.cell.styles.textColor = [239, 68, 68];
          }
        },
      });

      yPosition = doc.lastAutoTable.finalY + 8;

      if (fcaRegister.individuals.length > 30) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100);
        doc.text(`+ ${fcaRegister.individuals.length - 30} more individuals (see FCA Register for full list)`, 14, yPosition);
        yPosition += 6;
      }
    }

    // Permissions
    if (fcaRegister.permissions.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text(`Permissions (${fcaRegister.permissions.length})`, 14, yPosition);
      yPosition += 6;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);

      const permText = fcaRegister.permissions.join("  •  ");
      const permLines = doc.splitTextToSize(permText, pageWidth - 28);
      for (const line of permLines) {
        checkPageBreak(8);
        doc.text(line, 14, yPosition);
        yPosition += 4.5;
      }
      yPosition += 8;
    }

    yPosition += 5;
  }

  // === CREDITSAFE CREDIT SCORE SUMMARY ===
  if (creditSafe) {
    checkPageBreak(70);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("CreditSafe Credit Score Summary", 14, yPosition);
    yPosition += 4;

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(14, yPosition, pageWidth - 14, yPosition);
    yPosition += 8;

    // Company header box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, yPosition, pageWidth - 28, 24, 3, 3, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(creditSafe.companyName, 20, yPosition + 7);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    const compDetails: string[] = [];
    if (creditSafe.registrationNumber) compDetails.push(`Reg: ${creditSafe.registrationNumber}`);
    if (creditSafe.companyStatus) compDetails.push(creditSafe.companyStatus);
    doc.text(compDetails.join("  ·  "), 20, yPosition + 14);

    // Risk badge
    if (creditSafe.riskLevel) {
      const riskColor = creditSafe.riskLevel === "Low Risk" ? RAG_COLORS.green : creditSafe.riskLevel === "Medium Risk" ? RAG_COLORS.amber : RAG_COLORS.red;
      doc.setFillColor(riskColor.r, riskColor.g, riskColor.b);
      doc.roundedRect(pageWidth - 65, yPosition + 4, 45, 14, 2, 2, "F");
      doc.setTextColor(255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(creditSafe.riskLevel, pageWidth - 42.5, yPosition + 13, { align: "center" });
    }

    yPosition += 30;

    // Key metrics table
    const metricsData: string[][] = [];
    metricsData.push(["Credit Score", creditSafe.creditScore ? `${creditSafe.creditScore} / ${creditSafe.creditScoreMax || "100"}` : "N/A"]);
    if (creditSafe.previousScore) metricsData.push(["Previous Score", creditSafe.previousScore]);
    metricsData.push(["Credit Limit", creditSafe.creditLimit ? `£${creditSafe.creditLimit.toLocaleString()}` : "N/A"]);
    metricsData.push(["DBT (Days Beyond Terms)", creditSafe.dbt !== undefined ? `${creditSafe.dbt} days` : "N/A"]);
    metricsData.push(["CCJs", creditSafe.ccjCount !== undefined ? `${creditSafe.ccjCount}${creditSafe.ccjTotal ? ` (£${creditSafe.ccjTotal.toLocaleString()})` : ""}` : "N/A"]);
    if (creditSafe.turnover) metricsData.push(["Turnover", `£${creditSafe.turnover.toLocaleString()}`]);
    if (creditSafe.equity) metricsData.push(["Shareholders' Equity", `£${creditSafe.equity.toLocaleString()}`]);
    if (creditSafe.creditDescription) metricsData.push(["Rating Description", creditSafe.creditDescription]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: metricsData,
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold" },
        1: { cellWidth: 100 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          const metric = data.row.cells[0]?.raw?.toString() || "";
          const val = data.cell.raw?.toString() || "";
          if (metric === "Credit Score" && val !== "N/A") {
            const score = parseInt(val);
            if (score >= 71) data.cell.styles.textColor = [34, 197, 94];
            else if (score >= 40) data.cell.styles.textColor = [245, 158, 11];
            else data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = "bold";
          }
          if (metric.startsWith("DBT") && val !== "N/A") {
            const dbtVal = parseInt(val);
            if (dbtVal > 30) data.cell.styles.textColor = [239, 68, 68];
            else if (dbtVal > 14) data.cell.styles.textColor = [245, 158, 11];
          }
          if (metric === "CCJs" && val !== "N/A" && !val.startsWith("0")) {
            data.cell.styles.textColor = [239, 68, 68];
          }
        }
      },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // === DETAILED AUDIT SECTIONS ===
  audit.sections.forEach((section) => {
    checkPageBreak(60);
    
    // Section header
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    
    const sectionRagColor = RAG_COLORS[section.summary.ragStatus];
    doc.setFillColor(sectionRagColor.r, sectionRagColor.g, sectionRagColor.b);
    doc.circle(18, yPosition - 2, 3, "F");
    doc.text(section.name, 24, yPosition);
    yPosition += 6;

    // Controls table
    const controlsData = section.controls.map(control => [
      control.controlArea,
      control.objective.length > 50 ? control.objective.substring(0, 47) + "..." : control.objective,
      control.result.toUpperCase(),
      control.riskRating.toUpperCase(),
      control.automated ? "Auto" : "Manual",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Control Area", "Objective", "Result", "Risk", "Type"]],
      body: controlsData,
      theme: "striped",
      headStyles: { fillColor: [71, 85, 105], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 20, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.section === "body") {
          // Color result column
          if (data.column.index === 2) {
            const result = data.cell.raw?.toString().toLowerCase() || "";
            if (result === "pass") data.cell.styles.textColor = [34, 197, 94];
            else if (result === "partial") data.cell.styles.textColor = [245, 158, 11];
            else if (result === "fail") data.cell.styles.textColor = [239, 68, 68];
          }
          // Color risk column
          if (data.column.index === 3) {
            const risk = data.cell.raw?.toString().toLowerCase() || "";
            if (risk === "green") data.cell.styles.textColor = [34, 197, 94];
            else if (risk === "amber") data.cell.styles.textColor = [245, 158, 11];
            else if (risk === "red") data.cell.styles.textColor = [239, 68, 68];
          }
        }
      },
    });

    yPosition = doc.lastAutoTable.finalY + 12;
  });

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | Confidential - ${audit.dealerName} Compliance Report`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  const sanitizedName = audit.dealerName.replace(/[^a-zA-Z0-9]/g, "_");
  const date = new Date().toISOString().split("T")[0];
  doc.save(`${sanitizedName}_Compliance_Report_${date}.pdf`);
}
