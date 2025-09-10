# Technical Context: NOTAM Parser for Israeli Aviation Authority
*Version: 1.0*
*Created: 2025-01-27*
*Last Updated: 2025-01-27*

## Technology Stack
- **Runtime**: Node.js
- **Language**: TypeScript 5.9.2
- **HTTP Client**: Axios 1.6.2
- **HTML Parsing**: Cheerio 1.0.0-rc.12
- **Date Handling**: date-fns 2.30.0
- **Utilities**: Lodash 4.17.21
- **Development**: ts-node 10.9.1

## Development Environment Setup
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run with ts-node (development)
npm start

# Run the parser
npm run parse
```

## Dependencies
- **axios**: ^1.6.2 - HTTP client for fetching web data
- **cheerio**: ^1.0.0-rc.12 - Server-side jQuery for HTML parsing
- **date-fns**: ^2.30.0 - Date manipulation and formatting
- **lodash**: ^4.17.21 - Utility functions
- **@types/lodash**: ^4.17.20 - TypeScript types for Lodash
- **@types/node**: ^20.10.0 - TypeScript types for Node.js
- **ts-node**: ^10.9.1 - TypeScript execution for Node.js
- **typescript**: ^5.9.2 - TypeScript compiler and types

## Technical Constraints
- Must handle various NOTAM date formats (YYMMDDHHMM, DD MMM YYYY HH:MM)
- Must parse HTML content that may change structure over time
- Must respect website rate limiting and user-agent requirements
- Must handle network timeouts and connection errors gracefully
- Must work with coordinate formats (DDMMSSN/DDDMMSSE) and convert to Google Maps URLs

## Build and Deployment
- **Build Process**: TypeScript compilation using `tsc`
- **Entry Point**: `src/index.ts` (CLI application)
- **Output**: Compiled JavaScript in `dist/` directory (when built)
- **Deployment Procedure**: 
  - Install dependencies: `npm install`
  - Run directly with ts-node: `npm run parse`
  - Or build and run: `npm run build && node dist/index.js`
- **CI/CD**: Not currently configured (local development only)

## Testing Approach
- **Unit Testing**: Not currently implemented (placeholder in package.json)
- **Integration Testing**: Not currently implemented
- **E2E Testing**: Not currently implemented
- **Manual Testing**: Command-line interface testing with various parameters

## Project Structure
```
notam-parser/
├── src/
│   ├── index.ts          # CLI entry point and argument parsing
│   ├── parser.ts         # Main NOTAM parsing and filtering logic
│   ├── scraper.ts        # Web scraping and HTML parsing
│   └── types.ts          # TypeScript type definitions
├── results/              # Exported JSON files
├── daily-notams/         # Sample NOTAM data files
├── data/                 # Additional data files
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## Key Technical Decisions
- **TypeScript**: Chosen for type safety and better development experience
- **Cheerio**: Selected for HTML parsing due to jQuery-like API and server-side compatibility
- **date-fns**: Chosen over moment.js for better tree-shaking and modern date handling
- **Axios**: Selected for HTTP requests due to promise-based API and good error handling
- **CLI Architecture**: Modular design with separate classes for parsing, scraping, and CLI handling

## Data Flow
1. **CLI Input**: User provides command-line arguments (date, airport, type, export options)
2. **Web Scraping**: NotamScraper fetches HTML from Israeli Aviation Authority website
3. **HTML Parsing**: Cheerio parses HTML to extract NOTAM data using regex patterns
4. **Data Processing**: NotamParser processes raw data, extracts dates, and generates map links
5. **Filtering**: Apply user-specified filters (date, airport, type)
6. **Output**: Display results in console and/or export to JSON file

## Error Handling
- Network connectivity issues with timeout handling
- Invalid date format validation
- HTML parsing errors with fallback mechanisms
- File system errors for export functionality
- Graceful degradation when NOTAM data is malformed

## Performance Considerations
- Single HTTP request per execution (no caching)
- In-memory processing of NOTAM data
- Efficient regex patterns for data extraction
- Minimal memory footprint for typical NOTAM datasets

---

*This document describes the technologies used in the project and how they're configured.*
