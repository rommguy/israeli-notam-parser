import type { NOTAM, ParsedNotamData } from '../types';
import { getNotamDataPath, parseNotamDate } from '../utils/dateUtils';

/**
 * Load NOTAM data for a specific date
 */
export const loadNotamData = async (dateSelection: 'today' | 'tomorrow'): Promise<ParsedNotamData> => {
  try {
    const dataPath = getNotamDataPath(dateSelection);
    const response = await fetch(dataPath);
    
    if (!response.ok) {
      throw new Error(`Failed to load NOTAM data: ${response.status} ${response.statusText}`);
    }
    
    const rawData = await response.json();
    
    // Parse the data and convert date strings to Date objects
    const parsedData: ParsedNotamData = {
      ...rawData,
      lastUpdated: parseNotamDate(rawData.lastUpdated),
      notams: rawData.notams.map((notam: any): NOTAM => ({
        ...notam,
        createdDate: parseNotamDate(notam.createdDate),
        validFrom: notam.validFrom ? parseNotamDate(notam.validFrom) : undefined,
        validTo: notam.validTo ? parseNotamDate(notam.validTo) : undefined,
      })),
    };
    
    return parsedData;
  } catch (error) {
    console.error(`Error loading NOTAM data for ${dateSelection}:`, error);
    throw error;
  }
};

/**
 * Load NOTAM data for both today and tomorrow
 */
export const loadAllNotamData = async (): Promise<{
  today?: ParsedNotamData;
  tomorrow?: ParsedNotamData;
  errors: string[];
}> => {
  const results: {
    today?: ParsedNotamData;
    tomorrow?: ParsedNotamData;
    errors: string[];
  } = {
    errors: []
  };

  // Load today's data
  try {
    results.today = await loadNotamData('today');
  } catch (error) {
    results.errors.push(`Failed to load today's NOTAMs: ${error}`);
  }

  // Load tomorrow's data
  try {
    results.tomorrow = await loadNotamData('tomorrow');
  } catch (error) {
    results.errors.push(`Failed to load tomorrow's NOTAMs: ${error}`);
  }

  return results;
};

/**
 * Filter NOTAMs by ICAO codes
 */
export const filterNotamsByIcao = (notams: NOTAM[], selectedIcaoCodes: string[]): NOTAM[] => {
  if (selectedIcaoCodes.length === 0) {
    return notams;
  }
  
  return notams.filter(notam => 
    selectedIcaoCodes.includes(notam.icaoCode)
  );
};

/**
 * Filter NOTAMs by read status
 */
export const filterNotamsByReadStatus = (
  notams: NOTAM[], 
  readState: Record<string, boolean>, 
  showOnlyUnread: boolean
): NOTAM[] => {
  if (!showOnlyUnread) {
    return notams;
  }
  
  return notams.filter(notam => !readState[notam.id]);
};

/**
 * Get unique ICAO codes from NOTAMs
 */
export const getUniqueIcaoCodes = (notams: NOTAM[]): string[] => {
  const icaoCodes = new Set(notams.map(notam => notam.icaoCode));
  return Array.from(icaoCodes).sort();
};

/**
 * Get NOTAM statistics
 */
export const getNotamStats = (
  notams: NOTAM[], 
  readState: Record<string, boolean>
): {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byIcao: Record<string, number>;
} => {
  const stats = {
    total: notams.length,
    unread: notams.filter(notam => !readState[notam.id]).length,
    byType: {} as Record<string, number>,
    byIcao: {} as Record<string, number>
  };

  // Count by type
  notams.forEach(notam => {
    stats.byType[notam.type] = (stats.byType[notam.type] || 0) + 1;
  });

  // Count by ICAO code
  notams.forEach(notam => {
    stats.byIcao[notam.icaoCode] = (stats.byIcao[notam.icaoCode] || 0) + 1;
  });

  return stats;
};
