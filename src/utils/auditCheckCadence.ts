import auditCheckSchedule from "@/data/tcg/auditCheckSchedule.json";

export interface CheckCadenceInfo {
  frequency: string;
  frequencyDays: number;
  lastChecked: Date;
  lastCheckedLabel: string;
  nextDueDate: Date;
  daysUntilDue: number;
  status: "neutral" | "amber" | "red";
}

/**
 * Deterministically generate a "last checked" date for a control
 * based on dealer name + control id, so it's stable across renders.
 */
function seededLastChecked(dealerName: string, controlId: string, frequencyDays: number): Date {
  let hash = 0;
  const str = `${dealerName}:${controlId}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  // Spread last-checked across 0 to frequencyDays + 30 (some overdue)
  const daysAgo = Math.abs(hash % (frequencyDays + 30));
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Look up cadence info for a given control within a section.
 * Matches by section name (fuzzy) and control name substring.
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

  // Find matching control — try id suffix first, then fuzzy name
  const control = section.controls.find((c) => {
    const cName = c.name.toLowerCase();
    const area = controlArea.toLowerCase();
    return cName.includes(area.slice(0, 20)) || area.includes(cName.slice(0, 20));
  });

  if (!control) return null;

  const lastChecked = seededLastChecked(dealerName, controlId, control.frequencyDays);
  const nextDue = new Date(lastChecked);
  nextDue.setDate(nextDue.getDate() + control.frequencyDays);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.round((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let status: "neutral" | "amber" | "red" = "neutral";
  if (daysUntilDue < 10) status = "red";
  else if (daysUntilDue < 30) status = "amber";

  return {
    frequency: control.frequency,
    frequencyDays: control.frequencyDays,
    lastChecked,
    lastCheckedLabel: formatDate(lastChecked),
    nextDueDate: nextDue,
    daysUntilDue,
    status,
  };
}
