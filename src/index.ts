import { initParser, fetchNotams } from "./scraper";
import { Browser } from "playwright";
import { NOTAM } from "./types";
import { parseISO, format, isValid } from "date-fns";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

interface CliOptions {
  help?: boolean;
  headless?: boolean;
}
const hardCodedFetchedIds = [
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
];

interface NotamFileData {
  notams: NOTAM[];
  totalCount: number;
  lastUpdated: string;
}

function getExistingNotamIds(): string[] {
  const filePath = join(process.cwd(), "daily-notams", "notams.json");

  if (!existsSync(filePath)) {
    console.log("📄 No existing NOTAM file found");
    return [];
  }

  try {
    const fileContent = readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent) as NotamFileData;
    const existingIds = data.notams?.map((notam) => notam.id) || [];
    console.log(`📋 Found ${existingIds.length} existing NOTAMs in file`);
    return existingIds;
  } catch (error) {
    console.warn(`⚠️  Warning: Could not read existing NOTAM file:`, error);
    return [];
  }
}

function saveNotamsToFile(notams: NOTAM[]): void {
  const fullPath = join(process.cwd(), "daily-notams", "notams.json");

  const dir = dirname(fullPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  let existingNotams: NOTAM[] = [];
  let existingData: NotamFileData | null = null;

  if (existsSync(fullPath)) {
    try {
      const fileContent = readFileSync(fullPath, "utf-8");
      existingData = JSON.parse(fileContent) as NotamFileData;
      existingNotams = existingData.notams || [];
    } catch (error) {
      console.warn(`Warning: Could not read existing file ${fullPath}:`, error);
      existingNotams = [];
    }
  }

  // Merge new NOTAMs with existing ones, avoiding duplicates
  const existingIds = new Set(existingNotams.map((notam) => notam.id));
  const newNotams = notams.filter((notam) => !existingIds.has(notam.id));

  const mergedNotams = [...existingNotams, ...newNotams];

  // Create the file data structure
  const fileData: NotamFileData = {
    notams: mergedNotams,
    totalCount: mergedNotams.length,
    lastUpdated: new Date().toISOString(),
  };

  // Write to file
  try {
    writeFileSync(fullPath, JSON.stringify(fileData, null, 2), "utf-8");
    console.log(`✅ Saved ${newNotams.length} new NOTAMs to ${fullPath}`);
    console.log(`📊 Total NOTAMs in file: ${mergedNotams.length}`);

    if (newNotams.length === 0) {
      console.log(
        `ℹ️  No new NOTAMs to add (all ${notams.length} NOTAMs already exist in file)`,
      );
    }
  } catch (error) {
    console.error(`❌ Error saving NOTAMs to ${fullPath}:`, error);
    throw error;
  }
}

const scrapeNotams = async (headless: boolean = true): Promise<void> => {
  const existingIds = getExistingNotamIds();
  const allExistingIds = [...new Set([...hardCodedFetchedIds, ...existingIds])];

  console.log(`🔍 Total existing IDs to skip: ${allExistingIds.length}`);
  console.log(`   - Hardcoded IDs: ${hardCodedFetchedIds.length}`);
  console.log(`   - From file: ${existingIds.length}`);

  let browser: Browser | null = null;
  try {
    const { browser: browserInstance, page } = await initParser({
      headless,
    });
    browser = browserInstance;
    const notams = await fetchNotams(page, allExistingIds);
    console.log(`🔍 Scraped ${notams.length} NOTAMs`);

    if (notams.length > 0) {
      saveNotamsToFile(notams);
    } else {
      console.log("ℹ️  No NOTAMs to save");
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log("🔒 Browser closed");
    }
  }
};

class NotamCli {
  private parseArgs(): CliOptions {
    const args = process.argv.slice(2);
    const options: CliOptions = {
      headless: true, // Default to headless mode
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case "--help":
        case "-h":
          options.help = true;
          break;

        case "--no-headless":
          options.headless = false;
          break;

        default:
          console.warn(
            `Unknown option: ${arg}. Use --help for available options.`,
          );
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
        `Invalid date format: ${dateStr}. Use ISO format: YYYY-MM-DD (e.g., 2025-01-15)`,
      );
    }

    return date;
  }

  private showHelp(): void {
    console.log(`
NOTAM Parser for Israeli Aviation Authority
==========================================

Usage: npm run parse [options]

Description:
  Fetches all new NOTAMs from the Israeli Aviation Authority website using
  Playwright browser automation. Only fetches NOTAMs that haven't been
  previously scraped (incremental updates). All filtering is handled by
  the web frontend application.

Options:
  -h, --help            Show this help message
  --no-headless         Run browser in visible mode (for debugging)

Examples:
  npm run parse                    # Fetch new NOTAMs (headless mode)
  npm run parse --no-headless      # Fetch new NOTAMs (visible browser for debugging)
  npm run parse --help             # Show this help message

Notes:
  - All NOTAM fetching uses Playwright browser automation for reliable data extraction
  - Only new NOTAMs are fetched to avoid duplicate processing
  - Fetched NOTAMs are saved to daily-notams/notams.json
  - Use the web application (npm run dev:web) for filtering and viewing NOTAMs
  - Browser automation handles dynamic content expansion automatically

ICAO Codes for Israeli Airports (for reference):
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
  const options = cli["parseArgs"]();

  if (options.help) {
    cli["showHelp"]();
    process.exit(0);
  }

  scrapeNotams(options.headless).catch((error) => {
    console.error("❌ Error during NOTAM scraping:", error);
    process.exit(1);
  });
}

export { NotamCli, saveNotamsToFile, getExistingNotamIds };
