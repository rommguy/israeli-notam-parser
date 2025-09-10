import { NOTAM, NotamFilterOptions, ParsedNotamData, PlaywrightConfig } from './types';
import { fetchNotams, parseHtmlContent } from './scraper';
import { fetchNotamsWithPlaywright } from './playwrightScraper';
import { loadExistingNotams, saveNotams, mergeNotams, exportDailyNotams, getStorageStats } from './storage';
import { isWithinInterval, parseISO, format } from 'date-fns';

/**
 * @deprecated This function provides incomplete/dangerous partial data and has been disabled for aviation safety.
 * Use fetchAndParseNotamsIncremental() or fetchAndParseNotamsFullRefresh() instead.
 */
export async function fetchAndParseNotams(): Promise<ParsedNotamData> {
  throw new Error('Legacy NOTAM fetching has been disabled for aviation safety. It provides incomplete/dangerous partial data. Use fetchAndParseNotamsIncremental() or fetchAndParseNotamsFullRefresh() instead.');
}

/**
 * Fetch and parse NOTAMs with incremental updates using Playwright
 */
export async function fetchAndParseNotamsIncremental(
  usePlaywright: boolean = true,
  playwrightConfig?: Partial<PlaywrightConfig>
): Promise<ParsedNotamData> {
  try {
    console.log('Loading existing NOTAMs from storage...');
    const storage = await loadExistingNotams();
    const existingIds = storage.notams.map(notam => notam.id);
    
    console.log(`Found ${storage.totalCount} existing NOTAMs in storage`);
    
    let newNotams: NOTAM[] = [];
    
    if (usePlaywright) {
      console.log('Fetching NOTAMs using Playwright browser automation...');
      newNotams = await fetchNotamsWithPlaywright(existingIds, playwrightConfig);
    } else {
      throw new Error('Playwright is required for complete NOTAM data. Legacy scraping provides incomplete/dangerous partial data and is not allowed.');
    }
    
    console.log(`Found ${newNotams.length} new NOTAMs to process`);
    
    // Merge new NOTAMs with existing ones
    const { merged, newCount } = mergeNotams(storage.notams, newNotams);
    
    // Update storage
    const updatedStorage = {
      ...storage,
      notams: merged,
      newCount: newCount,
      totalCount: merged.length
    };
    
    await saveNotams(updatedStorage);
    
    // Print statistics
    const stats = getStorageStats(updatedStorage);
    console.log(`Storage updated: ${stats.totalNotams} total NOTAMs (${stats.newNotams} new)`);
    
    return {
      notams: merged,
      lastUpdated: new Date(),
      totalCount: merged.length,
      newCount: newCount
    };
  } catch (error) {
    throw new Error(`Failed to fetch and parse NOTAMs incrementally: ${error}`);
  }
}

/**
 * Force a full refresh of all NOTAMs (ignores existing storage)
 */
export async function fetchAndParseNotamsFullRefresh(
  usePlaywright: boolean = true,
  playwrightConfig?: Partial<PlaywrightConfig>
): Promise<ParsedNotamData> {
  try {
    console.log('Performing full refresh of all NOTAMs...');
    
    let notams: NOTAM[] = [];
    
    if (usePlaywright) {
      console.log('Fetching all NOTAMs using Playwright browser automation...');
      // Pass empty array to fetch all NOTAMs
      notams = await fetchNotamsWithPlaywright([], playwrightConfig);
    } else {
      throw new Error('Playwright is required for complete NOTAM data. Legacy scraping provides incomplete/dangerous partial data and is not allowed.');
    }
    
    console.log(`Fetched ${notams.length} NOTAMs in full refresh`);
    
    // Save to storage (this will replace existing data)
    const storage = {
      notams: notams,
      lastUpdated: new Date(),
      totalCount: notams.length,
      newCount: notams.length, // All NOTAMs are "new" in a full refresh
      metadata: {
        version: '1.0.0',
        source: 'israeli-aviation-authority'
      }
    };
    
    await saveNotams(storage);
    
    return {
      notams,
      lastUpdated: new Date(),
      totalCount: notams.length,
      newCount: notams.length
    };
  } catch (error) {
    throw new Error(`Failed to perform full refresh: ${error}`);
  }
}

/**
 * Filter NOTAMs by flight date
 */
export function filterNotamsByDate(notams: NOTAM[], flightDate: Date): NOTAM[] {
  return notams.filter(notam => isNotamValidOnDate(notam, flightDate));
}

/**
 * Filter NOTAMs based on provided options
 */
export function filterNotams(notams: NOTAM[], options: NotamFilterOptions): NOTAM[] {
  let filteredNotams = notams;
  
  // Filter by flight date
  filteredNotams = filterNotamsByDate(filteredNotams, options.flightDate);
  
  // Filter by ICAO code if specified
  if (options.icaoCode) {
    filteredNotams = filteredNotams.filter(notam => 
      notam.icaoCode === options.icaoCode?.toUpperCase()
    );
  }
  
  // Filter by type if specified
  if (options.type) {
    filteredNotams = filteredNotams.filter(notam => 
      notam.type === options.type
    );
  }
  
  return filteredNotams;
}

/**
 * Format a NOTAM for display
 */
export function formatNotamForDisplay(notam: NOTAM): string {
  const validityInfo = getValidityString(notam);
  
  return [
    `ID: ${notam.id}`,
    `ICAO: ${notam.icaoCode}`,
    `Type: ${getTypeDescription(notam.type)}`,
    notam.validFrom ? `Valid From: ${format(notam.validFrom, 'dd MMM yyyy HH:mm')}` : '',
    notam.validTo ? `Valid To: ${format(notam.validTo, 'dd MMM yyyy HH:mm')}` : '',
    !notam.validFrom && !notam.validTo ? 'Validity: Not specified (assumed current)' : '',
    `Description: ${notam.description}`,
    '---'
  ].filter(line => line).join('\n');
}

/**
 * Export NOTAM data to JSON file
 */
export function exportToJson(data: ParsedNotamData, filePath?: string): string {
  const jsonData = JSON.stringify(data, null, 2);
  
  if (filePath) {
    const fs = require('fs');
    const path = require('path');
    
    // Ensure results directory exists
    const resultsDir = path.join(process.cwd(), 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // If user provided just a filename, place it in results folder
    // If they provided a path, use it as-is
    let finalPath = filePath;
    if (!path.isAbsolute(filePath) && !filePath.includes('/') && !filePath.includes('\\')) {
      finalPath = path.join(resultsDir, filePath);
    } else if (filePath.startsWith('./') || filePath.startsWith('../')) {
      // Handle relative paths - resolve them relative to results directory
      finalPath = path.resolve(resultsDir, filePath);
    }
    
    // Ensure the directory for the final path exists
    const finalDir = path.dirname(finalPath);
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    
    fs.writeFileSync(finalPath, jsonData, 'utf8');
    console.log(`NOTAMs exported to ${finalPath}`);
  }
  
  return jsonData;
}

/**
 * Export NOTAMs in daily format (for backward compatibility with existing workflow)
 */
export async function exportDailyNotamsFromStorage(
  date: string, 
  outputPath: string,
  filterOptions?: Partial<NotamFilterOptions>
): Promise<void> {
  const storage = await loadExistingNotams();
  let notamsToExport = storage.notams;
  
  // Apply filters if provided
  if (filterOptions) {
    if (filterOptions.flightDate) {
      notamsToExport = filterNotamsByDate(notamsToExport, filterOptions.flightDate);
    }
    if (filterOptions.icaoCode) {
      notamsToExport = notamsToExport.filter(notam => 
        notam.icaoCode === filterOptions.icaoCode?.toUpperCase()
      );
    }
    if (filterOptions.type) {
      notamsToExport = notamsToExport.filter(notam => 
        notam.type === filterOptions.type
      );
    }
  }
  
  await exportDailyNotams(notamsToExport, date, outputPath);
}

/**
 * Generate summary statistics for NOTAMs
 */
export function generateSummary(notams: NOTAM[]): string {
  const typeCount = notams.reduce((acc, notam) => {
    acc[notam.type] = (acc[notam.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const icaoCount = notams.reduce((acc, notam) => {
    acc[notam.icaoCode] = (acc[notam.icaoCode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const summary = [
    `Total NOTAMs: ${notams.length}`,
    '',
    'By Type:',
    ...Object.entries(typeCount).map(([type, count]) => 
      `  ${getTypeDescription(type as NOTAM['type'])}: ${count}`
    ),
    '',
    'By Airport/FIR:',
    ...Object.entries(icaoCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Show top 10
      .map(([icao, count]) => `  ${icao}: ${count}`)
  ];
  
  return summary.join('\n');
}

// Helper functions (previously private methods)

/**
 * Check if a NOTAM is valid on a specific date
 */
function isNotamValidOnDate(notam: NOTAM, flightDate: Date): boolean {
  // If no validity dates are specified, assume the NOTAM is currently active
  if (!notam.validFrom && !notam.validTo) {
    return true;
  }
  
  // If only validFrom is specified, check if flight date is after or on that date
  if (notam.validFrom && !notam.validTo) {
    return flightDate >= notam.validFrom;
  }
  
  // If only validTo is specified, check if flight date is before or on that date
  if (!notam.validFrom && notam.validTo) {
    return flightDate <= notam.validTo;
  }
  
  // If both dates are specified, check if flight date is within the interval
  if (notam.validFrom && notam.validTo) {
    return isWithinInterval(flightDate, {
      start: notam.validFrom,
      end: notam.validTo
    });
  }
  
  return false;
}

/**
 * Get validity string for display
 */
function getValidityString(notam: NOTAM): string {
  if (notam.validFrom && notam.validTo) {
    return `${format(notam.validFrom, 'dd MMM yyyy HH:mm')} - ${format(notam.validTo, 'dd MMM yyyy HH:mm')}`;
  } else if (notam.validFrom) {
    return `From ${format(notam.validFrom, 'dd MMM yyyy HH:mm')}`;
  } else if (notam.validTo) {
    return `Until ${format(notam.validTo, 'dd MMM yyyy HH:mm')}`;
  }
  return '';
}

/**
 * Get human-readable description for NOTAM type
 */
function getTypeDescription(type: NOTAM['type']): string {
  switch (type) {
    case 'A': return 'Aerodrome';
    case 'C': return 'En-route';
    case 'R': return 'Radar';
    case 'N': return 'Navigation';
    default: return type;
  }
}