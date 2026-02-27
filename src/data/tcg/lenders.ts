export interface TcgLender {
  id: string;
  name: string;
  shortName: string;
}

export const tcgLenders: TcgLender[] = [
  { id: "l001", name: "Apex Motor Finance", shortName: "Apex" },
  { id: "l002", name: "Sterling Auto Credit", shortName: "Sterling" },
  { id: "l003", name: "Northern Vehicle Finance", shortName: "Northern" },
];

export function getLenderName(id: string): string {
  return tcgLenders.find((l) => l.id === id)?.name ?? id;
}
