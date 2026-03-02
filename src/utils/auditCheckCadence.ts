import auditCheckSchedule from "@/data/tcg/auditCheckSchedule.json";
import dealerCheckStatusData from "@/data/tcg/dealerCheckStatus.json";
import { tcgDealers } from "@/data/tcg/dealers";

export interface CheckCadenceInfo {
  frequency: string;
  frequencyDays: number;
  lastChecked: Date;
  lastCheckedLabel: string;
  lastCheckedBy: string;
  result: string;
  notes: string;
  nextDueDate: Date;
  daysUntilDue: number;
  status: "neutral" | "amber" | "red";
}

interface DealerControlStatus {
  controlId: string;
  lastChecked: string;
  lastCheckedBy: string;
  result: string;
  notes: string;
}

interface DealerCheckStatus {
  dealerId: string;
  controls: DealerControlStatus[];
}

const dealerCheckStatus: DealerCheckStatus[] = dealerCheckStatusData;

// Build a lookup: dealerName → dealerId
function getDealerIdByName(dealerName: string): string | null {
  const dealer = tcgDealers.find(
    (d) => d.name === dealerName || d.tradingName === dealerName
  );
  return dealer?.id ?? null;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Look up cadence info for a given control within a section.
 * Uses dealerCheckStatus.json for real dates when a TCG dealer is matched,
 * otherwise falls back to deterministic seeded dates.
 */
export function getControlCadence(
  dealerName: string,
  sectionName: string,
  controlArea: string,
  controlId: string
): CheckCadenceInfo | null {
  // Find matching schedule section
  const section = auditCheckSchedule.find((s) => {
    const sn = s.sectionName.toLowerCase();
    const target = sectionName.toLowerCase();
    return sn === target || target.includes(sn) || sn.includes(target.replace(" / ", " & ").replace("/", "&"));
  });

  if (!section) return null;

  // Find matching control in schedule
  const scheduleControl = section.controls.find((c) => {
    const cName = c.name.toLowerCase();
    const area = controlArea.toLowerCase();
    return cName.includes(area.slice(0, 20)) || area.includes(cName.slice(0, 20));
  });

  if (!scheduleControl) return null;

  // Try to find real check status data for this dealer
  const dealerId = getDealerIdByName(dealerName);
  const dealerStatus = dealerId
    ? dealerCheckStatus.find((d) => d.dealerId === dealerId)
    : null;
  const controlStatus = dealerStatus?.controls.find(
    (c) => c.controlId === scheduleControl.id
  );

  let lastChecked: Date;
  let lastCheckedBy = "";
  let result = "Pass";
  let notes = "";

  if (controlStatus) {
    lastChecked = new Date(controlStatus.lastChecked);
    lastCheckedBy = controlStatus.lastCheckedBy;
    result = controlStatus.result;
    notes = controlStatus.notes;
  } else {
    // Fallback: deterministic seeded date for non-TCG dealers
    lastChecked = seededLastChecked(dealerName, controlId, scheduleControl.frequencyDays);
  }

  const nextDue = new Date(lastChecked);
  nextDue.setDate(nextDue.getDate() + scheduleControl.frequencyDays);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.round((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let status: "neutral" | "amber" | "red" = "neutral";
  if (daysUntilDue < 10) status = "red";
  else if (daysUntilDue < 30) status = "amber";

  return {
    frequency: scheduleControl.frequency,
    frequencyDays: scheduleControl.frequencyDays,
    lastChecked,
    lastCheckedLabel: formatDate(lastChecked),
    lastCheckedBy,
    result,
    notes,
    nextDueDate: nextDue,
    daysUntilDue,
    status,
  };
}

/**
 * Deterministic fallback for non-TCG dealers.
 */
function seededLastChecked(dealerName: string, controlId: string, frequencyDays: number): Date {
  let hash = 0;
  const str = `${dealerName}:${controlId}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const daysAgo = Math.abs(hash % (frequencyDays + 30));
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d;
}
