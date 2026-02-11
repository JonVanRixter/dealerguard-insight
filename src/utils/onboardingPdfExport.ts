import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

interface OnboardingPdfData {
  dealerName: string;
  companyNumber: string;
  screeningDataMap: Record<string, string>;
  checklistProgress: Record<string, boolean[]>;
  sections: { key: string; title: string; items: { label: string }[] }[];
}

const LABEL_MAP: Record<string, string> = {
  companyRegNo: "Company Registration No",
  registeredAddress: "Registered Address",
  vatRegistration: "VAT Registration",
  creditScore: "Credit Score",
  companyName: "Company Name",
  fcaFrn: "FCA Reference",
  fcaPermissions: "FCA Permissions",
  fcaIndividuals: "FCA Individuals",
};

export function generateOnboardingPdf(data: OnboardingPdfData): void {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  let y = 20;

  const checkPage = (h = 40) => {
    if (y > doc.internal.pageSize.getHeight() - h) { doc.addPage(); y = 20; }
  };

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Onboarding Application Pack", pw / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`, pw / 2, y, { align: "center" });
  y += 12;

  // Dealer info box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pw - 28, 20, 3, 3, "F");
  doc.setTextColor(0);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(data.dealerName || "Unnamed Dealer", 20, y + 9);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  if (data.companyNumber) doc.text(`Co. #${data.companyNumber}`, 20, y + 16);
  y += 28;

  // Screening data summary
  const entries = Object.entries(data.screeningDataMap).filter(([, v]) => v);
  if (entries.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Screening Data Summary", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: entries.map(([k, v]) => [LABEL_MAP[k] || k, v]),
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  // Checklist progress per section
  for (const section of data.sections) {
    checkPage(50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(section.title, 14, y);
    y += 6;

    const checks = data.checklistProgress[section.key] || [];
    const rows = section.items.map((item, i) => [
      item.label,
      checks[i] ? "✓" : "—",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Item", "Status"]],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 25, halign: "center" },
      },
      didParseCell: (d) => {
        if (d.section === "body" && d.column.index === 1) {
          d.cell.styles.textColor = d.cell.raw === "✓" ? [34, 197, 94] : [180, 180, 180];
          d.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Overall progress
  checkPage(30);
  const totalItems = data.sections.reduce((s, sec) => s + sec.items.length, 0);
  const doneItems = data.sections.reduce((s, sec) => {
    const ch = data.checklistProgress[sec.key] || [];
    return s + ch.filter(Boolean).length;
  }, 0);
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`Overall Progress: ${doneItems}/${totalItems} (${pct}%)`, 14, y);

  doc.save(`${data.dealerName || "onboarding"}-application-pack.pdf`);
}
