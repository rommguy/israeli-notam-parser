#!/usr/bin/env node

import { 
  fetchAndParseNotams,
  fetchAndParseNotamsIncremental,
  fetchAndParseNotamsFullRefresh,
  exportDailyNotamsFromStorage,
  filterNotams, 
  formatNotamForDisplay, 
  generateSummary, 
  exportToJson 
} from './parser';
import { NotamFilterOptions } from './types';
import { parseISO, format, isValid } from 'date-fns';

interface CliOptions {
  flightDate?: string;
  icaoCode?: string;
  type?: string;
  export?: string;
  summary?: boolean;
  help?: boolean;
  incremental?: boolean;
  fullRefresh?: boolean;
  headless?: boolean;
  fromStorage?: boolean;
}

class NotamCli {
  
  async run(): Promise<void> {
    const options = this.parseArgs();
    
    if (options.help) {
      this.showHelp();
      return;
    }
    
    try {
      let data;
      
      if (options.fromStorage) {
        // Export from existing storage without fetching new data
        if (options.export) {
          const flightDate = options.flightDate ? this.parseDate(options.flightDate) : new Date();
          const filterOptions: Partial<NotamFilterOptions> = {
            flightDate,
            icaoCode: options.icaoCode?.toUpperCase(),
            type: options.type?.toUpperCase() as any
          };
          
          await exportDailyNotamsFromStorage(
            format(flightDate, 'yyyy-MM-dd'),
            options.export,
            filterOptions
          );
          return;
        }
      }
      
      // Playwright is mandatory for aviation safety - always enabled
      const usePlaywright = true;
      const playwrightConfig = {
        headless: options.headless !== false // Default to true
      };
      
      if (options.fullRefresh) {
        console.log('Performing full refresh of all NOTAMs...');
        data = await fetchAndParseNotamsFullRefresh(usePlaywright, playwrightConfig);
      } else if (options.incremental) {
        console.log('Performing incremental update...');
        data = await fetchAndParseNotamsIncremental(usePlaywright, playwrightConfig);
      } else {
        // Default behavior - use incremental update with Playwright
        console.log('Performing incremental update (default)...');
        data = await fetchAndParseNotamsIncremental(usePlaywright, playwrightConfig);
      }
      
      const newInfo = data.newCount !== undefined ? ` (${data.newCount} new)` : '';
      console.log(`\\nFetched ${data.totalCount} NOTAMs${newInfo} (Last updated: ${format(data.lastUpdated, 'dd MMM yyyy HH:mm')})\\n`);
      
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
        
        filteredNotams = filterNotams(data.notams, filterOptions);
        
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
        console.log(generateSummary(filteredNotams));
        console.log('');
      }
      
      // Display NOTAMs
      if (filteredNotams.length === 0) {
        console.log('No NOTAMs found matching the specified criteria.');
      } else {
        console.log(`NOTAMS (${filteredNotams.length} found):`);
        console.log('='.repeat(50));
        
        filteredNotams.forEach((notam, index) => {
          console.log(`${index + 1}. ${formatNotamForDisplay(notam)}`);
          console.log('');
        });
      }
      
      // Export to file if requested
      if (options.export) {
        const exportData = {
          ...data,
          notams: filteredNotams
        };
        exportToJson(exportData, options.export);
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
          
        case '--incremental':
          options.incremental = true;
          break;
          
        case '--full-refresh':
          options.fullRefresh = true;
          break;
          
          
        case '--no-headless':
          options.headless = false;
          break;
          
        case '--from-storage':
          options.fromStorage = true;
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
    // Only accept ISO format: YYYY-MM-DD
    const date = parseISO(dateStr);
    
    if (!isValid(date)) {
      throw new Error(`Invalid date format: ${dateStr}. Use ISO format: YYYY-MM-DD (e.g., 2025-01-15)`);
    }
    
    return date;
  }
  
  private showHelp(): void {
    console.log(`
NOTAM Parser for Israeli Aviation Authority
==========================================

Usage: npm run parse [options] [flight-date]

Options:
  -d, --date <date>     Flight date to filter NOTAMs (YYYY-MM-DD format only)
  -i, --icao <code>     Filter by ICAO airport code (e.g., LLBG, LLLL)
  -t, --type <type>     Filter by NOTAM type (A=Aerodrome, C=En-route, R=Radar, N=Navigation)
  -e, --export <file>   Export filtered results to JSON file
  -s, --summary         Show summary statistics
  -h, --help            Show this help message

Fetching Options:
  --incremental         Force incremental update (only fetch new NOTAMs)
  --full-refresh        Force full refresh of all NOTAMs (ignore existing storage)
  --no-headless         Run browser in visible mode (for debugging)
  --from-storage        Export from existing storage without fetching new data

Note: All NOTAM fetching uses Playwright browser automation for complete data safety.
Legacy scraping has been disabled as it provides incomplete/dangerous partial data.

Examples:
  npm run parse                           # Show all current NOTAMs (incremental update)
  npm run parse --full-refresh           # Force complete refresh of all NOTAMs
  npm run parse --incremental            # Force incremental update only
  npm run parse --no-headless            # Run browser in visible mode (for debugging)
  npm run parse --from-storage -e daily.json  # Export from storage without fetching
  npm run parse 2025-01-15               # Show NOTAMs valid on Jan 15, 2025
  npm run parse --date 2025-01-15        # Same as above, using --date flag
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
