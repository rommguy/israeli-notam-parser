import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as cheerio from 'cheerio';
import { NOTAM, PlaywrightConfig, NotamExpansionResult } from './types';
import { cleanText, extractDates, extractMapLink } from './scraperUtils';

// Constants
const BASE_URL = 'https://brin.iaa.gov.il/aeroinfo/AeroInfo.aspx?msgType=Notam';

const DEFAULT_CONFIG: PlaywrightConfig = {
  headless: true,
  timeout: 30000,
  viewport: { width: 1280, height: 720 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  slowMo: 100, // Small delay between actions
  devtools: false
};

/**
 * Playwright-based NOTAM scraper that handles dynamic content
 */
export class PlaywrightNotamScraper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: PlaywrightConfig;

  constructor(config: Partial<PlaywrightConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize browser and navigate to NOTAM page
   */
  async initialize(): Promise<void> {
    try {
      console.log('Launching browser...');
      this.browser = await chromium.launch({
        headless: this.config.headless,
        slowMo: this.config.slowMo,
        devtools: this.config.devtools
      });

      this.context = await this.browser.newContext({
        viewport: this.config.viewport,
        userAgent: this.config.userAgent
      });

      this.page = await this.context.newPage();
      
      // Set timeout for all operations
      this.page.setDefaultTimeout(this.config.timeout);

      console.log('Navigating to NOTAM website...');
      await this.page.goto(BASE_URL, { 
        waitUntil: 'networkidle',
        timeout: this.config.timeout 
      });

      console.log('Browser initialized successfully');
    } catch (error) {
      await this.cleanup();
      throw new Error(`Failed to initialize browser: ${error}`);
    }
  }

  /**
   * Fetch and parse NOTAMs with dynamic content expansion
   */
  async fetchNotams(existingNotamIds: string[] = []): Promise<NOTAM[]> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    try {
      console.log('Waiting for NOTAM content to load...');
      
      // Wait for the main content area to be present
      await this.page.waitForSelector('table, div', { timeout: this.config.timeout });
      
      // Get initial page content to identify NOTAMs
      const initialHtml = await this.page.content();
      const initialNotams = this.parseInitialNotams(initialHtml);
      
      console.log(`Found ${initialNotams.length} NOTAMs on page`);
      
      // Filter out NOTAMs we already have
      const notamsToExpand = initialNotams.filter(notam => 
        !existingNotamIds.includes(notam.id)
      );
      
      console.log(`${notamsToExpand.length} new NOTAMs to expand`);
      
      if (notamsToExpand.length === 0) {
        console.log('No new NOTAMs to process');
        return [];
      }

      // Expand each NOTAM to get complete information
      const expandedNotams = await this.expandNotams(notamsToExpand);
      
      console.log(`Successfully expanded ${expandedNotams.filter(n => n.isExpanded).length} NOTAMs`);
      
      return expandedNotams;
    } catch (error) {
      throw new Error(`Failed to fetch NOTAMs: ${error}`);
    }
  }

  /**
   * Parse initial NOTAM data from page HTML
   */
  private parseInitialNotams(html: string): NOTAM[] {
    const $ = cheerio.load(html);
    const notams: NOTAM[] = [];
    
    // Look for NOTAM content in the HTML
    $('td, div').each((_, element) => {
      const text = $(element).text().trim();
      
      // Look for NOTAM pattern: Letter+Number/Year ICAO_CODE
      const notamMatch = text.match(/([ACRNacrn])(\d{4})\/(\d{2})\s+([A-Z]{4})\s+E\)\s*(.*)/);
      
      if (notamMatch) {
        const [, type, number, year, icaoCode, description] = notamMatch;
        const cleanedText = cleanText(text);
        
        const notam: NOTAM = {
          id: `${type.toUpperCase()}${number}/${year}`,
          icaoCode: icaoCode,
          type: type.toUpperCase() as NOTAM['type'],
          number: number,
          year: year,
          description: description.trim(),
          createdDate: new Date(),
          rawText: cleanedText,
          isExpanded: false
        };
        
        // Try to extract dates and coordinates from initial content
        extractDates(notam);
        extractMapLink(notam);
        
        notams.push(notam);
      }
    });
    
    // Remove duplicates based on ID
    const uniqueNotams = notams.filter((notam, index, self) => 
      index === self.findIndex(n => n.id === notam.id)
    );
    
    return uniqueNotams;
  }

  /**
   * Expand NOTAMs by clicking on them to load full content
   */
  private async expandNotams(notams: NOTAM[]): Promise<NOTAM[]> {
    if (!this.page) {
      throw new Error('Browser page not available');
    }

    const results: NOTAM[] = [];
    const maxRetries = 3;

    for (let i = 0; i < notams.length; i++) {
      const notam = notams[i];
      console.log(`Expanding NOTAM ${i + 1}/${notams.length}: ${notam.id}`);
      
      let retryCount = 0;
      let expansionResult: NotamExpansionResult | null = null;
      
      while (retryCount < maxRetries && !expansionResult?.success) {
        try {
          expansionResult = await this.expandSingleNotam(notam, retryCount);
        } catch (error) {
          console.warn(`Attempt ${retryCount + 1} failed for ${notam.id}: ${error}`);
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Wait before retry
            await this.page.waitForTimeout(1000 * retryCount);
          }
        }
      }
      
      // Update NOTAM with expansion results
      const expandedNotam: NOTAM = {
        ...notam,
        isExpanded: expansionResult?.success || false,
        expandedContent: expansionResult?.expandedContent
      };
      
      // If we got expanded content, re-extract dates and other info
      if (expandedNotam.expandedContent) {
        const searchText = `${expandedNotam.description} ${expandedNotam.expandedContent}`;
        expandedNotam.rawText = searchText;
        extractDates(expandedNotam);
        extractMapLink(expandedNotam);
      }
      
      results.push(expandedNotam);
      
      // Small delay between expansions to avoid overwhelming the server
      if (i < notams.length - 1) {
        await this.page.waitForTimeout(500);
      }
    }

    return results;
  }

  /**
   * Debug helper to analyze page structure
   */
  private async debugPageStructure(notam: NOTAM): Promise<void> {
    if (!this.page || this.config.headless) return; // Only debug in non-headless mode
    
    console.log(`\n=== DEBUG: Analyzing page structure for ${notam.id} ===`);
    
    // Find all elements with f_getMoreInfo onclick
    const moreInfoButtons = await this.page.$$('[onclick*="f_getMoreInfo"]');
    console.log(`Found ${moreInfoButtons.length} f_getMoreInfo buttons on page`);
    
    // Find rows containing this NOTAM
    const notamRows = await this.page.$$(`tr:has-text("${notam.id}")`);
    console.log(`Found ${notamRows.length} table rows containing ${notam.id}`);
    
    // Take screenshot for debugging
    await this.page.screenshot({ 
      path: `debug-${notam.id.replace('/', '-')}.png`,
      fullPage: true 
    });
    console.log(`Screenshot saved as debug-${notam.id.replace('/', '-')}.png`);
    console.log('=== END DEBUG ===\n');
  }

  /**
   * Expand a single NOTAM by clicking on it
   */
  private async expandSingleNotam(notam: NOTAM, retryCount: number): Promise<NotamExpansionResult> {
    if (!this.page) {
      throw new Error('Browser page not available');
    }

    try {
      // Look for the specific expand button with the f_getMoreInfo onclick handler
      const selectors = [
        // Primary: Look for the expand button with f_getMoreInfo onclick in the same row as the NOTAM
        `tr:has-text("${notam.id}") [onclick^="javascript:f_getMoreInfo(this.parentNode.parentNode.parentNode"]`,
        // Secondary: Look for any f_getMoreInfo button near the NOTAM text
        `[onclick^="javascript:f_getMoreInfo(this.parentNode.parentNode.parentNode"]:near(:text("${notam.id}"))`,
        // Fallback: Look for expand buttons in table rows containing the NOTAM
        `tr:has-text("${notam.id}") img[src*="plus"]`,
        `tr:has-text("${notam.id}") img[src*="expand"]`,
        `tr:has-text("${notam.id}") [onclick*="getMoreInfo"]`
      ];

      let clickableElement = null;
      
      for (const selector of selectors) {
        try {
          clickableElement = await this.page.$(selector);
          if (clickableElement) {
            console.log(`Found clickable element for ${notam.id} using selector: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!clickableElement) {
        // Try to find f_getMoreInfo buttons and match them to the correct NOTAM row
        console.log(`Looking for f_getMoreInfo buttons for NOTAM ${notam.id}`);
        const moreInfoButtons = await this.page.$$('[onclick^="javascript:f_getMoreInfo(this.parentNode.parentNode.parentNode"]');
        
        for (const button of moreInfoButtons) {
          // Check if this button is in the same table row as our NOTAM
          const parentRow = await button.evaluateHandle(el => {
            // Navigate up the DOM to find the table row
            let current = el.parentElement;
            while (current && current.tagName !== 'TR') {
              current = current.parentElement;
            }
            return current;
          });
          
          if (parentRow) {
            const rowText = await parentRow.textContent();
            if (rowText?.includes(notam.id)) {
              clickableElement = button;
              console.log(`Found f_getMoreInfo button for ${notam.id} in table row`);
              break;
            }
          }
        }
      }
      
      if (!clickableElement) {
        // Final fallback: look for any expand-related elements in rows containing the NOTAM
        const expandButtons = await this.page.$$('img[src*="plus"], img[src*="expand"], .expand-button, [onclick*="expand"], [onclick*="getMoreInfo"]');
        
        for (const button of expandButtons) {
          const parentRow = await button.$('xpath=ancestor::tr[1]');
          if (parentRow) {
            const rowText = await parentRow.textContent();
            if (rowText?.includes(notam.id)) {
              clickableElement = button;
              console.log(`Found generic expand button for ${notam.id} in parent row`);
              break;
            }
          }
        }
      }

      if (!clickableElement) {
        // Debug page structure if we can't find the element
        await this.debugPageStructure(notam);
        
        return {
          notamId: notam.id,
          success: false,
          error: 'No clickable element found',
          retryCount
        };
      }

      // Click the element and wait for response
      console.log(`Clicking element for ${notam.id}...`);
      
      await Promise.all([
        // Wait for any network response that might indicate content loading
        this.page.waitForResponse(response => {
          const url = response.url();
          return (url.includes('.aspx') || url.includes('getMoreInfo') || url.includes('AeroInfo')) 
                 && response.status() === 200;
        }, { timeout: 10000 }).catch(() => {
          console.log(`No network response detected for ${notam.id}, continuing anyway`);
          return null;
        }),
        clickableElement.click()
      ]);

      // Wait a bit for content to update
      await this.page.waitForTimeout(1000);

      // Get updated content
      const updatedHtml = await this.page.content();
      const expandedContent = this.extractExpandedContent(updatedHtml, notam.id);

      return {
        notamId: notam.id,
        success: expandedContent.length > notam.description.length,
        expandedContent: expandedContent || undefined,
        retryCount
      };

    } catch (error) {
      return {
        notamId: notam.id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        retryCount
      };
    }
  }

  /**
   * Extract expanded content for a specific NOTAM
   */
  private extractExpandedContent(html: string, notamId: string): string {
    const $ = cheerio.load(html);
    let expandedContent = '';

    // Look for content containing the NOTAM ID with more detail
    $('td, div, span').each((_, element) => {
      const text = $(element).text().trim();
      
      if (text.includes(notamId) && text.length > expandedContent.length) {
        // This might be the expanded content
        expandedContent = cleanText(text);
      }
    });

    return expandedContent;
  }

  /**
   * Clean up browser resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      console.log('Browser cleanup completed');
    } catch (error) {
      console.warn(`Error during cleanup: ${error}`);
    }
  }
}

/**
 * Convenience function to fetch NOTAMs using Playwright
 */
export async function fetchNotamsWithPlaywright(
  existingNotamIds: string[] = [],
  config: Partial<PlaywrightConfig> = {}
): Promise<NOTAM[]> {
  const scraper = new PlaywrightNotamScraper(config);
  
  try {
    await scraper.initialize();
    const notams = await scraper.fetchNotams(existingNotamIds);
    return notams;
  } finally {
    await scraper.cleanup();
  }
}
