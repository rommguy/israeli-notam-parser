# AI Assistant Guide for NOTAM Parser Project

## Project Overview
This is a TypeScript-based NOTAM (Notice to Airmen) parser that scrapes and parses NOTAMs from the Israeli Aviation Authority website. It provides filtering, formatting, and export capabilities.

## Key Project Structure
```
src/
├── index.ts      # CLI entry point and main logic
├── parser.ts     # Main parser class with filtering/formatting
├── scraper.ts    # Web scraping and HTML parsing logic
└── types.ts      # TypeScript type definitions

results/          # Output directory for exported JSON files (gitignored)
daily-notams/     # Automated daily NOTAM files (tracked in git)
.github/workflows/
└── daily-notam-fetch.yml  # GitHub Action for automated daily fetching
```

## Critical Understanding Points

### 1. JSON Export Behavior
**IMPORTANT**: The application does NOT automatically create JSON files. 
- JSON files are only created when using the `--export` or `-e` flag
- Without this flag, results are only displayed in the console
- Example: `npm run start -- --export notams.json`

### 2. Common Commands
```bash
# View all NOTAMs (console only)
npm run start

# Export all NOTAMs to JSON
npm run start -- --export notams.json

# Filter and export
npm run start -- --date 2025-01-15 --icao LLBG --export filtered.json

# Show help
npm run start -- --help
```

### 3. Key Classes and Methods

#### NotamScraper (src/scraper.ts)
- `fetchNotams()`: Downloads HTML from IAA website
- `parseHtmlContent()`: Extracts NOTAMs from HTML
- `cleanText()`: Cleans excessive whitespace from raw text
- `extractDates()`: Parses validity dates from NOTAM text

#### NotamParser (src/parser.ts)
- `fetchAndParseNotams()`: Main orchestration method
- `filterNotams()`: Apply date/ICAO/type filters
- `exportToJson()`: Save results to file
- `formatNotamForDisplay()`: Format for console output

### 4. Data Flow
1. CLI parses arguments (`index.ts`)
2. Scraper fetches and parses HTML (`scraper.ts`)
3. Parser applies filters and formatting (`parser.ts`)
4. Results displayed in console (always)
5. Results exported to JSON (only if `--export` flag used)

## Troubleshooting Guide

### Issue: "JSON file not found" or "No results in JSON"
**Solution**: Make sure to use the `--export` flag when running the command.

### Issue: "rawText field has excessive whitespace"
**Solution**: The `cleanText()` method in `scraper.ts` handles this. Check if it's being called properly in both NOTAM creation locations.

### Issue: "No NOTAMs found"
**Possible causes**:
- Website structure changed (check `parseHtmlContent()` regex patterns)
- Network issues (check `fetchNotams()` method)
- Filters too restrictive (try without filters first)

### Issue: "Date parsing errors"
**Solution**: 
- For CLI date input: Only ISO format (YYYY-MM-DD) is accepted
- For NOTAM content parsing: Check `extractDates()` method in `scraper.ts` - may need new regex patterns for date formats found in NOTAMs

## Development Workflow

### Making Changes to Text Processing
1. Modify `cleanText()` method in `src/scraper.ts`
2. Test with: `npm run start -- --export test.json`
3. Check `results/test.json` for formatting

### Adding New Filters
1. Update `NotamFilterOptions` type in `src/types.ts`
2. Add filter logic in `filterNotams()` method in `src/parser.ts`
3. Add CLI argument parsing in `src/index.ts`

### Debugging Parsing Issues
1. Add console.log statements in `parseHtmlContent()` method
2. Run without export first to see console output
3. Check regex patterns against actual HTML structure

## Quick Verification Commands

```bash
# Test basic functionality
npm run start

# Test JSON export
npm run start -- --export test.json && cat results/test.json | head -20

# Test filtering
npm run start -- --date 2025-01-15 --summary

# Clean up test files
rm results/test.json
```

## File Locations for Common Tasks

- **Modify parsing logic**: `src/scraper.ts` → `parseHtmlContent()` method
- **Change text cleaning**: `src/scraper.ts` → `cleanText()` method  
- **Add new CLI options**: `src/index.ts` → `parseArgs()` method
- **Modify output format**: `src/parser.ts` → `formatNotamForDisplay()` method
- **Add new filters**: `src/parser.ts` → `filterNotams()` method

## Common Gotchas

1. **Always use `--export` flag** when you need JSON output
2. **Results directory** is automatically created if it doesn't exist
3. **Date formats** are flexible but follow specific parsing patterns
4. **ICAO codes** are automatically converted to uppercase
5. **Raw text cleaning** happens during parsing, not during export

## Automated Daily NOTAM Fetching

### GitHub Action Workflow
The project includes an automated GitHub Action (`.github/workflows/daily-notam-fetch.yml`) that:
- **Runs daily at 2:00 AM UTC** (4-5 AM Israel time)
- **Automatically fetches NOTAMs for tomorrow** 
- **Saves to `daily-notams/` directory** (tracked in git, not ignored)
- **Commits results automatically** to the repository
- **Can be triggered manually** from GitHub Actions tab

### Daily NOTAM Files
- **Location**: `daily-notams/` directory
- **Naming**: Files are named `YYYY-MM-DD.json` (e.g., `2025-09-12.json`)
- **Content**: Same structure as manual exports, but filtered for specific date
- **Retention**: Files are committed to git and also stored as GitHub artifacts for 30 days

### Manual Daily NOTAM Generation
To manually generate a daily NOTAM file for a specific date:
```bash
# Generate NOTAMs for tomorrow
npm run start -- --date $(date -d '+1 day' '+%Y-%m-%d') --export daily-notams/$(date -d '+1 day' '+%Y-%m-%d').json

# Generate NOTAMs for a specific date
npm run start -- --date 2025-09-15 --export daily-notams/2025-09-15.json
```

### Workflow Management
- **View runs**: GitHub repository → Actions tab → Daily NOTAM Fetch
- **Manual trigger**: Actions tab → Daily NOTAM Fetch → Run workflow
- **Download artifacts**: Available from workflow run pages (30-day retention)

## Testing Strategy

1. **Basic functionality**: Run without flags
2. **Export functionality**: Use `--export` flag and verify JSON file
3. **Filtering**: Test with various date/ICAO/type combinations
4. **Edge cases**: Test with invalid dates, unknown ICAO codes
5. **Text formatting**: Check `rawText` field in exported JSON for readability
6. **Automation testing**: Manually trigger GitHub Action workflow
