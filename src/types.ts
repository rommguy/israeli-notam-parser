export interface NOTAM {
  id: string;
  icaoCode: string;
  description: string;
  validFrom: Date | null;
  validTo: Date | null;
  rawText: string;
  mapLink?: string;
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
