#!/usr/bin/env node

import { NotamParser } from './parser';
import { NotamFilterOptions } from './types';
import { parseISO, format, isValid } from 'date-fns';

interface CliOptions {
  flightDate?: string;
  icaoCode?: string;
  type?: string;
  export?: string;
  summary?: boolean;
  help?: boolean;
}

class NotamCli {
  private parser: NotamParser;
  
  constructor() {
    this.parser = new NotamParser();
  }
  
  async run(): Promise<void> {
    const options = this.parseArgs();
    
    if (options.help) {
      this.showHelp();
      return;
    }
    
    try {
      // Fetch and parse NOTAMs
      const data = await this.parser.fetchAndParseNotams();
      console.log(`\\nFetched ${data.totalCount} NOTAMs (Last updated: ${format(data.lastUpdated, 'dd MMM yyyy HH:mm')})\\n`);
      
      let filteredNotams = data.notams;
      
      // Apply filters if specified
      if (options.flightDate || options.icaoCode || options.type) {
        const filterOptions: NotamFilterOptions = {
          flightDate: options.flightDate ? this.parseDate(options.flightDate) : new Date()
        };
        
        if (options.icaoCode) {
          filterOptions.icaoCode = options.icaoCode.toUpperCase();
        }
        
        if (options.type) {
          filterOptions.type = options.type.toUpperCase() as any;
        }
        
        filteredNotams = this.parser.filterNotams(data.notams, filterOptions);
        
        console.log(`Filtered to ${filteredNotams.length} NOTAMs for:`);
        console.log(`  Flight Date: ${format(filterOptions.flightDate, 'dd MMM yyyy')}`);
        if (filterOptions.icaoCode) console.log(`  ICAO Code: ${filterOptions.icaoCode}`);
        if (filterOptions.type) console.log(`  Type: ${filterOptions.type}`);
        console.log('');
      }
      
      // Show summary if requested
      if (options.summary) {
        console.log('SUMMARY:');
        console.log('========');
        console.log(this.parser.generateSummary(filteredNotams));
        console.log('');
      }
      
      // Display NOTAMs
      if (filteredNotams.length === 0) {
        console.log('No NOTAMs found matching the specified criteria.');
      } else {
        console.log(`NOTAMS (${filteredNotams.length} found):`);
        console.log('='.repeat(50));
        
        filteredNotams.forEach((notam, index) => {
          console.log(`${index + 1}. ${this.parser.formatNotamForDisplay(notam)}`);
          console.log('');
        });
      }
      
      // Export to file if requested
      if (options.export) {
        const exportData = {
          ...data,
          notams: filteredNotams
        };
        this.parser.exportToJson(exportData, options.export);
      }
      
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  }
  
  private parseArgs(): CliOptions {
    const args = process.argv.slice(2);
    const options: CliOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--date':
        case '-d':
          options.flightDate = args[++i];
          break;
          
        case '--icao':
        case '-i':
          options.icaoCode = args[++i];
          break;
          
        case '--type':
        case '-t':
          options.type = args[++i];
          break;
          
        case '--export':
        case '-e':
          options.export = args[++i];
          break;
          
        case '--summary':
        case '-s':
          options.summary = true;
          break;
          
        case '--help':
        case '-h':
          options.help = true;
          break;
          
        default:
          if (!arg.startsWith('-')) {
            // Assume first non-flag argument is the flight date
            if (!options.flightDate) {
              options.flightDate = arg;
            }
          } else {
            console.warn(`Unknown option: ${arg}`);
          }
          break;
      }
    }
    
    return options;
  }
  
  private parseDate(dateStr: string): Date {
    // Try different date formats
    const formats = [
      // ISO format: 2025-01-15
      () => parseISO(dateStr),
      // DD/MM/YYYY
      () => {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date(NaN);
      },
      // DD-MM-YYYY
      () => {
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length <= 2) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date(NaN);
      },
      // MM/DD/YYYY
      () => {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        }
        return new Date(NaN);
      }
    ];
    
    for (const formatFn of formats) {
      const date = formatFn();
      if (isValid(date)) {
        return date;
      }
    }
    
    throw new Error(`Invalid date format: ${dateStr}. Use formats like: 2025-01-15, 15/01/2025, or 15-01-2025`);
  }
  
  private showHelp(): void {
    console.log(`
NOTAM Parser for Israeli Aviation Authority
==========================================

Usage: npm run parse [options] [flight-date]

Options:
  -d, --date <date>     Flight date to filter NOTAMs (YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY)
  -i, --icao <code>     Filter by ICAO airport code (e.g., LLBG, LLLL)
  -t, --type <type>     Filter by NOTAM type (A=Aerodrome, C=En-route, R=Radar, N=Navigation)
  -e, --export <file>   Export filtered results to JSON file
  -s, --summary         Show summary statistics
  -h, --help            Show this help message

Examples:
  npm run parse                           # Show all current NOTAMs
  npm run parse 2025-01-15               # Show NOTAMs valid on Jan 15, 2025
  npm run parse --date 15/01/2025        # Same as above, different date format
  npm run parse -d 2025-01-15 -i LLBG    # NOTAMs for Ben Gurion Airport on specific date
  npm run parse -d 2025-01-15 -t A       # Only aerodrome NOTAMs for specific date
  npm run parse -s                       # Show summary statistics
  npm run parse -d 2025-01-15 -e notams.json  # Export filtered NOTAMs to file

ICAO Codes for Israeli Airports:
  LLBG - Ben Gurion Airport
  LLHA - Haifa Airport  
  LLOV - Ovda Airport
  LLER - Ramon Airport
  LLLL - Tel Aviv FIR (Flight Information Region)
`);
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  const cli = new NotamCli();
  cli.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { NotamCli };
