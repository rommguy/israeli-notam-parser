# NOTAM Parser for Israeli Aviation Authority

A comprehensive toolkit for parsing and viewing NOTAMs (Notice to Airmen) from the Israeli Aviation Authority, featuring both a command-line interface and a modern web application.

## 🚀 Quick Start

### 🌐 Live Demo
**[View Live Application](https://rommguy.github.io/israeli-notam-parser/)**

### Web Application (Local Development)
```bash
npm run dev:web
```
Visit `http://localhost:5173` for an interactive NOTAM viewer with filtering, read/unread tracking, and statistics.

### Command Line Interface
```bash
npm run parse -- -d 2025-01-15 -i LLBG
```

## 🌟 Features

### Web Application
- 📅 **Date Selection**: View NOTAMs for today or tomorrow
- 🏢 **ICAO Filtering**: Multi-select filtering by Israeli airports/FIRs
- ✅ **Read/Unread Tracking**: Mark NOTAMs as read with persistent storage
- 📊 **Statistics Dashboard**: Real-time stats and completion tracking
- 🗺️ **Google Maps Integration**: Clickable location links
- 📱 **Responsive Design**: Mobile-friendly Material-UI interface

### Command Line Interface
- 🌐 **Live Data Fetching**: Direct from Israeli Aviation Authority
- 🔍 **Advanced Filtering**: By date, ICAO code, and NOTAM type
- 📤 **JSON Export**: Structured data export capabilities
- 📈 **Summary Statistics**: Quick overview of NOTAM data
- ⏰ **Automated Scheduling**: Daily GitHub Actions for data updates

## 📦 Installation

```bash
# Install CLI dependencies
npm install

# Install web application dependencies
npm run install:web

# Or install both
npm install && npm run install:web
```

## 💻 Usage

### Web Application

```bash
# Start development server
npm run dev:web

# Build for production
npm run build:web

# Build both CLI and web app
npm run build:all
```

The web application will be available at `http://localhost:5173` with:
- Interactive NOTAM cards with read/unread status
- Real-time filtering by date and ICAO codes
- Statistics dashboard showing completion progress
- Mobile-responsive Material-UI design

### Command Line Interface

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

## 🏗️ Project Structure

```
notam-parser/
├── web/                    # React web application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # Data loading
│   │   └── types/          # TypeScript types
│   └── public/data/        # NOTAM JSON files
├── src/                    # CLI application
│   ├── index.ts           # CLI entry point
│   ├── parser.ts          # NOTAM parsing logic
│   ├── scraper.ts         # Web scraping
│   └── types.ts           # Shared type definitions
├── daily-notams/          # Generated NOTAM data
└── .github/workflows/     # Automated data fetching
```

## 🛠️ Development

### CLI Development
```bash
# Build TypeScript
npm run build

# Run with ts-node (development)
npm start
```

### Web Development
```bash
# Start web development server
npm run dev:web

# Build web application
npm run build:web
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
