# System Patterns: NOTAM Parser for Israeli Aviation Authority
*Version: 1.0*
*Created: 2025-01-27*
*Last Updated: 2025-01-27*

## Architecture Overview
The NOTAM Parser follows a modular, layered architecture with clear separation of concerns. The system is designed as a command-line application with three main layers: CLI interface, business logic, and data access. Each layer has specific responsibilities and communicates through well-defined interfaces.

## Key Components
- **NotamCli**: CLI interface and argument parsing layer
- **NotamParser**: Core business logic for NOTAM processing and filtering
- **NotamScraper**: Data access layer for web scraping and HTML parsing
- **Type Definitions**: TypeScript interfaces for type safety and data contracts

## Design Patterns in Use
- **Command Pattern**: CLI interface encapsulates user commands and delegates to appropriate handlers
- **Strategy Pattern**: Different filtering strategies (by date, airport, type) are implemented as separate methods
- **Template Method Pattern**: Common NOTAM processing steps are defined in base methods with specific implementations
- **Factory Pattern**: NotamParser creates and configures NotamScraper instances
- **Data Transfer Object (DTO)**: NOTAM interface serves as a DTO for data transfer between layers

## Data Flow
```
User Input (CLI) 
    ↓
NotamCli.parseArgs()
    ↓
NotamParser.fetchAndParseNotams()
    ↓
NotamScraper.fetchNotams() → HTTP Request
    ↓
NotamScraper.parseHtmlContent() → HTML Parsing
    ↓
NotamParser.filterNotams() → Apply Filters
    ↓
NotamCli.displayResults() → Console Output
    ↓
NotamParser.exportToJson() → File Export (optional)
```

## Key Technical Decisions
- **Modular Architecture**: Separated concerns into distinct classes for maintainability and testability
- **TypeScript Types**: Comprehensive type definitions ensure data integrity and developer experience
- **Error Handling**: Centralized error handling with specific error types for different failure scenarios
- **Date Processing**: Multiple date format support with intelligent parsing and validation
- **Coordinate Conversion**: Automated conversion of aviation coordinates to Google Maps URLs
- **File Management**: Automatic directory creation and path resolution for export functionality

## Component Relationships
- **NotamCli** depends on **NotamParser** for all business logic
- **NotamParser** depends on **NotamScraper** for data access
- **NotamScraper** is independent and handles all web scraping concerns
- **Type definitions** are shared across all components for consistency

## Data Processing Pipeline
1. **Fetch**: HTTP request to Israeli Aviation Authority website
2. **Parse**: HTML content parsing using Cheerio and regex patterns
3. **Extract**: NOTAM data extraction with date and coordinate processing
4. **Filter**: Apply user-specified filters (date, airport, type)
5. **Format**: Prepare data for display and export
6. **Output**: Console display and optional JSON export

## Error Handling Strategy
- **Network Errors**: Timeout handling and connection error recovery
- **Parsing Errors**: Graceful degradation with partial data extraction
- **Validation Errors**: Clear error messages with format guidance
- **File System Errors**: Automatic directory creation and path validation

## Extensibility Points
- **New Data Sources**: Additional scrapers can be implemented following NotamScraper interface
- **New Filter Types**: Additional filtering strategies can be added to NotamParser
- **New Output Formats**: Export functionality can be extended for different file formats
- **New Date Formats**: Additional date parsing patterns can be added to NotamScraper

## Performance Characteristics
- **Memory Usage**: Linear with number of NOTAMs (in-memory processing)
- **Network Usage**: Single HTTP request per execution
- **Processing Time**: O(n) where n is the number of NOTAMs
- **Storage**: Minimal (only export files when requested)

---

*This document captures the system architecture and design patterns used in the project.*
