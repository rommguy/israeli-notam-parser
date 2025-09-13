# System Patterns: NOTAM Parser for Israeli Aviation Authority

_Version: 1.1_
_Created: 2025-01-27_
_Last Updated: 2025-09-10_

## Architecture Overview

The NOTAM Parser follows a **browser automation architecture** using Playwright for dynamic content handling. The system is designed as a command-line application that uses browser automation to interact with the Israeli Aviation Authority website, handle dynamic content expansion, and extract comprehensive NOTAM data. The architecture emphasizes functional programming principles with stateless functions and clear separation of concerns.

## Key Components

- **NotamCli**: CLI interface and argument parsing with basic functionality
- **Scraper Functions**: Browser automation functions for NOTAM fetching and parsing using Playwright
- **Parser Functions**: Stateless functions for NOTAM data extraction, date parsing, and coordinate processing
- **Type Definitions**: TypeScript interfaces for NOTAM data, Playwright configuration, and browser automation results

## Design Patterns in Use

- **Browser Automation Pattern**: Playwright handles dynamic content interaction and JavaScript execution
- **Functional Composition**: Functions are composed together to build complex parsing operations
- **Pure Functions**: Data parsing and coordinate processing functions are pure with no side effects
- **Separation of Concerns**: Browser automation, data parsing, and CLI handling are in separate modules
- **Module Pattern**: Functions are grouped by responsibility (scraping, parsing, CLI) and exported as modules
- **Data Transfer Object (DTO)**: NOTAM interface serves as a DTO for data transfer between functions

## Functional Programming Principles

- **No Custom Classes**: All business logic implemented as pure functions
- **Stateless Operations**: Functions don't maintain internal state
- **Immutable Data**: Input data is never modified, new data structures are returned
- **Explicit Dependencies**: All dependencies are passed as function parameters
- **Side Effect Isolation**: File I/O and HTTP requests are contained in specific functions

## Data Flow

```
User Input (CLI)
    ↓
NotamCli.parseArgs()
    ↓
NotamCli.fetchNotamIdsToScrape()
    ↓
initParser() → Launch Playwright Browser
    ↓
fetchNotams() → Browser Navigation & Dynamic Content Interaction
    ↓
parseNotam() → Extract NOTAM Data (Main Info + Expanded Details)
    ↓
expandNotam() → Click to Expand Dynamic Content
    ↓
parseAaBc() → Extract A/B/C Sections (ICAO, Valid From/To)
    ↓
parseQ() → Extract Q Section (Coordinates → Google Maps)
    ↓
Console Output (Currently) / Storage (Planned)
```

## Key Technical Decisions

- **Playwright Browser Automation**: Chosen over static scraping to handle dynamic content and JavaScript execution
- **Dynamic Content Expansion**: Automated clicking and waiting for content expansion to access complete NOTAM details
- **Incremental Fetching**: Compare against existing NOTAM IDs to avoid duplicate processing and improve efficiency
- **Functional Architecture**: Separated concerns into pure functions for maintainability and testability
- **TypeScript Types**: Comprehensive type definitions for NOTAM data, Playwright config, and automation results
- **Date Processing**: Specialized parsing for aviation date formats (YYMMDDHHMM) with UTC handling
- **Coordinate Conversion**: Automated conversion of aviation coordinates (DDMMSSN/DDDMMSSE) to Google Maps URLs
- **Error Handling**: Robust error handling for browser automation failures and network issues

## Component Relationships

- **NotamCli** imports and calls **scraper functions** directly from scraper.ts
- **Scraper functions** handle both browser automation and data parsing concerns
- **initParser()** creates and configures Playwright browser instances
- **fetchNotams()** orchestrates the complete NOTAM extraction process
- **parseNotam()**, **parseAaBc()**, **parseQ()** handle specific data extraction tasks
- **Type definitions** are shared across all components for consistency
- **Functions are stateless** - no persistent relationships between calls

## Data Processing Pipeline

1. **Browser Launch**: Initialize Playwright browser with configuration (headless/visible mode)
2. **Navigation**: Navigate to Israeli Aviation Authority NOTAM website and wait for content
3. **Discovery**: Find all NOTAM main info divs and extract item IDs and NOTAM IDs
4. **Filtering**: Compare against existing NOTAM IDs to identify new NOTAMs to process
5. **Expansion**: For each new NOTAM, click to expand dynamic content and wait for load
6. **Extraction**: Parse both main content and expanded details (A/B/C sections, Q coordinates, D descriptions)
7. **Processing**: Convert dates, parse coordinates, generate Google Maps links
8. **Output**: Currently console logging, planned storage implementation

## Error Handling Strategy

- **Browser Automation Errors**: Timeout handling for page loads and element interactions
- **Dynamic Content Errors**: Graceful handling when NOTAM expansion fails or content is missing
- **Parsing Errors**: Fallback mechanisms when NOTAM data format is unexpected
- **Network Errors**: Connection error recovery and retry mechanisms
- **Validation Errors**: Clear error messages for date parsing and coordinate extraction failures

## Extensibility Points

- **Storage Backends**: Different storage implementations can be added (JSON files, databases, cloud storage)
- **Browser Configurations**: Additional Playwright configurations for different environments
- **Data Processing**: Additional parsing functions for new NOTAM data fields
- **Output Formats**: Export functionality can be extended for different file formats
- **Filtering Logic**: Post-processing filters can be added for advanced NOTAM filtering

## Performance Characteristics

- **Memory Usage**: Linear with number of NOTAMs plus browser overhead (Chromium instance)
- **Network Usage**: Single page load plus dynamic content requests for NOTAM expansion
- **Processing Time**: O(n) where n is the number of new NOTAMs (incremental processing)
- **Browser Overhead**: Additional memory and CPU usage for Chromium browser instance
- **Storage**: Currently minimal (console output only), planned file-based storage

---

_This document captures the system architecture and design patterns used in the project._
