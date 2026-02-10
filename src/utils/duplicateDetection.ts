import { dealers, Dealer } from "@/data/dealers";

export type DuplicateMatchType = "phone" | "postcode" | "address" | "companiesHouse";

export interface DuplicateGroup {
  /** Stable key for this group, used for dismiss tracking */
  key: string;
  matchType: DuplicateMatchType;
  matchValue: string;
  dealers: { name: string; index: number }[];
}

function normalise(val: string): string {
  return val.replace(/\s+/g, "").toLowerCase();
}

/**
 * Detect potential duplicate dealers based on shared identifiers.
 * Returns groups where 2+ dealers share the same phone, postcode, address, or Companies House number.
 */
export function detectDuplicates(): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];

  const fields: { type: DuplicateMatchType; getter: (d: Dealer) => string }[] = [
    { type: "phone", getter: (d) => d.phone },
    { type: "companiesHouse", getter: (d) => d.companiesHouseNumber },
    { type: "postcode", getter: (d) => d.postcode },
    { type: "address", getter: (d) => d.address },
  ];

  for (const field of fields) {
    const map = new Map<string, { name: string; index: number; raw: string }[]>();

    dealers.forEach((d, i) => {
      const raw = field.getter(d);
      if (!raw || raw.trim().length === 0) return;
      const key = normalise(raw);
      const arr = map.get(key) || [];
      arr.push({ name: d.name, index: i, raw });
      map.set(key, arr);
    });

    map.forEach((entries, normKey) => {
      if (entries.length < 2) return;
      const groupKey = `dup_${field.type}_${normKey}`;
      groups.push({
        key: groupKey,
        matchType: field.type,
        matchValue: entries[0].raw,
        dealers: entries.map((e) => ({ name: e.name, index: e.index })),
      });
    });
  }

  return groups;
}

export const MATCH_TYPE_LABELS: Record<DuplicateMatchType, string> = {
  phone: "Phone Number",
  postcode: "Postcode",
  address: "Address",
  companiesHouse: "Companies House No.",
};
