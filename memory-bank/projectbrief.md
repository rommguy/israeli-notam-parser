# Project Brief: NOTAM Parser for Israeli Aviation Authority
*Version: 1.0*
*Created: 2025-01-27*
*Last Updated: 2025-01-27*

## Project Overview
A TypeScript-based command-line tool that fetches, parses, and filters NOTAMs (Notice to Airmen) from the Israeli Aviation Authority website. The tool provides aviation professionals and pilots with the ability to retrieve relevant NOTAMs for specific flight dates, airports, and NOTAM types, with comprehensive filtering and export capabilities.

## Core Requirements
- **Data Fetching**: Retrieve live NOTAM data from the Israeli Aviation Authority website (https://brin.iaa.gov.il/aeroinfo/AeroInfo.aspx?msgType=Notam)
- **Data Parsing**: Parse HTML content to extract structured NOTAM information including ID, ICAO codes, types, validity dates, and descriptions
- **Date Filtering**: Filter NOTAMs based on flight dates with intelligent validity period matching
- **Airport Filtering**: Filter by specific ICAO airport codes (LLBG, LLHA, LLOV, LLER, LLLL)
- **Type Filtering**: Filter by NOTAM types (A=Aerodrome, C=En-route, R=Radar, N=Navigation)
- **Export Functionality**: Export filtered results to JSON format with automatic file management
- **Command-Line Interface**: User-friendly CLI with comprehensive options and help system
- **Summary Statistics**: Generate statistical summaries of NOTAM data
- **Coordinate Processing**: Extract and convert coordinate data to Google Maps links

## Success Criteria
- Successfully fetch and parse NOTAMs from the official Israeli Aviation Authority website
- Accurately filter NOTAMs by date, airport, and type with 100% accuracy
- Provide intuitive command-line interface with comprehensive help documentation
- Export data in structured JSON format for integration with other systems
- Handle various date formats and validity period scenarios correctly
- Generate meaningful summary statistics for data analysis
- Process coordinate data and generate Google Maps links for location-based NOTAMs

## Scope
### In Scope
- Web scraping of Israeli Aviation Authority NOTAM data
- NOTAM parsing and data extraction
- Date-based filtering with multiple validity period scenarios
- Airport and type-based filtering
- JSON export functionality
- Command-line interface with comprehensive options
- Summary statistics generation
- Coordinate extraction and Google Maps integration
- Error handling and validation
- TypeScript type safety and code organization

### Out of Scope
- Real-time data streaming or push notifications
- Database storage or persistence beyond file export
- Web interface or GUI
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
- ✅ Live data fetching from official source
- ✅ Comprehensive NOTAM parsing with date extraction
- ✅ Multi-criteria filtering (date, airport, type)
- ✅ JSON export with automatic file management
- ✅ Command-line interface with help system
- ✅ Summary statistics generation
- ✅ Coordinate processing and Google Maps integration
- ✅ Robust error handling and validation
- ✅ TypeScript implementation with type safety

---

*This document serves as the foundation for the project and informs all other memory files.*
