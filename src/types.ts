export interface NOTAM {
  id: string;
  icaoCode: string;
  type: 'A' | 'C' | 'R' | 'N'; // A=Aerodrome, C=En-route, R=Radar, N=Navigation
  number: string;
  year: string;
  description: string;
  validFrom?: Date;
  validTo?: Date;
  createdDate: Date; // When this NOTAM was parsed/created
  rawText: string;
  mapLink?: string; // Google Maps link for coordinates found in PSN
  expandedContent?: string; // Full content from expanded view
  isExpanded?: boolean; // Whether this NOTAM was successfully expanded
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
  newCount?: number; // Number of new NOTAMs in this fetch
}

/**
 * Configuration for Playwright browser automation
 */
export interface PlaywrightConfig {
  headless: boolean;
  timeout: number;
  viewport: { width: number; height: number };
  userAgent?: string;
  slowMo?: number; // Delay between actions in milliseconds
  devtools?: boolean;
}

/**
 * Result of NOTAM expansion operation
 */
export interface NotamExpansionResult {
  notamId: string;
  success: boolean;
  expandedContent?: string;
  error?: string;
  retryCount: number;
}
