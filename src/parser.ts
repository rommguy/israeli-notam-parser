import { NOTAM, NotamFilterOptions, ParsedNotamData } from './types';
import { NotamScraper } from './scraper';
import { isWithinInterval, parseISO, format } from 'date-fns';

export class NotamParser {
  private scraper: NotamScraper;
  
  constructor() {
    this.scraper = new NotamScraper();
  }
  
  async fetchAndParseNotams(): Promise<ParsedNotamData> {
    try {
      console.log('Fetching NOTAMs from Israeli Aviation Authority...');
      const html = await this.scraper.fetchNotams();
      
      console.log('Parsing NOTAM data...');
      const notams = this.scraper.parseHtmlContent(html);
      
      return {
        notams,
        lastUpdated: new Date(),
        totalCount: notams.length
      };
    } catch (error) {
      throw new Error(`Failed to fetch and parse NOTAMs: ${error}`);
    }
  }
  
  filterNotamsByDate(notams: NOTAM[], flightDate: Date): NOTAM[] {
    return notams.filter(notam => this.isNotamValidOnDate(notam, flightDate));
  }
  
  filterNotams(notams: NOTAM[], options: NotamFilterOptions): NOTAM[] {
    let filteredNotams = notams;
    
    // Filter by flight date
    filteredNotams = this.filterNotamsByDate(filteredNotams, options.flightDate);
    
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
  
  private isNotamValidOnDate(notam: NOTAM, flightDate: Date): boolean {
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
  
  formatNotamForDisplay(notam: NOTAM): string {
    const validityInfo = this.getValidityString(notam);
    
    return [
      `ID: ${notam.id}`,
      `ICAO: ${notam.icaoCode}`,
      `Type: ${this.getTypeDescription(notam.type)}`,
      notam.validFrom ? `Valid From: ${format(notam.validFrom, 'dd MMM yyyy HH:mm')}` : '',
      notam.validTo ? `Valid To: ${format(notam.validTo, 'dd MMM yyyy HH:mm')}` : '',
      !notam.validFrom && !notam.validTo ? 'Validity: Not specified (assumed current)' : '',
      `Description: ${notam.description}`,
      '---'
    ].filter(line => line).join('\\n');
  }
  
  private getValidityString(notam: NOTAM): string {
    if (notam.validFrom && notam.validTo) {
      return `${format(notam.validFrom, 'dd MMM yyyy HH:mm')} - ${format(notam.validTo, 'dd MMM yyyy HH:mm')}`;
    } else if (notam.validFrom) {
      return `From ${format(notam.validFrom, 'dd MMM yyyy HH:mm')}`;
    } else if (notam.validTo) {
      return `Until ${format(notam.validTo, 'dd MMM yyyy HH:mm')}`;
    }
    return '';
  }
  
  private getTypeDescription(type: NOTAM['type']): string {
    switch (type) {
      case 'A': return 'Aerodrome';
      case 'C': return 'En-route';
      case 'R': return 'Radar';
      case 'N': return 'Navigation';
      default: return type;
    }
  }
  
  exportToJson(data: ParsedNotamData, filePath?: string): string {
    const jsonData = JSON.stringify(data, null, 2);
    
    if (filePath) {
      const fs = require('fs');
      fs.writeFileSync(filePath, jsonData, 'utf8');
      console.log(`NOTAMs exported to ${filePath}`);
    }
    
    return jsonData;
  }
  
  generateSummary(notams: NOTAM[]): string {
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
        `  ${this.getTypeDescription(type as NOTAM['type'])}: ${count}`
      ),
      '',
      'By Airport/FIR:',
      ...Object.entries(icaoCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10) // Show top 10
        .map(([icao, count]) => `  ${icao}: ${count}`)
    ];
    
    return summary.join('\\n');
  }
}
