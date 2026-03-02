import { tcgDealers } from "./dealers";
import { generateLenders, type GeneratedLender } from "./seedGenerator";

export interface TcgTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  status: "Active" | "Invited";
  lastLogin: string | null;
}

export interface TcgActivityEntry {
  date: string;
  user: string;
  action: string;
}

export interface TcgLender {
  id: string;
  name: string;
  tradingName: string;
  status: "Active" | "Inactive" | "Pending Activation";
  contractStart: string;
  billingAddress: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  fcaFirmRef: string;
  companiesHouseNo: string;
  dealerCount: number;
  avgPortfolioScore: number | null;
  scoreRange: { min: number; max: number } | null;
  pendingAlerts: number;
  openActions: number;
  lastLogin: string | null;
  lastLoginUser: string | null;
  teamMembers: TcgTeamMember[];
  recentActivity: TcgActivityEntry[];
}

export const tcgLenders: TcgLender[] = [
  {
    id: "l001",
    name: "Apex Motor Finance Ltd",
    tradingName: "Apex Motor Finance",
    status: "Active",
    contractStart: "2025-06-01",
    billingAddress: "14 City Road, London, EC1V 2NX",
    contactName: "Sarah Jenkins",
    contactEmail: "s.jenkins@apexmotorfinance.co.uk",
    contactPhone: "020 7946 0123",
    fcaFirmRef: "812044",
    companiesHouseNo: "09134872",
    dealerCount: 11,
    avgPortfolioScore: 66.5,
    scoreRange: { min: 28, max: 91 },
    pendingAlerts: 4,
    openActions: 7,
    lastLogin: "2026-02-23T09:14:00",
    lastLoginUser: "Sarah Jenkins",
    teamMembers: [
      { id: "u001", name: "Sarah Jenkins", email: "s.jenkins@apexmotorfinance.co.uk", role: "Admin", isSuperAdmin: true, status: "Active", lastLogin: "2026-02-23T09:14:00" },
      { id: "u002", name: "Mark Davies", email: "m.davies@apexmotorfinance.co.uk", role: "Admin", isSuperAdmin: false, status: "Active", lastLogin: "2026-02-20T14:30:00" },
      { id: "u003", name: "Claire Foster", email: "c.foster@apexmotorfinance.co.uk", role: "User", isSuperAdmin: false, status: "Active", lastLogin: "2026-02-18T11:00:00" },
    ],
    recentActivity: [
      { date: "2026-02-23T09:14:00", user: "Sarah Jenkins", action: "Logged in" },
      { date: "2026-02-20T10:30:00", user: "Mark Davies", action: "Acknowledged alert — Summit Cars threshold breach" },
      { date: "2026-02-18T14:00:00", user: "Sarah Jenkins", action: "Downloaded portfolio report" },
    ],
  },
  {
    id: "l002",
    name: "Meridian Vehicle Finance Ltd",
    tradingName: "Meridian Vehicle Finance",
    status: "Active",
    contractStart: "2025-08-15",
    billingAddress: "22 Broad Street, Birmingham, B1 2HF",
    contactName: "David Okafor",
    contactEmail: "d.okafor@meridianvf.co.uk",
    contactPhone: "0121 946 0811",
    fcaFirmRef: "743912",
    companiesHouseNo: "10284731",
    dealerCount: 8,
    avgPortfolioScore: 72.3,
    scoreRange: { min: 54, max: 89 },
    pendingAlerts: 2,
    openActions: 3,
    lastLogin: "2026-02-25T11:30:00",
    lastLoginUser: "David Okafor",
    teamMembers: [
      { id: "u101", name: "David Okafor", email: "d.okafor@meridianvf.co.uk", role: "Admin", isSuperAdmin: true, status: "Active", lastLogin: "2026-02-25T11:30:00" },
      { id: "u102", name: "Priya Sharma", email: "p.sharma@meridianvf.co.uk", role: "User", isSuperAdmin: false, status: "Active", lastLogin: "2026-02-21T09:00:00" },
    ],
    recentActivity: [
      { date: "2026-02-25T11:30:00", user: "David Okafor", action: "Logged in" },
      { date: "2026-02-22T15:00:00", user: "Priya Sharma", action: "Uploaded document — Castle Cars DBS Certificate" },
      { date: "2026-02-19T10:00:00", user: "David Okafor", action: "Completed dealer onboarding — Ridgeway Motors" },
    ],
  },
  {
    id: "l003",
    name: "Broadstone Motor Credit Plc",
    tradingName: "Broadstone Motor Credit",
    status: "Active",
    contractStart: "2025-09-01",
    billingAddress: "7 Exchange Square, Manchester, M2 7EP",
    contactName: "Fiona Callahan",
    contactEmail: "f.callahan@broadstonecredit.co.uk",
    contactPhone: "0161 946 2200",
    fcaFirmRef: "801356",
    companiesHouseNo: "11502841",
    dealerCount: 14,
    avgPortfolioScore: 61.8,
    scoreRange: { min: 22, max: 88 },
    pendingAlerts: 7,
    openActions: 11,
    lastLogin: "2026-02-24T08:45:00",
    lastLoginUser: "Fiona Callahan",
    teamMembers: [
      { id: "u201", name: "Fiona Callahan", email: "f.callahan@broadstonecredit.co.uk", role: "Admin", isSuperAdmin: true, status: "Active", lastLogin: "2026-02-24T08:45:00" },
      { id: "u202", name: "James Wu", email: "j.wu@broadstonecredit.co.uk", role: "Admin", isSuperAdmin: false, status: "Active", lastLogin: "2026-02-20T16:00:00" },
      { id: "u203", name: "Rachel Nwosu", email: "r.nwosu@broadstonecredit.co.uk", role: "User", isSuperAdmin: false, status: "Active", lastLogin: "2026-02-17T13:30:00" },
    ],
    recentActivity: [
      { date: "2026-02-24T08:45:00", user: "Fiona Callahan", action: "Logged in" },
      { date: "2026-02-22T11:00:00", user: "James Wu", action: "Triggered re-audit — Kingsway Autos" },
      { date: "2026-02-18T09:30:00", user: "Fiona Callahan", action: "Added 2 dealers to Do Not Deal list" },
    ],
  },
  {
    id: "l004",
    name: "Northern Rock Motor Finance Ltd",
    tradingName: "NR Motor Finance",
    status: "Active",
    contractStart: "2025-11-10",
    billingAddress: "55 Grainger Street, Newcastle, NE1 5JQ",
    contactName: "Tom Ellison",
    contactEmail: "t.ellison@nrmotorfinance.co.uk",
    contactPhone: "0191 946 3300",
    fcaFirmRef: "769201",
    companiesHouseNo: "12384920",
    dealerCount: 5,
    avgPortfolioScore: 79.4,
    scoreRange: { min: 67, max: 92 },
    pendingAlerts: 1,
    openActions: 2,
    lastLogin: "2026-02-26T14:10:00",
    lastLoginUser: "Tom Ellison",
    teamMembers: [
      { id: "u301", name: "Tom Ellison", email: "t.ellison@nrmotorfinance.co.uk", role: "Admin", isSuperAdmin: true, status: "Active", lastLogin: "2026-02-26T14:10:00" },
    ],
    recentActivity: [
      { date: "2026-02-26T14:10:00", user: "Tom Ellison", action: "Logged in" },
      { date: "2026-02-23T10:00:00", user: "Tom Ellison", action: "Reviewed dealer compliance report — Elmwood Motors" },
      { date: "2026-02-19T15:00:00", user: "Tom Ellison", action: "Acknowledged alert — document expiry warning" },
    ],
  },
  {
    id: "l005",
    name: "Solent Asset Finance Ltd",
    tradingName: "Solent Asset Finance",
    status: "Pending Activation",
    contractStart: "2026-02-01",
    billingAddress: "3 Harbour Parade, Southampton, SO14 2AQ",
    contactName: "Angela Moss",
    contactEmail: "a.moss@solentasset.co.uk",
    contactPhone: "023 946 4410",
    fcaFirmRef: "834017",
    companiesHouseNo: "13910284",
    dealerCount: 0,
    avgPortfolioScore: null,
    scoreRange: null,
    pendingAlerts: 0,
    openActions: 0,
    lastLogin: null,
    lastLoginUser: null,
    teamMembers: [
      { id: "u401", name: "Angela Moss", email: "a.moss@solentasset.co.uk", role: "Admin", isSuperAdmin: true, status: "Invited", lastLogin: null },
    ],
    recentActivity: [
      { date: "2026-02-01T09:00:00", user: "TCG Ops", action: "Lender account created — invitation sent to Angela Moss" },
    ],
  },
];

// Generate additional lenders (l006–l040)
export const generatedLenders = generateLenders();

// Combined list of all lenders
export const allTcgLenders: TcgLender[] = [
  ...tcgLenders,
  ...generatedLenders.map((gl): TcgLender => ({
    ...gl,
    teamMembers: gl.teamMembers.map((tm) => ({
      ...tm,
      status: tm.status as "Active" | "Invited",
    })),
  })),
];

export function getLenderName(id: string): string {
  return allTcgLenders.find((l) => l.id === id)?.name ?? id;
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
