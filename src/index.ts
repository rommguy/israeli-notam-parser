import { initParser, fetchNotams } from "./scraper";
import { NOTAM } from "./types";
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
const hardCodedFetchedIds = [
  "C2228/25",
  "C2226/25",
  "C2227/25",
  "C2225/25",
  "C2223/25",
  "C2224/25",
  "A0830/25",
  "A0827/25",
  "A0828/25",
  "A0829/25",
  "A0825/25",
  "A0826/25",
  "A0821/25",
  "A0822/25",
  "A0823/25",
  "A0824/25",
  "A0819/25",
  "A0820/25",
  "A0817/25",
  "A0818/25",
  "A0816/25",
  "A0815/25",
  "C2221/25",
  "C2220/25",
  "C2219/25",
  "C2218/25",
  "C2217/25",
  "C2216/25",
  "C2215/25",
  "C2214/25",
  "C2213/25",
  "C2212/25",
  "C2211/25",
  "C2210/25",
  "C2209/25",
  "C2208/25",
  "C2207/25",
  "C2203/25",
  "C2192/25",
  "C2182/25",
  "C2178/25",
  "C2176/25",
  "C2174/25",
  "C2172/25",
  "C2167/25",
  "C2166/25",
  "C2164/25",
  "C2163/25",
  "C2162/25",
  "A0814/25",
  "C2157/25",
  "C2156/25",
  "C2153/25",
  "A0813/25",
  "C2146/25",
  "C2141/25",
  "A0811/25",
  "C2140/25",
  "A0809/25",
  "C2139/25",
  "C2138/25",
  "A0807/25",
  "C2134/25",
  "C2129/25",
  "C2126/25",
  "A0794/25",
  "A0781/25",
  "C2120/25",
  "C2118/25",
  "C2115/25",
  "C2116/25",
  "C2112/25",
  "C2113/25",
  "C2108/25",
  "C2106/25",
  "C2107/25",
  "C2101/25",
  "C2102/25",
  "C2103/25",
  "C2098/25",
  "C2099/25",
  "C2100/25",
  "C2094/25",
  "A0775/25",
  "A0774/25",
  "C2072/25",
  "A0768/25",
  "C2058/25",
  "A0760/25",
  "A0759/25",
  "A0758/25",
  "A0757/25",
  "C2048/25",
  "A0748/25",
  "C2005/25",
  "A0722/25",
  "A0695/25",
  "C1840/25",
  "A0694/25",
  "C1839/25",
  "C1737/25",
  "C1710/25",
  "A0675/25",
  "C1659/25",
  "C1646/25",
  "C1473/25",
  "C1326/25",
  "C1324/25",
  "C1313/25",
  "C1312/25",
  "C1288/25",
  "A0482/25",
  "A0449/25",
  "A0448/25",
  "A0447/25",
  "A0445/25",
  "A0446/25",
  "C0731/25",
  "C0042/25",
  "C0037/25",
  "C0035/25",
  "C0036/25",
  "C0033/25",
  "C0034/25",
  "A0042/25",
  "A0018/25",
];

class NotamCli {
  async scrapeMissingNotams(existingNotamIds: string[]): Promise<NOTAM[]> {
    try {
      const page = await initParser({ headless: false });
      return await fetchNotams(page, existingNotamIds);
    } finally {
      await [];
    }
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
  cli.scrapeMissingNotams(hardCodedFetchedIds).then((notams) => {
    console.log(notams);
  });
}

export { NotamCli };
