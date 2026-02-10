import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { getOverdueRechecks } from "@/utils/recheckSchedule";

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

export interface SectionAnalytics {
  id: string;
  name: string;
  shortName: string;
  green: number;
  amber: number;
  red: number;
  totalControls: number;
  passRate: number;
}

export interface TrendDataPoint {
  month: string;
  score: number;
  green: number;
  amber: number;
  red: number;
}

export interface RiskDealer {
  name: string;
  score: number;
  rag: "green" | "amber" | "red";
  lastAudit: string;
}

export interface ReportsExportData {
  dateRange: { start: Date; end: Date };
  portfolioStats: {
    total: number;
    avgScore: number;
    green: number;
    amber: number;
    red: number;
  };
  overallPassRate: number;
  totalAlerts: number;
  sectionAnalytics: SectionAnalytics[];
  trendData: TrendDataPoint[];
  topRiskDealers: RiskDealer[];
}

export function generateReportsAnalyticsPDF(data: ReportsExportData): void {
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

  // === HEADER ===
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Portfolio Analytics Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  yPosition += 8;

  // Date range subtitle
  doc.setFontSize(9);
  doc.text(
    `Data Period: ${format(data.dateRange.start, "MMM d, yyyy")} - ${format(data.dateRange.end, "MMM d, yyyy")}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  yPosition += 15;

  // === KPI SUMMARY BOX ===
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPosition, pageWidth - 28, 35, 3, 3, "F");

  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Portfolio Summary", 20, yPosition + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);

  const kpiY = yPosition + 18;
  const kpiSpacing = 45;

  // Total Dealers
  doc.text("Total Dealers", 20, kpiY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.text(data.portfolioStats.total.toString(), 20, kpiY + 8);

  // Avg Score
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text("Avg Score", 20 + kpiSpacing, kpiY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.text(`${data.portfolioStats.avgScore}%`, 20 + kpiSpacing, kpiY + 8);

  // Pass Rate
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text("Pass Rate", 20 + kpiSpacing * 2, kpiY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.text(`${data.overallPassRate}%`, 20 + kpiSpacing * 2, kpiY + 8);

  // Active Alerts
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text("Active Alerts", 20 + kpiSpacing * 3, kpiY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(RAG_COLORS.red.r, RAG_COLORS.red.g, RAG_COLORS.red.b);
  doc.setFontSize(14);
  doc.text(data.totalAlerts.toString(), 20 + kpiSpacing * 3, kpiY + 8);

  yPosition += 45;

  // === RAG DISTRIBUTION ===
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Portfolio RAG Distribution", 14, yPosition);
  yPosition += 8;

  const ragData = [
    ["Safe (Green)", data.portfolioStats.green.toString(), `${Math.round((data.portfolioStats.green / data.portfolioStats.total) * 100)}%`],
    ["Warning (Amber)", data.portfolioStats.amber.toString(), `${Math.round((data.portfolioStats.amber / data.portfolioStats.total) * 100)}%`],
    ["Critical (Red)", data.portfolioStats.red.toString(), `${Math.round((data.portfolioStats.red / data.portfolioStats.total) * 100)}%`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Status", "Count", "Percentage"]],
    body: ragData,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: 40, halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const status = data.cell.raw?.toString().toLowerCase() || "";
        if (status.includes("green")) data.cell.styles.textColor = [34, 197, 94];
        else if (status.includes("amber")) data.cell.styles.textColor = [245, 158, 11];
        else if (status.includes("red")) data.cell.styles.textColor = [239, 68, 68];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // === COMPLIANCE TREND TABLE ===
  checkPageBreak(50);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Compliance Score Trend", 14, yPosition);
  yPosition += 8;

  const trendTableData = data.trendData.map((point) => [
    point.month,
    `${point.score}%`,
    point.green.toString(),
    point.amber.toString(),
    point.red.toString(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Month", "Score", "Green", "Amber", "Red"]],
    body: trendTableData,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 30, halign: "center" },
      4: { cellWidth: 30, halign: "center" },
    },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // === SECTION BREAKDOWN ===
  checkPageBreak(60);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Audit Section Breakdown", 14, yPosition);
  yPosition += 8;

  const sectionData = data.sectionAnalytics.map((section) => [
    section.name,
    section.totalControls.toString(),
    section.green.toString(),
    section.amber.toString(),
    section.red.toString(),
    `${section.passRate}%`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Section", "Total", "Green", "Amber", "Red", "Pass Rate"]],
    body: sectionData,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 25, halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section === "body") {
        if (data.column.index === 2) data.cell.styles.textColor = [34, 197, 94];
        if (data.column.index === 3) data.cell.styles.textColor = [245, 158, 11];
        if (data.column.index === 4) data.cell.styles.textColor = [239, 68, 68];
        if (data.column.index === 5) {
          const rate = parseInt(data.cell.raw?.toString() || "0");
          if (rate >= 90) data.cell.styles.textColor = [34, 197, 94];
          else if (rate >= 70) data.cell.styles.textColor = [245, 158, 11];
          else data.cell.styles.textColor = [239, 68, 68];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // === TOP RISK DEALERS ===
  checkPageBreak(60);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Top 10 At-Risk Dealers", 14, yPosition);
  yPosition += 8;

  if (data.topRiskDealers.length > 0) {
    const riskData = data.topRiskDealers.map((dealer) => [
      dealer.name,
      dealer.score.toString(),
      dealer.rag.toUpperCase(),
      dealer.lastAudit,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Dealer", "Score", "Status", "Last Audit"]],
      body: riskData,
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 40, halign: "center" },
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
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("No at-risk dealers found.", 14, yPosition + 5);
  }

  // === OVERDUE RE-CHECKS ===
  const overdueRechecks = getOverdueRechecks();
  if (overdueRechecks.length > 0) {
    yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : yPosition + 15;
    checkPageBreak(60);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(`Overdue Re-Checks (${overdueRechecks.length})`, 14, yPosition);
    yPosition += 8;

    const recheckData = overdueRechecks.slice(0, 20).map((r) => [
      r.dealerName,
      `${r.recheckMonth}-month`,
      r.recheckDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      `${r.daysOverdue}d`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Dealer", "Re-Check", "Due Date", "Overdue"]],
      body: recheckData,
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 40, halign: "center" },
        3: { cellWidth: 25, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 3) {
          data.cell.styles.textColor = [239, 68, 68];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
  }

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | Confidential - Portfolio Analytics Report`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  const date = new Date().toISOString().split("T")[0];
  doc.save(`Portfolio_Analytics_Report_${date}.pdf`);
}
