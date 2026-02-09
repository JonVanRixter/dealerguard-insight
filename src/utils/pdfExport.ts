import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DealerAudit, AuditSection, KeyAction } from "@/data/auditFramework";

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

export function generateComplianceReportPDF(audit: DealerAudit, fcaRef: string): void {
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
