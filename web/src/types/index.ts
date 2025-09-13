export interface NOTAM {
  id: string;
  icaoCode: string;
  type: "A" | "C" | "R" | "N"; // A=Aerodrome, C=En-route, R=Radar, N=Navigation
  number: string;
  year: string;
  description: string;
  validFrom?: Date;
  validTo?: Date;
  createdDate: Date;
  rawText: string;
  mapLink?: string;
}

export interface NotamFilterOptions {
  flightDate: Date;
  icaoCode?: string;
  type?: NOTAM["type"];
}

export interface ParsedNotamData {
  notams: NOTAM[];
  lastUpdated: Date;
  totalCount: number;
}

// Additional types for the React application
export interface NotamReadState {
  [notamId: string]: boolean; // true = read, false/undefined = unread
}

export interface FilterState {
  selectedDate: "today" | "tomorrow";
  selectedIcaoCodes: string[];
  showOnlyUnread: boolean;
}

export interface NotamStats {
  total: number;
  unread: number;
  byType: Record<NOTAM["type"], number>;
  byIcao: Record<string, number>;
}

// ICAO codes for Israeli airports/FIRs
export const ICAO_CODES = [
  { code: "LLBG", name: "Ben Gurion Airport" },
  { code: "LLHA", name: "Haifa Airport" },
  { code: "LLOV", name: "Ovda Airport (Eilat)" },
  { code: "LLER", name: "Ramon Airport (Eilat)" },
  { code: "LLLL", name: "Tel Aviv FIR" },
  { code: "LLKS", name: "Kiryat Shmona Airport" },
  { code: "LLMG", name: "Megiddo Airport" },
  { code: "LLRS", name: "Rosh Pina Airport" },
  { code: "LLSO", name: "Sde Dov Airport" },
  { code: "LLEK", name: "Ein Yahav Airport" },
  { code: "LLFK", name: "Bar Yehuda Airport" },
  { code: "LLGV", name: "Givat Olga Airport" },
  { code: "LLHZ", name: "Hatzor Airport" },
  { code: "LLIB", name: "Ben Ya'akov Airport" },
] as const;

export type IcaoCode = (typeof ICAO_CODES)[number]["code"];
