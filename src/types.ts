export interface NOTAM {
  id: string;
  icaoCode: string;
  type: 'A' | 'C' | 'R' | 'N'; // A=Aerodrome, C=En-route, R=Radar, N=Navigation
  number: string;
  year: string;
  description: string;
  validFrom?: Date;
  validTo?: Date;
  rawText: string;
}

export interface NotamFilterOptions {
  flightDate: Date;
  icaoCode?: string;
  type?: NOTAM['type'];
}

export interface ParsedNotamData {
  notams: NOTAM[];
  lastUpdated: Date;
  totalCount: number;
}
