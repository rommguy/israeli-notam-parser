export interface NOTAM {
  id: string;
  icaoCode: string;
  number: string;
  description: string;
  validFrom: Date | null;
  validTo: Date | null;
  createdDate: Date;
  rawText: string;
  mapLink?: string;
}

export interface NotamFilterOptions {
  flightDate: Date;
  icaoCode?: string;
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
