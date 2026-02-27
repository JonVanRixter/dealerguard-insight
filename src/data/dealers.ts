export type RagStatus = "green" | "amber" | "red";
export type FirmType = "AR" | "DA"; // Appointed Representative or Directly Authorised

export interface Dealer {
  name: string;
  tradingName: string;
  score: number;
  rag: RagStatus;
  lastAudit: string;
  trend: "up" | "down" | "stable";
  region: string;
  firmType: FirmType;
  principalFirm: string | null;
  phone: string;
  postcode: string;
  address: string;
  companiesHouseNumber: string;
  alertCount: number;
}

const dealerPrefixes = [
  "Redline", "Stratstone", "Apex", "Arnold Clark", "Sytner", "Lookers", "Pendragon",
  "Vertu", "JCT600", "Inchcape", "Marshall", "Listers", "Jardine", "Swansway",
  "TrustFord", "Bristol Street", "Evans Halshaw", "CarShop", "Motorpoint", "Big Motoring World",
  "Caffyns", "Hendy", "Snows", "Dick Lovett", "HR Owen", "Harwoods", "Vindis",
  "Glyn Hopkin", "Peter Vardy", "Eastern Western", "Parks", "Macklin", "Robins & Day",
  "Perrys", "Johnsons", "Sandicliffe", "Stoneacre", "TC Harrison", "Rybrook", "Sinclair",
  "Bowker", "RRG", "Hartwell", "Williams", "JMK", "Citygate", "Marriott", "Greenhous",
  "Mill", "Breeze", "Hughes", "Westover", "Beadles", "Corkills", "Lancaster", "Gates",
  "Yeomans", "Howards", "Brayleys", "Chorley", "Roadside", "Platinum", "Prestige", "Premier",
  "Elite", "Superior", "Exclusive", "Diamond", "Crown", "Royal", "Imperial", "Sovereign",
];

const dealerSuffixes = [
  "Motors", "BMW", "Mercedes", "Audi", "Volkswagen", "Ford", "Toyota", "Honda",
  "Nissan", "Mazda", "Kia", "Hyundai", "Volvo", "Jaguar", "Land Rover", "Porsche",
  "Ferrari", "Bentley", "Rolls-Royce", "Aston Martin", "McLaren", "Specialist Cars",
  "Auto Centre", "Car Sales", "Motor Group", "Automotive", "Car Supermarket", "Vehicle Centre",
  "Car World", "Motor Village", "Auto Sales", "Car Store", "Motor Mall", "Auto Hub",
];

const locations = [
  "London", "Birmingham", "Manchester", "Leeds", "Glasgow", "Liverpool", "Newcastle",
  "Sheffield", "Bristol", "Edinburgh", "Cardiff", "Belfast", "Nottingham", "Southampton",
  "Leicester", "Coventry", "Bradford", "Hull", "Stoke", "Wolverhampton", "Derby",
  "Swansea", "Plymouth", "Reading", "Aberdeen", "Bournemouth", "Middlesbrough", "Bolton",
  "Luton", "Sunderland", "Norwich", "Preston", "Milton Keynes", "Brighton", "Oxford",
];

const streetNames = [
  "High Street", "Station Road", "London Road", "Church Lane", "Victoria Road",
  "Park Avenue", "Mill Lane", "Kings Road", "Queen Street", "Bridge Road",
  "Market Street", "Green Lane", "Manor Drive", "Chapel Road", "New Road",
  "Broad Street", "Castle Street", "North Road", "South Street", "West End",
];

const postcodeAreas = [
  "SW1A 1AA", "B1 1BB", "M1 1CC", "LS1 1DD", "G1 1EE", "L1 1FF", "NE1 1GG",
  "S1 1HH", "BS1 1JJ", "EH1 1KK", "CF1 1LL", "BT1 1MM", "NG1 1NN", "SO1 1PP",
  "LE1 1QQ", "CV1 1RR", "BD1 1SS", "HU1 1TT", "ST1 1UU", "WV1 1VV", "DE1 1WW",
  "SA1 1XX", "PL1 1YY", "RG1 1ZZ", "AB1 1AB", "BH1 1BC", "TS1 1CD", "BL1 1DE",
  "LU1 1EF", "SR1 1FG", "NR1 1GH", "PR1 1HJ", "MK1 1JK", "BN1 1KL", "OX1 1LM",
];

const principalFirms = [
  "Apex Motor Finance Ltd", "Stellantis Financial Services UK", "Black Horse Ltd",
  "MotoNovo Finance", "Close Brothers Motor Finance", "Startline Motor Finance",
  "First Response Finance", "Marsh Finance", "Evolution Funding", "Alphera Financial Services",
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49271;
  return x - Math.floor(x);
}

function generatePhone(index: number): string {
  const area = String(1200 + (index % 800)).padStart(4, "0");
  const local = String(100000 + Math.floor(seededRandom(index + 999) * 899999)).slice(0, 6);
  return `0${area} ${local}`;
}

function generateCompaniesHouse(index: number): string {
  return String(1000000 + index * 37 + Math.floor(seededRandom(index + 7777) * 9000000)).slice(0, 8);
}

function generateTradingName(dealerName: string): string {
  // Extract the first word as trading name
  const parts = dealerName.split(" ");
  if (parts.length <= 2) return parts[0];
  return parts.slice(0, 2).join(" ");
}

function generateDealerName(index: number): string {
  const prefix = dealerPrefixes[index % dealerPrefixes.length];
  const suffix = dealerSuffixes[Math.floor(index / 3) % dealerSuffixes.length];
  const location = locations[index % locations.length];
  
  const patterns = [
    `${prefix} ${suffix}`,
    `${prefix} ${suffix} ${location}`,
    `${location} ${prefix} ${suffix}`,
    `${prefix} ${location}`,
  ];
  
  return patterns[index % patterns.length];
}

function generateAuditDate(index: number): string {
  const days = ["01", "05", "08", "10", "12", "15", "18", "20", "22", "25", "28"];
  const months = ["Jan", "Feb", "Dec", "Nov", "Oct", "Sep"];
  const years = ["2026", "2026", "2026", "2025", "2025"];
  
  const day = days[index % days.length];
  const month = months[index % months.length];
  const year = years[index % years.length];
  
  return `${day} ${month} ${year}`;
}

function generateDealer(index: number): Dealer {
  const ragDistribution = Math.random();
  let rag: RagStatus;
  let scoreRange: [number, number];
  
  if (ragDistribution < 0.69) {
    rag = "green";
    scoreRange = [80, 100];
  } else if (ragDistribution < 0.935) {
    rag = "amber";
    scoreRange = [55, 79];
  } else {
    rag = "red";
    scoreRange = [30, 54];
  }
  
  const score = Math.floor(Math.random() * (scoreRange[1] - scoreRange[0] + 1)) + scoreRange[0];
  
  const trendRandom = Math.random();
  let trend: "up" | "down" | "stable";
  if (rag === "red") {
    trend = trendRandom < 0.6 ? "down" : trendRandom < 0.8 ? "stable" : "up";
  } else if (rag === "amber") {
    trend = trendRandom < 0.4 ? "down" : trendRandom < 0.7 ? "stable" : "up";
  } else {
    trend = trendRandom < 0.15 ? "down" : trendRandom < 0.5 ? "stable" : "up";
  }

  // ~80% AR, ~20% DA — matches industry distribution
  const firmType: FirmType = index % 5 === 0 ? "DA" : "AR";

  const streetNum = (index * 7 + 3) % 200 + 1;
  const street = streetNames[index % streetNames.length];
  const region = locations[index % locations.length];
  const postcode = postcodeAreas[index % postcodeAreas.length];

  // Introduce deliberate duplicates for testing:
  // Dealers 10 & 11 share same phone
  // Dealers 20 & 21 share same postcode + address
  // Dealers 30 & 31 share same companies house number
  let phone = generatePhone(index);
  let companiesHouseNumber = generateCompaniesHouse(index);
  let address = `${streetNum} ${street}, ${region}`;

  if (index === 11) phone = generatePhone(10);
  if (index === 21) {
    address = `${((10 * 7 + 3) % 200 + 1) + 10} ${streetNames[20 % streetNames.length]}, ${locations[20 % locations.length]}`;
    // share postcode with dealer 20
  }
  if (index === 31) companiesHouseNumber = generateCompaniesHouse(30);

  // Additional duplicates: dealers 50 & 51 share phone, 60 & 61 share companies house
  if (index === 51) phone = generatePhone(50);
  if (index === 61) companiesHouseNumber = generateCompaniesHouse(60);

  const dealerName = generateDealerName(index);
  const alertCount = rag === "red" ? Math.floor(seededRandom(index + 500) * 5) + 2 : rag === "amber" ? Math.floor(seededRandom(index + 600) * 3) : 0;

  return {
    name: dealerName,
    tradingName: generateTradingName(dealerName),
    score,
    rag,
    lastAudit: generateAuditDate(index),
    trend,
    region,
    firmType,
    principalFirm: firmType === "AR" ? principalFirms[index % principalFirms.length] : null,
    phone,
    postcode: index === 21 ? postcodeAreas[20 % postcodeAreas.length] : postcode,
    address,
    companiesHouseNumber,
    alertCount,
  };
}

// Generate 196 mock dealers + 4 real sample dealers
const mockDealers: Dealer[] = Array.from({ length: 196 }, (_, i) => generateDealer(i));

// Real sample dealers from audit documents
const realDealers: Dealer[] = [
  {
    name: "Thurlby Motors",
    tradingName: "Thurlby",
    score: 72,
    rag: "amber",
    lastAudit: "05 Feb 2026",
    trend: "stable",
    region: "Lincoln",
    firmType: "AR",
    principalFirm: "Apex Motor Finance Ltd",
    phone: "01522 456789",
    postcode: "LN1 3AA",
    address: "12 High Street, Lincoln",
    companiesHouseNumber: "04523891",
    alertCount: 1,
  },
  {
    name: "Dynasty Partners Limited",
    tradingName: "Dynasty",
    score: 68,
    rag: "amber",
    lastAudit: "05 Feb 2026",
    trend: "up",
    region: "London",
    firmType: "DA",
    principalFirm: null,
    phone: "020 7946 0958",
    postcode: "EC2A 4NE",
    address: "45 Finsbury Square, London",
    companiesHouseNumber: "09281746",
    alertCount: 2,
  },
  {
    name: "Shirlaws Limited",
    tradingName: "Shirlaws",
    score: 38,
    rag: "red",
    lastAudit: "05 Feb 2026",
    trend: "down",
    region: "Glasgow",
    firmType: "AR",
    principalFirm: "MotoNovo Finance",
    phone: "0141 352 4567",
    postcode: "G1 1EE",
    address: "78 Argyle Street, Glasgow",
    companiesHouseNumber: "SC087542",
    alertCount: 5,
  },
  {
    name: "Platinum Vehicle Specialists",
    tradingName: "Platinum",
    score: 42,
    rag: "red",
    lastAudit: "05 Feb 2026",
    trend: "down",
    region: "Birmingham",
    firmType: "AR",
    principalFirm: "Close Brothers Motor Finance",
    phone: "0121 678 9012",
    postcode: "B1 1BB",
    address: "15 Station Road, Birmingham",
    companiesHouseNumber: "07653219",
    alertCount: 4,
  },
];

export const dealers: Dealer[] = [...realDealers, ...mockDealers];

// Calculate portfolio stats
export const portfolioStats = {
  green: dealers.filter(d => d.rag === "green").length,
  amber: dealers.filter(d => d.rag === "amber").length,
  red: dealers.filter(d => d.rag === "red").length,
  total: dealers.length,
  avgScore: Math.round(dealers.reduce((sum, d) => sum + d.score, 0) / dealers.length),
};

// Recent activities based on actual dealer data
export const activities = [
  { text: "Shirlaws Limited flagged as High Risk – CreditSafe Category D", time: "2 hours ago", type: "red" as const },
  { text: "Platinum Vehicle Specialists – missing IDD on finance deal", time: "5 hours ago", type: "red" as const },
  { text: "Thurlby Motors – representative APR update required", time: "1 day ago", type: "amber" as const },
  { text: "Dynasty Partners Limited – website commission disclosure needs updating", time: "2 days ago", type: "amber" as const },
  { text: `${dealers.filter(d => d.rag === "green")[0]?.name || "A dealer"} completed annual audit`, time: "3 days ago", type: "green" as const },
];
