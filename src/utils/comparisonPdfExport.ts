import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DealerBenchmarkData } from "@/pages/Comparison";

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

export function generateComparisonPDF(data: DealerBenchmarkData): void {
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
  doc.text("Dealer Comparison Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
    pageWidth / 2, yPosition, { align: "center" }
  );
  yPosition += 8;

  const modeLabel = data.mode === "dealer"
    ? `${data.dealerName} vs ${data.comparisonName}`
    : `${data.dealerName} vs Portfolio Average`;
  doc.setFontSize(9);
  doc.text(modeLabel, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // === SCORE SUMMARY BOX ===
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPosition, pageWidth - 28, 35, 3, 3, "F");

  const colWidth = (pageWidth - 28) / 3;

  // Dealer score
  doc.setTextColor(80);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(data.dealerName, 20, yPosition + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const dealerRag = RAG_COLORS[data.dealerRag];
  doc.setTextColor(dealerRag.r, dealerRag.g, dealerRag.b);
  doc.text(`${data.dealerScore}%`, 20, yPosition + 22);

  // Comparison score
  doc.setTextColor(80);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(data.comparisonName, 20 + colWidth, yPosition + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  if (data.comparisonRag) {
    const compRag = RAG_COLORS[data.comparisonRag];
    doc.setTextColor(compRag.r, compRag.g, compRag.b);
  } else {
    doc.setTextColor(0);
  }
  doc.text(`${data.comparisonScore}%`, 20 + colWidth, yPosition + 22);

  // Difference
  doc.setTextColor(80);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Difference", 20 + colWidth * 2, yPosition + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const diffColor = data.scoreDifference > 0 ? RAG_COLORS.green : data.scoreDifference < 0 ? RAG_COLORS.red : { r: 100, g: 100, b: 100 };
  doc.setTextColor(diffColor.r, diffColor.g, diffColor.b);
  doc.text(`${data.scoreDifference > 0 ? "+" : ""}${data.scoreDifference}%`, 20 + colWidth * 2, yPosition + 22);

  yPosition += 45;

  // === SECTION COMPARISON TABLE ===
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Section-by-Section Comparison", 14, yPosition);
  yPosition += 8;

  const dealerLabel = data.dealerName.split(" ").slice(0, 3).join(" ");
  const compLabel = data.mode === "dealer" ? data.comparisonName.split(" ").slice(0, 3).join(" ") : "Portfolio Avg";

  const tableData = data.sectionBenchmarks.map((s) => [
    s.name,
    `${s.dealerPassRate}%`,
    `${s.comparisonPassRate}%`,
    `${s.difference > 0 ? "+" : ""}${s.difference}%`,
    s.difference > 5 ? "Ahead" : s.difference < -5 ? "Behind" : "On Par",
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Section", dealerLabel, compLabel, "Difference", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 30, halign: "center" },
      4: { cellWidth: 30, halign: "center" },
    },
    didParseCell: (cellData) => {
      if (cellData.section === "body") {
        if (cellData.column.index === 3) {
          const val = parseInt(cellData.cell.raw?.toString() || "0");
          if (val > 0) cellData.cell.styles.textColor = [34, 197, 94];
          else if (val < 0) cellData.cell.styles.textColor = [239, 68, 68];
          cellData.cell.styles.fontStyle = "bold";
        }
        if (cellData.column.index === 4) {
          const status = cellData.cell.raw?.toString() || "";
          if (status === "Ahead") cellData.cell.styles.textColor = [34, 197, 94];
          else if (status === "Behind") cellData.cell.styles.textColor = [239, 68, 68];
          cellData.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // === SUMMARY STATS ===
  checkPageBreak(50);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Performance Summary", 14, yPosition);
  yPosition += 10;

  const ahead = data.sectionBenchmarks.filter((s) => s.difference > 0).length;
  const behind = data.sectionBenchmarks.filter((s) => s.difference < 0).length;
  const onPar = data.sectionBenchmarks.filter((s) => s.difference === 0).length;
  const avgDiff = Math.round(data.sectionBenchmarks.reduce((sum, s) => sum + s.difference, 0) / data.sectionBenchmarks.length);
  const bestSection = [...data.sectionBenchmarks].sort((a, b) => b.difference - a.difference)[0];
  const worstSection = [...data.sectionBenchmarks].sort((a, b) => a.difference - b.difference)[0];

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const stats = [
    `Sections Ahead: ${ahead} / ${data.sectionBenchmarks.length}`,
    `Sections Behind: ${behind} / ${data.sectionBenchmarks.length}`,
    `Sections On Par: ${onPar} / ${data.sectionBenchmarks.length}`,
    `Average Difference: ${avgDiff > 0 ? "+" : ""}${avgDiff}%`,
    `Strongest Section: ${bestSection.name} (+${bestSection.difference}%)`,
    `Weakest Section: ${worstSection.name} (${worstSection.difference > 0 ? "+" : ""}${worstSection.difference}%)`,
  ];

  stats.forEach((stat) => {
    doc.text(`• ${stat}`, 20, yPosition);
    yPosition += 7;
  });

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | Confidential - Dealer Comparison Report`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  const sanitizedName = data.dealerName.replace(/[^a-zA-Z0-9]/g, "_");
  const date = new Date().toISOString().split("T")[0];
  doc.save(`${sanitizedName}_Comparison_Report_${date}.pdf`);
}
