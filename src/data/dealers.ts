export type RagStatus = "green" | "amber" | "red";
export type FirmType = "AR" | "DA"; // Appointed Representative or Directly Authorised

export interface Dealer {
  name: string;
  score: number;
  rag: RagStatus;
  lastAudit: string;
  trend: "up" | "down" | "stable";
  region: string;
  firmType: FirmType;
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
  
  return {
    name: generateDealerName(index),
    score,
    rag,
    lastAudit: generateAuditDate(index),
    trend,
    region: locations[index % locations.length],
    firmType,
  };
}

// Generate 196 mock dealers + 4 real sample dealers
const mockDealers: Dealer[] = Array.from({ length: 196 }, (_, i) => generateDealer(i));

// Real sample dealers from audit documents
const realDealers: Dealer[] = [
  {
    name: "Thurlby Motors",
    score: 72,
    rag: "amber",
    lastAudit: "05 Feb 2026",
    trend: "stable",
    region: "Lincoln",
    firmType: "AR",
  },
  {
    name: "Dynasty Partners Limited",
    score: 68,
    rag: "amber",
    lastAudit: "05 Feb 2026",
    trend: "up",
    region: "London",
    firmType: "DA",
  },
  {
    name: "Shirlaws Limited",
    score: 38,
    rag: "red",
    lastAudit: "05 Feb 2026",
    trend: "down",
    region: "Glasgow",
    firmType: "AR",
  },
  {
    name: "Platinum Vehicle Specialists",
    score: 42,
    rag: "red",
    lastAudit: "05 Feb 2026",
    trend: "down",
    region: "Birmingham",
    firmType: "AR",
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
