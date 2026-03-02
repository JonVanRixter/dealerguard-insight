/**
 * Deterministic data generator for TCG lenders and dealers.
 * Uses compact seed arrays + hash-based generation for consistent, realistic UK motor finance data.
 */

// ── Deterministic hash ──
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// ── Name pools ──
const FIRST_NAMES = [
  "James","Emma","Oliver","Sophie","William","Charlotte","Harry","Amelia","George","Isla",
  "Thomas","Olivia","Jack","Emily","Daniel","Grace","Alexander","Mia","Samuel","Lucy",
  "Benjamin","Hannah","Edward","Jessica","Joseph","Eleanor","Henry","Lily","Charles","Ruby",
  "Robert","Alice","David","Victoria","Michael","Elizabeth","Matthew","Chloe","Andrew","Zoe",
  "Christopher","Scarlett","Nicholas","Eva","Peter","Daisy","Simon","Abigail","Richard","Freya",
];
const LAST_NAMES = [
  "Smith","Jones","Williams","Brown","Taylor","Davies","Wilson","Evans","Thomas","Roberts",
  "Johnson","Walker","Wright","Robinson","Thompson","White","Hughes","Edwards","Green","Hall",
  "Clarke","Lewis","Young","Harris","King","Baker","Turner","Collins","Morris","Murphy",
  "Campbell","Stewart","Fraser","Henderson","Patterson","Reid","Gray","McDonald","Hamilton","Scott",
  "Mitchell","Cooper","Marshall","Wood","Price","Bennett","Ross","Watson","Kelly","Graham",
];

const UK_CITIES: [string, string, string][] = [
  ["London","EC","1A 1BB"],["Birmingham","B","1 2HF"],["Manchester","M","1 1AD"],
  ["Leeds","LS","1 4DY"],["Glasgow","G","1 3SL"],["Liverpool","L","1 1JD"],
  ["Bristol","BS","1 4DJ"],["Sheffield","S","1 2GN"],["Edinburgh","EH","1 1YZ"],
  ["Cardiff","CF","10 1EP"],["Newcastle","NE","1 7RU"],["Nottingham","NG","1 5FW"],
  ["Brighton","BN","1 1AE"],["Southampton","SO","14 2AQ"],["Reading","RG","1 2HB"],
  ["Leicester","LE","1 5WW"],["Coventry","CV","1 1FE"],["Cambridge","CB","2 3QZ"],
  ["Oxford","OX","1 1PT"],["Bath","BA","1 1SJ"],["York","YO","1 7EP"],
  ["Exeter","EX","1 1GA"],["Norwich","NR","1 3QG"],["Plymouth","PL","1 1EA"],
  ["Derby","DE","1 2QQ"],["Preston","PR","1 2HE"],["Swansea","SA","1 3QQ"],
  ["Aberdeen","AB","11 5RG"],["Dundee","DD","1 4QB"],["Belfast","BT","1 5GS"],
  ["Canterbury","CT","1 2HG"],["Chester","CH","1 2DY"],["Worcester","WR","1 2EY"],
  ["Gloucester","GL","1 2TH"],["Peterborough","PE","1 1YN"],["Ipswich","IP","1 1AD"],
  ["Swindon","SN","1 1RN"],["Middlesbrough","TS","1 2AZ"],["Hull","HU","1 2SA"],
  ["Stoke","ST","1 1LZ"],
];

const STREET_NAMES = [
  "High Street","Market Street","Station Road","Church Lane","King Street","Queen Street",
  "Mill Road","Bridge Street","Park Avenue","Victoria Road","London Road","Castle Street",
  "North Street","South Street","West Road","East Lane","Chapel Street","Green Lane",
  "George Street","Albert Road","New Road","The Parade","Commercial Road","Broad Street",
];

const DEALER_PREFIXES = [
  "Ashford","Beacon","Brook","Carlton","Crown","Dale","Eagle","Falcon","Globe","Haven",
  "Horizon","Ivy","Jubilee","Kestrel","Lancaster","Manor","Neptune","Oakley","Phoenix","Quay",
  "Regent","Saxon","Tudor","Unity","Vale","Whitfield","York","Zenith","Amber","Bluebell",
  "Cedar","Diamond","Emerald","Foxhill","Granite","Harbour","Imperial","Jasper","Kinsley","Linden",
  "Maple","Noble","Orchard","Pinnacle","Quarry","Rosewood","Summit","Trent","Urban","Vista",
  "Windsor","Alpine","Balmoral","Clifton","Drayton","Eden","Firth","Grange","Helmsley","Ironbridge",
  "Kelvin","Lakeside","Millbrook","Newbury","Osborne","Parkside","Queensway","Richmond","Silverstone","Thornton",
  "Upland","Varsity","Weston","Arden","Bayfield","Cavendish","Dorset","Elmsway","Ferndale","Glendale",
  "Heston","Ivybridge","Jarvis","Kingfisher","Langley","Montague","Netherfield","Overdale","Prestwick","Radcliffe",
  "Sandalwood","Templeton","Underwood","Ventura","Wayfield","Ashcroft","Bramley","Canford","Derwent","Eskdale",
];

const DEALER_SUFFIXES = [
  "Motors","Automotive","Cars","Auto Sales","Vehicle Sales","Motor Group","Car Centre",
  "Motor Company","Auto Centre","Vehicle Centre","Car Sales","Motor Sales","Autos",
  "Motor Trade","Car Group",
];

const LENDER_WORDS = [
  "Apex","Meridian","Broadstone","Sterling","Haven","Pinnacle","Fortress","Vanguard","Prestige",
  "Alliance","Summit","Compass","Keystone","Pacific","Atlantic","Evergreen","Heritage","Dominion",
  "Frontier","Catalyst","Nexus","Paragon","Zenith","Aurora","Sentinel","Eclipse","Horizon",
  "Avalon","Sovereign","Trident","Granite","Sapphire","Amber","Ironside","Crestline","Osprey",
  "Falcon","Nordic","Coastal","Atlas",
];

const LENDER_TYPES = ["Motor Finance","Vehicle Finance","Asset Finance","Motor Credit","Auto Finance","Capital"];
const ENTITY_SUFFIXES = ["Ltd","Plc","Limited","Group Ltd"];

const REGIONS = [
  "London","Birmingham","Manchester","Leeds","Glasgow","Liverpool","Bristol","Sheffield",
  "Edinburgh","Cardiff","Newcastle","Nottingham","Brighton","Southampton","Reading",
  "Leicester","Coventry","Cambridge","Oxford","Bath","York","Exeter","Norwich","Plymouth",
  "Derby","Preston","Swansea","Aberdeen","Dundee","Belfast","Canterbury","Chester",
  "Worcester","Gloucester","Peterborough","Ipswich","Swindon","Middlesbrough","Hull","Stoke",
];

// ── Generator: Lenders ──
export interface GeneratedLender {
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
  teamMembers: { id: string; name: string; email: string; role: string; isSuperAdmin: boolean; status: "Active" | "Invited"; lastLogin: string | null }[];
  recentActivity: { date: string; user: string; action: string }[];
}

// Dealer counts for lenders l006–l040 (35 lenders). Total = 368 - 38 = 330
const DEALER_COUNTS = [
  12, 10, 15, 8, 10, 11, 11, 9, 13, 6,   // l006-l015: 105
  14, 10, 10, 12, 8, 11, 9, 9, 13, 7,     // l016-l025: 103
  12, 10, 12, 14, 8, 11, 11, 9, 12, 0,    // l026-l035: 99 (l035 pending)
  8, 12, 0, 0, 3,                           // l036-l040: 23 (l038,l039 pending)
];
// Sum check: 12+8+15+6+10+9+11+7+13+4+14+8+10+12+6+11+9+7+13+5+10+8+12+14+6+9+11+7+10+0+8+12+9+11+0 = 330 ✓

export function generateLenders(): GeneratedLender[] {
  const lenders: GeneratedLender[] = [];

  for (let i = 0; i < 35; i++) {
    const idx = i + 6; // l006 onwards
    const id = `l${String(idx).padStart(3, "0")}`;
    const h = hash(id);
    const word = LENDER_WORDS[idx - 1] || LENDER_WORDS[h % LENDER_WORDS.length];
    const lenderType = pick(LENDER_TYPES, h);
    const entitySuffix = pick(ENTITY_SUFFIXES, h >> 3);
    const tradingName = `${word} ${lenderType}`;
    const name = `${word} ${lenderType} ${entitySuffix}`;

    const isPending = i === 29 || i === 32 || i === 33; // l035, l038, l039
    const isInactive = i === 20; // l026
    const status: GeneratedLender["status"] = isPending ? "Pending Activation" : isInactive ? "Inactive" : "Active";
    const dealerCount = DEALER_COUNTS[i];

    const city = UK_CITIES[h % UK_CITIES.length];
    const street = pick(STREET_NAMES, h >> 2);
    const streetNum = (h % 80) + 1;

    const firstName = pick(FIRST_NAMES, h >> 1);
    const lastName = pick(LAST_NAMES, h >> 4);
    const contactName = `${firstName} ${lastName}`;
    const domain = word.toLowerCase().replace(/\s/g, "") + lenderType.toLowerCase().split(" ")[0].slice(0, 3) + ".co.uk";
    const contactEmail = `${firstName.toLowerCase().charAt(0)}.${lastName.toLowerCase()}@${domain}`;

    const areaCode = `0${city[1].length <= 2 ? (h % 900 + 100) : (h % 90 + 10)}`;
    const contactPhone = `${areaCode} ${String(h % 900 + 100).padStart(3, "0")} ${String((h >> 5) % 9000 + 1000).padStart(4, "0")}`;

    const fcaFirmRef = String(700000 + idx * 1000 + (h % 999));
    const companiesHouseNo = String(9000000 + idx * 100000 + (h % 99999)).padStart(8, "0");

    // Contract start: spread across 2025
    const contractMonth = (h % 12) + 1;
    const contractDay = (h % 28) + 1;
    const contractStart = `2025-${String(contractMonth).padStart(2, "0")}-${String(contractDay).padStart(2, "0")}`;

    const billingAddress = `${streetNum} ${street}, ${city[0]}, ${city[1]}${city[2]}`;

    // Score stats (computed later from actual dealers, placeholder here)
    const avgScore = dealerCount > 0 ? Math.round(50 + (h % 35)) : null;
    const scoreMin = dealerCount > 0 ? Math.max(15, avgScore! - 20 - (h % 15)) : null;
    const scoreMax = dealerCount > 0 ? Math.min(98, avgScore! + 15 + (h % 10)) : null;

    const pendingAlerts = dealerCount > 0 ? h % (dealerCount > 10 ? 10 : dealerCount + 1) : 0;
    const openActions = dealerCount > 0 ? pendingAlerts + (h % 5) : 0;

    // Last login: within last 14 days for active
    const loginDay = status === "Active" ? 14 + (h % 14) : null;
    const lastLogin = loginDay ? `2026-02-${String(loginDay).padStart(2, "0")}T${String(8 + (h % 10)).padStart(2, "0")}:${String(h % 60).padStart(2, "0")}:00` : null;

    // Team members
    const teamSize = status === "Pending Activation" ? 1 : 2 + (h % 3);
    const teamMembers = Array.from({ length: teamSize }, (_, ti) => {
      const th = hash(`${id}-team-${ti}`);
      const fn = pick(FIRST_NAMES, th);
      const ln = pick(LAST_NAMES, th >> 3);
      return {
        id: `u${idx}${String(ti).padStart(2, "0")}`,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase().charAt(0)}.${ln.toLowerCase()}@${domain}`,
        role: ti === 0 ? "Admin" : ti === 1 ? "Admin" : "User",
        isSuperAdmin: ti === 0,
        status: (status === "Pending Activation" && ti === 0 ? "Invited" : "Active") as "Active" | "Invited",
        lastLogin: status === "Pending Activation" ? null : lastLogin,
      };
    });

    const ACTIVITY_VERBS = [
      "Logged in","Downloaded portfolio report","Acknowledged alert","Completed dealer review",
      "Updated compliance notes","Triggered re-audit","Viewed dealer profile","Exported CSV report",
    ];

    const recentActivity = status === "Pending Activation"
      ? [{ date: contractStart + "T09:00:00", user: "TCG Ops", action: `Lender account created — invitation sent to ${contactName}` }]
      : Array.from({ length: 3 }, (_, ai) => ({
          date: `2026-02-${String(20 + ai).padStart(2, "0")}T${String(9 + ai * 2).padStart(2, "0")}:00:00`,
          user: teamMembers[ai % teamMembers.length].name,
          action: pick(ACTIVITY_VERBS, hash(`${id}-act-${ai}`)),
        }));

    lenders.push({
      id, name, tradingName, status, contractStart, billingAddress,
      contactName, contactEmail, contactPhone, fcaFirmRef, companiesHouseNo,
      dealerCount, avgPortfolioScore: avgScore,
      scoreRange: scoreMin != null && scoreMax != null ? { min: scoreMin, max: scoreMax } : null,
      pendingAlerts, openActions, lastLogin, lastLoginUser: status !== "Pending Activation" ? contactName : null,
      teamMembers, recentActivity,
    });
  }

  return lenders;
}

// ── Generator: Dealers ──
export interface GeneratedDealer {
  id: string;
  name: string;
  tradingName: string;
  score: number;
  lastAudit: string;
  trend: "up" | "down" | "stable";
  region: string;
  firmType: "AR" | "DA";
  phone: string;
  postcode: string;
  address: string;
  companiesHouseNumber: string;
  fcaRef: string;
  alertCount: number;
  distributeInsurance: boolean;
  onboarding: {
    status: "Approved" | "Pending";
    applicationRef: string;
    initiatedBy: string;
    initiatedDate: string;
    submittedDate: string;
    approvedDate: string | null;
    approvedBy: string | null;
    validFrom: string | null;
    validUntil: string | null;
    validityWindowDays: number;
    renewalDue: boolean;
    lendersUsing: string[];
    rejectionReason: null;
  };
}

export function generateDealers(lenders: GeneratedLender[]): GeneratedDealer[] {
  const dealers: GeneratedDealer[] = [];
  let dealerIdx = 39; // d039 onwards

  for (const lender of lenders) {
    if (lender.dealerCount === 0) continue;

    for (let di = 0; di < lender.dealerCount; di++) {
      const id = `d${String(dealerIdx).padStart(3, "0")}`;
      const h = hash(id);

      const prefix = DEALER_PREFIXES[(dealerIdx - 39) % DEALER_PREFIXES.length];
      const suffix = pick(DEALER_SUFFIXES, h);
      const name = `${prefix} ${suffix}`;
      const tradingName = prefix;

      // Score: spread around lender's avg with variation
      const baseAvg = lender.avgPortfolioScore || 65;
      const score = Math.max(15, Math.min(98, Math.round(baseAvg + (h % 40) - 20)));

      // Last audit: between Oct 2025 and Feb 2026
      const auditMonth = 10 + (h % 5); // 10-14 → Oct 2025 - Feb 2026
      const auditYear = auditMonth > 12 ? 2026 : 2025;
      const auditMonthActual = auditMonth > 12 ? auditMonth - 12 : auditMonth;
      const auditDay = (h % 28) + 1;
      const auditDate = new Date(auditYear, auditMonthActual - 1, auditDay);
      const lastAudit = auditDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

      const trends: ("up" | "down" | "stable")[] = ["up", "down", "stable"];
      const trend = pick(trends, h >> 2);

      const region = pick(REGIONS, h >> 1);
      const firmType: "AR" | "DA" = h % 3 === 0 ? "DA" : "AR";

      const city = UK_CITIES[h % UK_CITIES.length];
      const street = pick(STREET_NAMES, h >> 3);
      const streetNum = (h % 120) + 1;
      const postcode = `${city[1]}${(h % 9) + 1} ${(h % 9)}${pick(["AA","AB","BA","DA","EA","GA","HA","JA","LA","NA"], h >> 4)}`;
      const address = `${streetNum} ${street}, ${city[0]}`;
      const phone = `0${(h % 900 + 100)} ${(h % 900 + 100)} ${((h >> 3) % 9000 + 1000)}`;

      const companiesHouseNumber = String(15000000 + dealerIdx * 1000 + (h % 999)).padStart(8, "0");
      const fcaRef = String(800000 + dealerIdx);

      const alertCount = score < 50 ? (h % 4) + 1 : score < 70 ? h % 3 : h % 2;

      // Onboarding dates
      const initMonth = (h % 8) + 6; // Jun-Jan
      const initYear = initMonth > 12 ? 2026 : 2025;
      const initMonthActual = initMonth > 12 ? initMonth - 12 : initMonth;
      const initDay = (h % 25) + 1;
      const initDate = `${initYear}-${String(initMonthActual).padStart(2, "0")}-${String(initDay).padStart(2, "0")}`;
      const submitDate = new Date(initYear, initMonthActual - 1, initDay + 5);
      const approveDate = new Date(initYear, initMonthActual - 1, initDay + 8);
      const validUntil = new Date(approveDate);
      validUntil.setDate(validUntil.getDate() + 275); // ~9 months

      const fmt = (d: Date) => d.toISOString().slice(0, 10);

      // Find lender contact for initiatedBy
      const initiatedBy = lender.teamMembers[0]?.name || lender.contactName;

      dealers.push({
        id, name, tradingName, score, lastAudit, trend, region, firmType,
        phone, postcode, address, companiesHouseNumber, fcaRef,
        alertCount, distributeInsurance: h % 2 === 0,
        onboarding: {
          status: "Approved",
          applicationRef: `APP-${String(dealerIdx).padStart(3, "0")}-2025`,
          initiatedBy,
          initiatedDate: initDate,
          submittedDate: fmt(submitDate),
          approvedDate: fmt(approveDate),
          approvedBy: "Amara Osei",
          validFrom: fmt(approveDate),
          validUntil: fmt(validUntil),
          validityWindowDays: 92,
          renewalDue: h % 8 === 0,
          lendersUsing: [lender.id],
          rejectionReason: null,
        },
      });

      dealerIdx++;
    }
  }

  return dealers;
}
