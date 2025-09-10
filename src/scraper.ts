import axios from 'axios';
import * as cheerio from 'cheerio';
import { NOTAM } from './types';
import { cleanText, extractDates, extractMapLink } from './scraperUtils';

// Constants
const BASE_URL = 'https://brin.iaa.gov.il/aeroinfo/AeroInfo.aspx?msgType=Notam';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

/**
 * Fetch NOTAMs from the Israeli Aviation Authority website
 */
export async function fetchNotams(): Promise<string> {
  try {
    const response = await axios.get(BASE_URL, {
      headers: DEFAULT_HEADERS,
      timeout: 30000
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch NOTAMs: ${error}`);
  }
}

/**
 * Parse HTML content and extract NOTAM data
 */
export function parseHtmlContent(html: string): NOTAM[] {
  const $ = cheerio.load(html);
  const notams: NOTAM[] = [];
  
  // Look for NOTAM content in the HTML
  // The NOTAMs appear to be in table cells or specific divs
  $('td, div').each((_, element) => {
    const text = $(element).text().trim();
    
    // Look for NOTAM pattern: Letter+Number/Year ICAO_CODE
    const notamMatch = text.match(/([ACRNacrn])(\d{4})\/(\d{2})\s+([A-Z]{4})\s+E\)\s*(.*)/);
    
    if (notamMatch) {
      const [, type, number, year, icaoCode, description] = notamMatch;
      const cleanedText = cleanText(text);
      
      // Extract description from cleaned text for better accuracy
      const cleanedMatch = cleanedText.match(/([ACRNacrn])(\d{4})\/(\d{2})\s+([A-Z]{4})\s+E\)\s*(.*)/);
      const fullDescription = cleanedMatch ? cleanedMatch[5].trim() : description.trim();
      
      const notam: NOTAM = {
        id: `${type.toUpperCase()}${number}/${year}`,
        icaoCode: icaoCode,
        type: type.toUpperCase() as NOTAM['type'],
        number: number,
        year: year,
        description: fullDescription,
        createdDate: new Date(),
        rawText: cleanedText
      };
      
      // Try to extract dates from the description
      extractDates(notam);
      
      // Try to extract coordinates and generate map link
      extractMapLink(notam);
      
      notams.push(notam);
    }
  });
  
  // Also try to find NOTAMs in the raw text content
  const fullText = $.text();
  parseRawText(fullText, notams);
  
  // Remove duplicates based on ID
  const uniqueNotams = notams.filter((notam, index, self) => 
    index === self.findIndex(n => n.id === notam.id)
  );
  
  return uniqueNotams;
}

// Helper functions (internal, not exported)

/**
 * Parse raw text content for additional NOTAMs
 */
function parseRawText(text: string, existingNotams: NOTAM[]): void {
  // Split by common NOTAM separators and look for NOTAM patterns
  const lines = text.split(/[\r\n]+/);
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Look for NOTAM pattern in each line
    const notamMatch = trimmedLine.match(/([ACRNacrn])(\d{4})\/(\d{2})\s+([A-Z]{4})\s+E\)\s*(.*)/);
    
    if (notamMatch) {
      const [, type, number, year, icaoCode, description] = notamMatch;
      const id = `${type.toUpperCase()}${number}/${year}`;
      
      // Check if we already have this NOTAM
      if (existingNotams.some(n => n.id === id)) {
        continue;
      }
      
      const cleanedText = cleanText(trimmedLine);
      
      // Extract description from cleaned text for better accuracy
      const cleanedMatch = cleanedText.match(/([ACRNacrn])(\d{4})\/(\d{2})\s+([A-Z]{4})\s+E\)\s*(.*)/);
      const fullDescription = cleanedMatch ? cleanedMatch[5].trim() : description.trim();
      
      const notam: NOTAM = {
        id,
        icaoCode: icaoCode,
        type: type.toUpperCase() as NOTAM['type'],
        number: number,
        year: year,
        description: fullDescription,
        createdDate: new Date(),
        rawText: cleanedText
      };
      
      extractDates(notam);
      extractMapLink(notam);
      existingNotams.push(notam);
    }
  }
}

