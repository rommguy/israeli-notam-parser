# NOTAM Parser for Israeli Aviation Authority

This script parses NOTAMs (Notice to Airmen) from the Israeli Aviation Authority website and allows filtering by flight date to show only NOTAMs that are valid during that specific date.

## Features

- Fetches live NOTAM data from https://brin.iaa.gov.il/aeroinfo/AeroInfo.aspx?msgType=Notam
- Parses NOTAM structure including ID, ICAO codes, types, and validity dates
- Filters NOTAMs by flight date to show only relevant notices
- Supports additional filtering by ICAO airport code and NOTAM type
- Exports filtered results to JSON format
- Provides summary statistics
- Command-line interface with ISO date format (YYYY-MM-DD)

## Installation

```bash
# Install dependencies
npm install

# Run the parser
npm run parse
```

## Usage

**Important:** When using `npm run parse`, you must use `--` to separate npm arguments from script arguments.

### Basic Usage

```bash
# Show all current NOTAMs
npm run parse

# Show NOTAMs valid on a specific date
npm run parse -- 2025-01-15
npm run parse -- --date 2025-01-15
npm run parse -- -d 2025-01-15
```

### Advanced Filtering

```bash
# Filter by specific airport (Ben Gurion)
npm run parse -- -d 2025-01-15 -i LLBG

# Filter by NOTAM type (Aerodrome NOTAMs only)
npm run parse -- -d 2025-01-15 -t A

# Combine filters
npm run parse -- -d 2025-01-15 -i LLBG -t A

# Show summary statistics
npm run parse -- -s

# Export results to JSON file (automatically saved to results/ folder)
npm run parse -- -d 2025-01-15 -e notams.json
```

## Command Line Options

- `-d, --date <date>`: Flight date to filter NOTAMs (YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY)
- `-i, --icao <code>`: Filter by ICAO airport code (e.g., LLBG, LLLL)
- `-t, --type <type>`: Filter by NOTAM type (A=Aerodrome, C=En-route, R=Radar, N=Navigation)
- `-e, --export <file>`: Export filtered results to JSON file
- `-s, --summary`: Show summary statistics
- `-h, --help`: Show help message

## ICAO Codes for Israeli Airports

- **LLBG** - Ben Gurion Airport (Tel Aviv)
- **LLHA** - Haifa Airport
- **LLOV** - Ovda Airport (Eilat)
- **LLER** - Ramon Airport (Eilat)
- **LLLL** - Tel Aviv FIR (Flight Information Region)

## NOTAM Types

- **A** - Aerodrome: NOTAMs related to airports and their facilities
- **C** - En-route: NOTAMs related to airspace and navigation aids
- **R** - Radar: NOTAMs related to radar systems
- **N** - Navigation: NOTAMs related to navigation systems

## Date Filtering Logic

The script filters NOTAMs based on their validity periods:

1. **NOTAMs with both start and end dates**: Included if the flight date falls within the validity period
2. **NOTAMs with only start date**: Included if the flight date is on or after the start date
3. **NOTAMs with only end date**: Included if the flight date is on or before the end date
4. **NOTAMs without date information**: Always included (assumed to be currently active)

## Output Format

Each NOTAM displays:
- NOTAM ID (e.g., A0042/25)
- ICAO airport/FIR code
- NOTAM type description
- Valid From date (if available)
- Valid To date (if available)
- Validity status (if no dates are specified)
- Description text

## File Export

Exported files are automatically saved to the `results/` folder:

- **Simple filename**: `npm run parse -- -e notams.json` → saves to `results/notams.json`
- **Relative path**: `npm run parse -- -e ./my-folder/notams.json` → saves to `results/my-folder/notams.json`
- **Absolute path**: Uses the exact path you specify

## Examples

```bash
# Check NOTAMs for a flight to Ben Gurion on January 15, 2025
npm run parse -- -d 2025-01-15 -i LLBG

# Get all aerodrome NOTAMs for a specific date with summary
npm run parse -- -d 2025-01-15 -t A -s

# Export all NOTAMs valid on a date to a file (saved to results/ folder)
npm run parse -- -d 2025-01-15 -e my-flight-notams.json
```

## Development

```bash
# Build TypeScript
npm run build

# Run with ts-node (development)
npm start
```

## Error Handling

The script includes robust error handling for:
- Network connectivity issues
- Invalid date formats
- Parsing errors
- Missing or malformed NOTAM data

## Dependencies

- **axios**: HTTP client for fetching web data
- **cheerio**: Server-side jQuery for HTML parsing
- **date-fns**: Date manipulation and formatting
- **typescript**: TypeScript compiler and types
