import { dealers, Dealer } from "@/data/dealers";

export interface RecheckItem {
  dealerName: string;
  dealerIndex: number;
  lastAuditDate: Date;
  recheckMonth: 3 | 6 | 9 | 12;
  recheckDate: Date;
  isOverdue: boolean;
  daysOverdue: number; // negative = days until due
  status: "overdue" | "due-soon" | "upcoming" | "completed";
}

/**
 * Parse the mock audit date format "DD Mon YYYY" into a Date.
 */
function parseAuditDate(dateStr: string): Date {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const parts = dateStr.split(" ");
  const day = parseInt(parts[0], 10);
  const month = months[parts[1]] ?? 0;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Add months to a date.
 */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Compute days difference (positive = overdue, negative = days until due).
 */
function daysDiff(target: Date, now: Date): number {
  return Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Generate re-check schedule items for all Green-status dealers.
 * Returns items sorted by urgency (most overdue first).
 */
export function generateRecheckSchedule(now: Date = new Date()): RecheckItem[] {
  const items: RecheckItem[] = [];
  const recheckMonths: (3 | 6 | 9 | 12)[] = [3, 6, 9, 12];

  dealers.forEach((dealer, index) => {
    // Only high-scoring dealers (80+) get re-check schedules
    if (dealer.score < 80) return;

    const lastAudit = parseAuditDate(dealer.lastAudit);

    recheckMonths.forEach((month) => {
      const recheckDate = addMonths(lastAudit, month);
      const diff = daysDiff(recheckDate, now);
      
      let status: RecheckItem["status"];
      if (diff > 0) {
        status = "overdue";
      } else if (diff > -14) {
        status = "due-soon"; // within 14 days
      } else {
        status = "upcoming";
      }

      items.push({
        dealerName: dealer.name,
        dealerIndex: index,
        lastAuditDate: lastAudit,
        recheckMonth: month,
        recheckDate,
        isOverdue: diff > 0,
        daysOverdue: diff,
        status,
      });
    });
  });

  // Sort: overdue first (most overdue at top), then due-soon, then upcoming
  items.sort((a, b) => b.daysOverdue - a.daysOverdue);

  return items;
}

/**
 * Get re-check items for a specific dealer.
 */
export function getDealerRechecks(dealerName: string, now: Date = new Date()): RecheckItem[] {
  return generateRecheckSchedule(now).filter((item) => item.dealerName === dealerName);
}

/**
 * Get only overdue re-check items.
 */
export function getOverdueRechecks(now: Date = new Date()): RecheckItem[] {
  return generateRecheckSchedule(now).filter((item) => item.isOverdue);
}

/**
 * Get overdue + due-soon items (for dashboard widget).
 */
export function getUrgentRechecks(now: Date = new Date(), limit?: number): RecheckItem[] {
  const items = generateRecheckSchedule(now).filter(
    (item) => item.status === "overdue" || item.status === "due-soon"
  );
  return limit ? items.slice(0, limit) : items;
}
