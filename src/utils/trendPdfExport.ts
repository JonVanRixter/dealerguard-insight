import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PortfolioTrendPoint, DealerTrend } from "@/data/trendData";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

const RAG_COLORS = {
  green: { r: 34, g: 197, b: 94 },
  amber: { r: 245, g: 158, b: 11 },
  red: { r: 239, g: 68, b: 68 },
};

interface TrendExportData {
  portfolioTrend: PortfolioTrendPoint[];
  topImprovers: DealerTrend[];
  topDecliners: DealerTrend[];
}

export function generateTrendPDF(data: TrendExportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  const checkPageBreak = (requiredSpace: number = 40) => {
    if (yPosition > doc.internal.pageSize.getHeight() - requiredSpace) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // === HEADER ===
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Trend Analysis Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
    pageWidth / 2, yPosition, { align: "center" }
  );
  yPosition += 8;

  const first = data.portfolioTrend[0];
  const last = data.portfolioTrend[data.portfolioTrend.length - 1];
  doc.setFontSize(9);
  doc.text(`Period: ${first.month} – ${last.month}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // === KPI SUMMARY BOX ===
  const scoreChange = last.avgScore - first.avgScore;
  const highChange = last.highCount - first.highCount;
  const lowChange = last.lowCount - first.lowCount;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPosition, pageWidth - 28, 35, 3, 3, "F");

  const colW = (pageWidth - 28) / 4;

  const drawKPI = (x: number, label: string, value: string, color?: { r: number; g: number; b: number }) => {
    doc.setTextColor(80);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(label, x, yPosition + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    if (color) doc.setTextColor(color.r, color.g, color.b);
    else doc.setTextColor(0);
    doc.text(value, x, yPosition + 22);
  };

  drawKPI(20, "Current Avg", `${last.avgScore}%`);
  drawKPI(20 + colW, "12-Month Δ", `${scoreChange > 0 ? "+" : ""}${scoreChange}%`, scoreChange > 0 ? RAG_COLORS.green : scoreChange < 0 ? RAG_COLORS.red : undefined);
  drawKPI(20 + colW * 2, "80–100 Δ", `${highChange > 0 ? "+" : ""}${highChange}`, highChange > 0 ? RAG_COLORS.green : highChange < 0 ? RAG_COLORS.red : undefined);
  drawKPI(20 + colW * 3, "0–54 Δ", `${lowChange > 0 ? "+" : ""}${lowChange}`, lowChange > 0 ? RAG_COLORS.red : lowChange < 0 ? RAG_COLORS.green : undefined);

  yPosition += 45;

  // === PORTFOLIO TREND TABLE ===
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Portfolio Score Trend", 14, yPosition);
  yPosition += 8;

  autoTable(doc, {
    startY: yPosition,
    head: [["Month", "Avg Score", "80–100", "55–79", "0–54"]],
    body: data.portfolioTrend.map((p) => [
      p.month, `${p.avgScore}%`, p.highCount.toString(), p.midCount.toString(), p.lowCount.toString(),
    ]),
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
    didParseCell: (cellData) => {
      if (cellData.section === "body") {
        if (cellData.column.index === 2) cellData.cell.styles.textColor = [34, 197, 94];
        if (cellData.column.index === 3) cellData.cell.styles.textColor = [245, 158, 11];
        if (cellData.column.index === 4) cellData.cell.styles.textColor = [239, 68, 68];
      }
    },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // === TOP IMPROVERS ===
  checkPageBreak(60);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Top 10 Improvers", 14, yPosition);
  yPosition += 8;

  autoTable(doc, {
    startY: yPosition,
    head: [["Dealer", "Current Score", "Change", "Status"]],
    body: data.topImprovers.map((d) => [
      d.dealerName, `${d.currentScore}%`, `+${d.changeFromStart}%`, d.trend.toUpperCase(),
    ]),
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 30, halign: "center" },
    },
    didParseCell: (cellData) => {
      if (cellData.section === "body") {
        if (cellData.column.index === 2) cellData.cell.styles.textColor = [34, 197, 94];
        if (cellData.column.index === 3) {
          const s = cellData.cell.raw?.toString().toLowerCase() || "";
          if (s === "green") cellData.cell.styles.textColor = [34, 197, 94];
          else if (s === "amber") cellData.cell.styles.textColor = [245, 158, 11];
          else if (s === "red") cellData.cell.styles.textColor = [239, 68, 68];
          cellData.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // === TOP DECLINERS ===
  checkPageBreak(60);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Top 10 Decliners", 14, yPosition);
  yPosition += 8;

  autoTable(doc, {
    startY: yPosition,
    head: [["Dealer", "Current Score", "Change", "Status"]],
    body: data.topDecliners.map((d) => [
      d.dealerName, `${d.currentScore}%`, `${d.changeFromStart > 0 ? "+" : ""}${d.changeFromStart}%`, d.trend.toUpperCase(),
    ]),
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 30, halign: "center" },
    },
    didParseCell: (cellData) => {
      if (cellData.section === "body") {
        if (cellData.column.index === 2) {
          const val = parseInt(cellData.cell.raw?.toString() || "0");
          cellData.cell.styles.textColor = val < 0 ? [239, 68, 68] : [34, 197, 94];
        }
        if (cellData.column.index === 3) {
          const s = cellData.cell.raw?.toString().toLowerCase() || "";
          if (s === "green") cellData.cell.styles.textColor = [34, 197, 94];
          else if (s === "amber") cellData.cell.styles.textColor = [245, 158, 11];
          else if (s === "red") cellData.cell.styles.textColor = [239, 68, 68];
          cellData.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | Confidential - Trend Analysis Report`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  const date = new Date().toISOString().split("T")[0];
  doc.save(`Trend_Analysis_Report_${date}.pdf`);
}
