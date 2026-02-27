import { tcgDealers } from "./dealers";

export interface TcgTeamMember {
  name: string;
  role: string;
  email: string;
}

export interface TcgLender {
  id: string;
  name: string;
  shortName: string;
  contactEmail: string;
  contactName: string;
  billingAddress: string;
  status: "Active" | "Inactive";
  createdDate: string;
  lastLogin: string;
  teamMembers: TcgTeamMember[];
}

export const tcgLenders: TcgLender[] = [
  {
    id: "l001",
    name: "Apex Motor Finance",
    shortName: "Apex",
    contactEmail: "compliance@apexmotorfinance.co.uk",
    contactName: "Sarah Jenkins",
    billingAddress: "14 City Road, London, EC1V 2NX",
    status: "Active",
    createdDate: "2025-06-01",
    lastLogin: "2026-02-23T09:14:00",
    teamMembers: [
      { name: "Sarah Jenkins", role: "Compliance Lead", email: "s.jenkins@apexmotorfinance.co.uk" },
      { name: "Mark Davies", role: "Risk Analyst", email: "m.davies@apexmotorfinance.co.uk" },
    ],
  },
  {
    id: "l002",
    name: "Sterling Auto Credit",
    shortName: "Sterling",
    contactEmail: "compliance@sterlingautocredit.co.uk",
    contactName: "James Whitaker",
    billingAddress: "22 Deansgate, Manchester, M3 1RH",
    status: "Active",
    createdDate: "2025-07-15",
    lastLogin: "2026-02-25T14:32:00",
    teamMembers: [
      { name: "James Whitaker", role: "Head of Compliance", email: "j.whitaker@sterlingautocredit.co.uk" },
    ],
  },
  {
    id: "l003",
    name: "Northern Vehicle Finance",
    shortName: "Northern",
    contactEmail: "ops@northernvehiclefinance.co.uk",
    contactName: "Fiona Campbell",
    billingAddress: "8 St Vincent Street, Glasgow, G2 5TS",
    status: "Active",
    createdDate: "2025-08-10",
    lastLogin: "2026-02-20T11:05:00",
    teamMembers: [
      { name: "Fiona Campbell", role: "Operations Manager", email: "f.campbell@northernvehiclefinance.co.uk" },
      { name: "Alistair Reid", role: "Compliance Officer", email: "a.reid@northernvehiclefinance.co.uk" },
    ],
  },
];

export function getLenderName(id: string): string {
  return tcgLenders.find((l) => l.id === id)?.name ?? id;
}

/** Compute lender-level dealer stats from the TCG dealer pool */
export function getLenderDealerStats(lenderId: string) {
  const lenderDealers = tcgDealers.filter((d) =>
    d.onboarding.lendersUsing.includes(lenderId)
  );
  const scores = lenderDealers.map((d) => d.score);
  return {
    dealerCount: lenderDealers.length,
    avgScore: scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0,
    scoreRange: scores.length
      ? `${Math.min(...scores)} – ${Math.max(...scores)}`
      : "—",
  };
}
