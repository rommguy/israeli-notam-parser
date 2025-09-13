# Project Brief: NOTAM Parser for Israeli Aviation Authority

_Version: 1.0_
_Created: 2025-01-27_
_Last Updated: 2025-01-27_

## Project Overview

A TypeScript-based command-line tool that fetches, parses, and filters NOTAMs (Notice to Airmen) from the Israeli Aviation Authority website. The tool provides aviation professionals and pilots with the ability to retrieve relevant NOTAMs for specific flight dates, airports, and NOTAM types, with comprehensive filtering and export capabilities.

## Core Requirements

- **Data Fetching**: Retrieve live NOTAM data from the Israeli Aviation Authority website using Playwright browser automation (https://brin.iaa.gov.il/aeroinfo/AeroInfo.aspx?msgType=Notam)
- **Data Parsing**: Parse dynamic HTML content with JavaScript execution to extract structured NOTAM information including ID, ICAO codes, validity dates, descriptions, and coordinates
- **Browser Automation**: Use Playwright to handle dynamic content expansion and interaction with the NOTAM website
- **Incremental Fetching**: Only fetch new NOTAMs by comparing against existing NOTAM IDs to avoid duplicate processing
- **Command-Line Interface**: User-friendly CLI with comprehensive options and help system
- **Coordinate Processing**: Extract and convert coordinate data to Google Maps links
- **Data Storage**: (Planned) Persist fetched NOTAMs to local storage for offline access and incremental updates

## Success Criteria

- Successfully fetch and parse NOTAMs from the official Israeli Aviation Authority website using browser automation
- Handle dynamic content expansion and JavaScript-rendered content correctly
- Extract complete NOTAM information including expanded details (A/B/C sections, Q coordinates, D descriptions)
- Provide incremental fetching to avoid processing duplicate NOTAMs
- Process coordinate data and generate Google Maps links for location-based NOTAMs
- Maintain robust error handling for browser automation failures
- Support both headless and visible browser modes for debugging

## Scope

### In Scope

- Browser automation for Israeli Aviation Authority NOTAM data fetching
- Dynamic content parsing with JavaScript execution
- NOTAM expansion and detailed data extraction (A/B/C sections, Q coordinates, D descriptions)
- Incremental fetching to avoid duplicate processing
- Command-line interface with browser automation options
- Coordinate extraction and Google Maps integration
- Error handling and validation for browser automation
- TypeScript type safety and code organization
- Support for both headless and visible browser modes

### Out of Scope

- Real-time data streaming or push notifications
- Database storage or persistence (currently planned for future implementation)
- Advanced filtering and export functionality (temporarily removed during refactoring)
- Integration with other aviation data sources
- Mobile application development
- User authentication or access control
- Data caching or optimization for high-frequency usage

## Timeline

- **Initial Development**: Completed (v1.0.0)
- **Feature Enhancements**: Ongoing
- **Maintenance and Updates**: As needed

## Stakeholders

- **Primary Users**: Pilots, aviation professionals, flight planners
- **Secondary Users**: Aviation data analysts, researchers
- **Maintainer**: Project developer/owner

## Technical Constraints

- Must work with the existing Israeli Aviation Authority website structure
- Limited to publicly available data (no authentication required)
- Must handle various date formats and NOTAM validity scenarios
- Should be compatible with standard Node.js environments
- Must respect website rate limiting and terms of service

## Key Features Delivered

- ✅ Browser automation with Playwright for dynamic content handling
- ✅ Live data fetching from official source with JavaScript execution
- ✅ Dynamic NOTAM expansion and detailed parsing (A/B/C sections, Q coordinates, D descriptions)
- ✅ Incremental fetching to avoid duplicate processing
- ✅ Coordinate processing and Google Maps integration
- ✅ Robust error handling for browser automation
- ✅ TypeScript implementation with type safety
- ⏳ Data persistence and storage (in development)
- ⏳ Advanced filtering and export functionality (planned for re-implementation)

---

_This document serves as the foundation for the project and informs all other memory files._
