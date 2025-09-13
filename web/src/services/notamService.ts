import type { NOTAM, ParsedNotamData } from "../types";
import { parseNotamDate } from "../utils/dateUtils";
import { isAfter, isBefore, isSameDay, startOfDay, endOfDay } from "date-fns";

// Cache for the loaded NOTAM data to avoid multiple fetches
let cachedNotamData: ParsedNotamData | null = null;

/**
 * Load all NOTAM data from the single notams.json file
 */
const loadSingleNotamFile = async (): Promise<ParsedNotamData> => {
  // Return cached data if available
  if (cachedNotamData) {
    return cachedNotamData;
  }

  try {
    // Determine the correct base path for the data file
    const basePath = import.meta.env.BASE_URL || "/";
    const dataPath = `${basePath}data/notams.json`.replace(/\/+/g, "/");

    const response = await fetch(dataPath);

    if (!response.ok) {
      throw new Error(
        `Failed to load NOTAM data: ${response.status} ${response.statusText}`
      );
    }

    const rawData = await response.json();

    // Parse the data and convert date strings to Date objects
    const parsedData: ParsedNotamData = {
      ...rawData,
      lastUpdated: parseNotamDate(rawData.lastUpdated),
      notams: rawData.notams.map((notam: any): NOTAM => {
        // Extract type, number, and year from NOTAM ID (e.g., "A1234/25" -> type: "A", number: "1234", year: "25")
        const idMatch = notam.id.match(/^([ACRN])(\d+)\/(\d+)$/);
        const type = (idMatch?.[1] as "A" | "C" | "R" | "N") || "C"; // Default to "C" if parsing fails
        const number = idMatch?.[2] || "0000";
        const year = idMatch?.[3] || "25";

        return {
          ...notam,
          type,
          number,
          year,
          createdDate: new Date(), // Use current date as fallback since we don't have this data
          validFrom:
            notam.validFrom ? parseNotamDate(notam.validFrom) : undefined,
          validTo: notam.validTo ? parseNotamDate(notam.validTo) : undefined,
        };
      }),
    };

    // Cache the parsed data
    cachedNotamData = parsedData;
    return parsedData;
  } catch (error) {
    console.error("Error loading NOTAM data:", error);
    throw error;
  }
};

/**
 * Load NOTAM data for a specific date (now filters from single file)
 */
export const loadNotamData = async (
  selectedDate: Date
): Promise<ParsedNotamData> => {
  try {
    const allData = await loadSingleNotamFile();

    // Normalize the selected date to start of day for comparison
    const targetDate = startOfDay(selectedDate);

    // Filter NOTAMs that are valid for the target date
    const filteredNotams = allData.notams.filter((notam) => {
      if (!notam.validFrom || !notam.validTo) return true; // Include NOTAMs without date info

      // Check if the selected date falls within the NOTAM's validity period
      // validFrom <= selectedDate <= validTo
      const validFrom = startOfDay(notam.validFrom);
      const validTo = endOfDay(notam.validTo);

      return (
        (isBefore(validFrom, targetDate) || isSameDay(validFrom, targetDate)) &&
        (isAfter(validTo, targetDate) || isSameDay(validTo, targetDate))
      );
    });

    return {
      ...allData,
      notams: filteredNotams,
      totalCount: filteredNotams.length,
    };
  } catch (error) {
    console.error(
      `Error loading NOTAM data for ${selectedDate.toISOString()}:`,
      error
    );
    throw error;
  }
};

/**
 * Load NOTAM data for multiple dates
 */
export const loadAllNotamData = async (
  dates: Date[]
): Promise<{
  data: Record<string, ParsedNotamData>;
  errors: string[];
}> => {
  const results: {
    data: Record<string, ParsedNotamData>;
    errors: string[];
  } = {
    data: {},
    errors: [],
  };

  // Load data for each date
  for (const date of dates) {
    try {
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format
      results.data[dateKey] = await loadNotamData(date);
    } catch (error) {
      results.errors.push(
        `Failed to load NOTAMs for ${date.toISOString()}: ${error}`
      );
    }
  }

  return results;
};

/**
 * Filter NOTAMs by ICAO codes
 */
export const filterNotamsByIcao = (
  notams: NOTAM[],
  selectedIcaoCodes: string[]
): NOTAM[] => {
  if (selectedIcaoCodes.length === 0) {
    return notams;
  }

  return notams.filter((notam) => selectedIcaoCodes.includes(notam.icaoCode));
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

  return notams.filter((notam) => !readState[notam.id]);
};

/**
 * Get unique ICAO codes from NOTAMs
 */
export const getUniqueIcaoCodes = (notams: NOTAM[]): string[] => {
  const icaoCodes = new Set(notams.map((notam) => notam.icaoCode));
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
    unread: notams.filter((notam) => !readState[notam.id]).length,
    byType: {} as Record<string, number>,
    byIcao: {} as Record<string, number>,
  };

  // Count by type
  notams.forEach((notam) => {
    stats.byType[notam.type] = (stats.byType[notam.type] || 0) + 1;
  });

  // Count by ICAO code
  notams.forEach((notam) => {
    stats.byIcao[notam.icaoCode] = (stats.byIcao[notam.icaoCode] || 0) + 1;
  });

  return stats;
};
