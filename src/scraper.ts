import axios from 'axios';
import * as cheerio from 'cheerio';
import { NOTAM } from './types';

export class NotamScraper {
  private readonly baseUrl = 'https://brin.iaa.gov.il/aeroinfo/AeroInfo.aspx?msgType=Notam';
  
  async fetchNotams(): Promise<string> {
    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch NOTAMs: ${error}`);
    }
  }
  
  parseHtmlContent(html: string): NOTAM[] {
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
        const cleanedText = this.cleanText(text);
        
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
        this.extractDates(notam);
        
        notams.push(notam);
      }
    });
    
    // Also try to find NOTAMs in the raw text content
    const fullText = $.text();
    this.parseRawText(fullText, notams);
    
    // Remove duplicates based on ID
    const uniqueNotams = notams.filter((notam, index, self) => 
      index === self.findIndex(n => n.id === notam.id)
    );
    
    return uniqueNotams;
  }
  
  private parseRawText(text: string, existingNotams: NOTAM[]): void {
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
        
        const cleanedText = this.cleanText(trimmedLine);
        
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
        
        this.extractDates(notam);
        existingNotams.push(notam);
      }
    }
  }
  
  private extractDates(notam: NOTAM): void {
    // Search in both description and raw text for date patterns
    const searchText = `${notam.description} ${notam.rawText}`;
    
    // Pattern 1: Standard NOTAM format "FROM 2501011200 TO 2501012359"
    const datePattern = /(?:FROM|FM)\s+(\d{10})\s+(?:TO|TILL)\s+(\d{10})/i;
    const match = searchText.match(datePattern);
    
    if (match) {
      const [, fromStr, toStr] = match;
      notam.validFrom = this.parseNotamDate(fromStr);
      notam.validTo = this.parseNotamDate(toStr);
      return;
    }
    
    // Pattern 2: "VALID FROM 01 JAN 2025 12:00 TO 01 JAN 2025 23:59"
    const altDatePattern = /(?:VALID\s+)?(?:FROM|FM)\s+(\d{1,2}\s+[A-Z]{3}\s+\d{4}\s+\d{2}:\d{2})\s+(?:TO|TILL)\s+(\d{1,2}\s+[A-Z]{3}\s+\d{4}\s+\d{2}:\d{2})/i;
    const altMatch = searchText.match(altDatePattern);
    
    if (altMatch) {
      const [, fromStr, toStr] = altMatch;
      notam.validFrom = this.parseAlternativeDate(fromStr);
      notam.validTo = this.parseAlternativeDate(toStr);
      return;
    }
    
    // Pattern 3: Look for single date patterns
    // "WEF 02 OCT 2025" (With Effect From)
    const wefPattern = /WEF\s+(\d{1,2}\s+[A-Z]{3}\s+\d{4})/i;
    const wefMatch = searchText.match(wefPattern);
    if (wefMatch) {
      notam.validFrom = this.parseAlternativeDate(`${wefMatch[1]} 00:00`);
    }
    
    // Pattern 4: Look for "TILL" or "UNTIL" patterns
    const tillPattern = /(?:TILL|UNTIL)\s+(\d{1,2}\s+[A-Z]{3}\s+\d{4}(?:\s+\d{2}:\d{2})?)/i;
    const tillMatch = searchText.match(tillPattern);
    if (tillMatch) {
      const dateStr = tillMatch[1].includes(':') ? tillMatch[1] : `${tillMatch[1]} 23:59`;
      notam.validTo = this.parseAlternativeDate(dateStr);
    }
    
    // Pattern 5: Look for permanent NOTAMs
    if (searchText.match(/PERM|PERMANENT/i)) {
      // Don't set any dates for permanent NOTAMs - they're always valid
      return;
    }
  }
  
  private parseNotamDate(dateStr: string): Date | undefined {
    // NOTAM date format: YYMMDDHHMM (10 digits)
    if (dateStr.length !== 10) return undefined;
    
    const year = 2000 + parseInt(dateStr.substring(0, 2));
    const month = parseInt(dateStr.substring(2, 4)) - 1; // JavaScript months are 0-based
    const day = parseInt(dateStr.substring(4, 6));
    const hour = parseInt(dateStr.substring(6, 8));
    const minute = parseInt(dateStr.substring(8, 10));
    
    return new Date(year, month, day, hour, minute);
  }
  
  private parseAlternativeDate(dateStr: string): Date | undefined {
    // Parse "01 JAN 2025 12:00" format
    const parts = dateStr.split(/\s+/);
    if (parts.length !== 4) return undefined;
    
    const day = parseInt(parts[0]);
    const monthStr = parts[1];
    const year = parseInt(parts[2]);
    const timeParts = parts[3].split(':');
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);
    
    const monthMap: { [key: string]: number } = {
      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };
    
    const month = monthMap[monthStr];
    if (month === undefined) return undefined;
    
    return new Date(year, month, day, hour, minute);
  }

  private cleanText(text: string): string {
    // Clean up excessive whitespace and normalize the text for readability
    return text
      .split('\n')                    // Split into lines
      .map(line => line.trim())       // Trim each line
      .filter(line => line.length > 0) // Remove empty lines
      .join(' ')                      // Join with spaces instead of newlines
      .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
      .trim();                        // Final trim
  }
}
