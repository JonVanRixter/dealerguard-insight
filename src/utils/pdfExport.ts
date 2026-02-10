import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DealerAudit, AuditSection, KeyAction } from "@/data/auditFramework";
import { getDealerRechecks, RecheckItem } from "@/utils/recheckSchedule";

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

export function generateComplianceReportPDF(audit: DealerAudit, fcaRef: string, aiSummary?: string): void {
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
