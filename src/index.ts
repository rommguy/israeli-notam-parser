#!/usr/bin/env node

import {
  exportDailyNotamsFromStorage,
  filterNotams,
  formatNotamForDisplay,
  generateSummary,
  exportToJson,
} from "./parser";
import { fetchNotamsWithPlaywright } from "./scraperUtils";
import { NotamFilterOptions } from "./types";
import { parseISO, format, isValid } from "date-fns";

interface CliOptions {
  flightDate?: string;
  icaoCode?: string;
  type?: string;
  export?: string;
  summary?: boolean;
  help?: boolean;
  incremental?: boolean;
  headless?: boolean;
  fromStorage?: boolean;
}

class NotamCli {
  async fetchNotamIdsToScrape(): Promise<string[]> {
    return await fetchNotamsWithPlaywright();
  }

  private parseArgs(): CliOptions {
    const args = process.argv.slice(2);
    const options: CliOptions = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case "--date":
        case "-d":
          options.flightDate = args[++i];
          break;

        case "--icao":
        case "-i":
          options.icaoCode = args[++i];
          break;

        case "--type":
        case "-t":
          options.type = args[++i];
          break;

        case "--export":
        case "-e":
          options.export = args[++i];
          break;

        case "--summary":
        case "-s":
          options.summary = true;
          break;

        case "--help":
        case "-h":
          options.help = true;
          break;

        case "--incremental":
          options.incremental = true;
          break;

        case "--no-headless":
          options.headless = false;
          break;

        case "--from-storage":
          options.fromStorage = true;
          break;

        default:
          if (!arg.startsWith("-")) {
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
      throw new Error(
        `Invalid date format: ${dateStr}. Use ISO format: YYYY-MM-DD (e.g., 2025-01-15)`
      );
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

if (require.main === module) {
  const cli = new NotamCli();
  const notamIdsToScrape = cli.fetchNotamIdsToScrape().then((notamIds) => {
    console.log(notamIds);
    return notamIds;
  });
}

export { NotamCli };
