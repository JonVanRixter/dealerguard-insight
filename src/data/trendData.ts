import { dealers, getScoreBand } from "@/data/dealers";

export interface MonthlySnapshot {
  month: string;       // e.g. "Sep 2025"
  monthKey: string;    // e.g. "2025-09"
  score: number;
}

export interface DealerTrend {
  dealerName: string;
  currentScore: number;
  trend: "up" | "down" | "stable";
  history: MonthlySnapshot[];
  changeFromStart: number;
}

export interface PortfolioTrendPoint {
  month: string;
  monthKey: string;
  avgScore: number;
  highCount: number;
  midCount: number;
  lowCount: number;
  totalDealers: number;
}

// Seeded pseudo-random for reproducible data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const MONTHS = [
  "Mar 2025", "Apr 2025", "May 2025", "Jun 2025",
  "Jul 2025", "Aug 2025", "Sep 2025", "Oct 2025",
  "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026",
];

const MONTH_KEYS = [
  "2025-03", "2025-04", "2025-05", "2025-06",
  "2025-07", "2025-08", "2025-09", "2025-10",
  "2025-11", "2025-12", "2026-01", "2026-02",
];

function generateDealerHistory(dealerIndex: number, currentScore: number, trend: "up" | "down" | "stable"): MonthlySnapshot[] {
  const rand = seededRandom(dealerIndex * 7919 + 31);
  const history: MonthlySnapshot[] = [];

  let baseOffset = trend === "up" ? 12 : trend === "down" ? -10 : 3;
  const startScore = Math.max(20, Math.min(100, currentScore - baseOffset + Math.round((rand() - 0.5) * 8)));

  for (let i = 0; i < MONTHS.length; i++) {
    const progress = i / (MONTHS.length - 1);
    const targetScore = startScore + (currentScore - startScore) * progress;
    const noise = (rand() - 0.5) * 6;
    const score = Math.max(20, Math.min(100, Math.round(targetScore + noise)));

    history.push({
      month: MONTHS[i],
      monthKey: MONTH_KEYS[i],
      score,
    });
  }

  // Ensure last point matches current score
  history[history.length - 1].score = currentScore;

  return history;
}

// Generate all dealer trends
export const dealerTrends: DealerTrend[] = dealers.map((dealer, index) => {
  const history = generateDealerHistory(index, dealer.score, dealer.trend);
  return {
    dealerName: dealer.name,
    currentScore: dealer.score,
    trend: dealer.trend,
    history,
    changeFromStart: dealer.score - history[0].score,
  };
});

// Generate portfolio-level trend
export const portfolioTrend: PortfolioTrendPoint[] = MONTHS.map((month, monthIdx) => {
  let totalScore = 0;
  let high = 0, mid = 0, low = 0;

  dealerTrends.forEach((dt) => {
    const snapshot = dt.history[monthIdx];
    totalScore += snapshot.score;
    const band = getScoreBand(snapshot.score);
    if (band === "high") high++;
    else if (band === "mid") mid++;
    else low++;
  });

  return {
    month,
    monthKey: MONTH_KEYS[monthIdx],
    avgScore: Math.round(totalScore / dealers.length),
    highCount: high,
    midCount: mid,
    lowCount: low,
    totalDealers: dealers.length,
  };
});

// Top movers (biggest positive change)
export const topImprovers = [...dealerTrends]
  .sort((a, b) => b.changeFromStart - a.changeFromStart)
  .slice(0, 10);

// Biggest decliners
export const topDecliners = [...dealerTrends]
  .sort((a, b) => a.changeFromStart - b.changeFromStart)
  .slice(0, 10);
