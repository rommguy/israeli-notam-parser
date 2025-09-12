import { NOTAM, PlaywrightConfig } from "./types";
import { initParser, fetchNotams } from "./playwrightScraper";

/**
 * Clean and normalize text for better readability
 */
export function cleanText(text: string): string {
  // Clean up excessive whitespace and normalize the text for readability
  return text
    .split("\n") // Split into lines
    .map((line) => line.trim()) // Trim each line
    .filter((line) => line.length > 0) // Remove empty lines
    .join(" ") // Join with spaces instead of newlines
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim(); // Final trim
}

/**
 * Extract date information from NOTAM text and populate validFrom/validTo fields
 */
export function extractDates(notam: NOTAM): void {
  // Search in both description, raw text, and expanded content for date patterns
  const searchText = `${notam.description} ${notam.rawText} `;

  // Pattern 1: Standard NOTAM format "FROM 2501011200 TO 2501012359"
  const datePattern = /(?:FROM|FM)\s+(\d{10})\s+(?:TO|TILL)\s+(\d{10})/i;
  const match = searchText.match(datePattern);

  if (match) {
    const [, fromStr, toStr] = match;
    notam.validFrom = parseNotamDate(fromStr);
    notam.validTo = parseNotamDate(toStr);
    return;
  }

  // Pattern 2: "VALID FROM 01 JAN 2025 12:00 TO 01 JAN 2025 23:59"
  const altDatePattern =
    /(?:VALID\s+)?(?:FROM|FM)\s+(\d{1,2}\s+[A-Z]{3}\s+\d{4}\s+\d{2}:\d{2})\s+(?:TO|TILL)\s+(\d{1,2}\s+[A-Z]{3}\s+\d{4}\s+\d{2}:\d{2})/i;
  const altMatch = searchText.match(altDatePattern);

  if (altMatch) {
    const [, fromStr, toStr] = altMatch;
    notam.validFrom = parseAlternativeDate(fromStr);
    notam.validTo = parseAlternativeDate(toStr);
    return;
  }

  // Pattern 3: Look for single date patterns
  // "WEF 02 OCT 2025" (With Effect From)
  const wefPattern = /WEF\s+(\d{1,2}\s+[A-Z]{3}\s+\d{4})/i;
  const wefMatch = searchText.match(wefPattern);
  if (wefMatch) {
    notam.validFrom = parseAlternativeDate(`${wefMatch[1]} 00:00`);
  }

  // Pattern 4: Look for "TILL" or "UNTIL" patterns
  const tillPattern =
    /(?:TILL|UNTIL)\s+(\d{1,2}\s+[A-Z]{3}\s+\d{4}(?:\s+\d{2}:\d{2})?)/i;
  const tillMatch = searchText.match(tillPattern);
  if (tillMatch) {
    const dateStr = tillMatch[1].includes(":")
      ? tillMatch[1]
      : `${tillMatch[1]} 23:59`;
    notam.validTo = parseAlternativeDate(dateStr);
  }

  // Pattern 5: Look for permanent NOTAMs
  if (searchText.match(/PERM|PERMANENT/i)) {
    // Don't set any dates for permanent NOTAMs - they're always valid
    return;
  }
}

/**
 * Parse NOTAM date format (YYMMDDHHMM) to Date object
 */
export function parseNotamDate(dateStr: string): Date {
  // NOTAM date format: YYMMDDHHMM (10 digits)
  if (dateStr.length !== 10) return new Date();

  const year = 2000 + parseInt(dateStr.substring(0, 2));
  const month = parseInt(dateStr.substring(2, 4)) - 1; // JavaScript months are 0-based
  const day = parseInt(dateStr.substring(4, 6));
  const hour = parseInt(dateStr.substring(6, 8));
  const minute = parseInt(dateStr.substring(8, 10));

  return new Date(year, month, day, hour, minute);
}

/**
 * Parse alternative date format (01 JAN 2025 12:00) to Date object
 */
export function parseAlternativeDate(dateStr: string): Date {
  // Parse "01 JAN 2025 12:00" format
  const parts = dateStr.split(/\s+/);
  if (parts.length !== 4) return new Date();

  const day = parseInt(parts[0]);
  const monthStr = parts[1];
  const year = parseInt(parts[2]);
  const timeParts = parts[3].split(":");
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);

  const monthMap: { [key: string]: number } = {
    JAN: 0,
    FEB: 1,
    MAR: 2,
    APR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
  };

  const month = monthMap[monthStr];
  if (month === undefined) return new Date();

  return new Date(year, month, day, hour, minute);
}

/**
 * Extract coordinate information and generate Google Maps link
 */
export function extractMapLink(notam: NOTAM): void {
  // Search in description, raw text, and expanded content for coordinate patterns
  const searchText = `${notam.description} ${notam.rawText}`;

  // Pattern for coordinates like: PSN 320024N0344404E
  const coordinatePattern = /PSN\s+(\d{6}N\d{7}E)/i;
  const match = searchText.match(coordinatePattern);

  if (match) {
    const coordinates = match[1];
    const googleMapsUrl = convertToGoogleMapsUrl(coordinates);
    if (googleMapsUrl) {
      notam.mapLink = googleMapsUrl;
    }
  }
}

/**
 * Convert aviation coordinates to Google Maps URL
 */
export function convertToGoogleMapsUrl(coordinates: string): string | null {
  // Parse coordinates like 320024N0344404E
  const match = coordinates.match(
    /(\d{2})(\d{2})(\d{2})N(\d{3})(\d{2})(\d{2})E/,
  );

  if (!match) return null;

  const [, latDeg, latMin, latSec, lonDeg, lonMin, lonSec] = match;

  // Convert to decimal degrees
  const latitude =
    parseInt(latDeg) + parseInt(latMin) / 60 + parseInt(latSec) / 3600;
  const longitude =
    parseInt(lonDeg) + parseInt(lonMin) / 60 + parseInt(lonSec) / 3600;

  // Format for Google Maps (degrees, minutes, seconds)
  const latDegFormatted = latDeg;
  const latMinFormatted = latMin;
  const latSecFormatted = latSec;
  const lonDegFormatted = lonDeg;
  const lonMinFormatted = lonMin;
  const lonSecFormatted = lonSec;

  return `https://www.google.com/maps/place/${latDegFormatted}°${latMinFormatted}'${latSecFormatted}"N+${lonDegFormatted}°${lonMinFormatted}'${lonSecFormatted}"E`;
}

export const fetchNotamsWithPlaywright = async (
  existingNotamIds: string[] = [],
  config: Partial<PlaywrightConfig> = {},
): Promise<NOTAM[]> => {
  try {
    const page = await initParser(config);
    return await fetchNotams(page, existingNotamIds);
  } finally {
    await [];
  }
};
