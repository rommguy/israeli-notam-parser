# System Patterns: NOTAM Parser for Israeli Aviation Authority
*Version: 1.1*
*Created: 2025-01-27*
*Last Updated: 2025-09-10*

## Architecture Overview
The NOTAM Parser follows a **functional programming architecture** with clear separation of concerns. The system is designed as a command-line application using stateless functions rather than classes. This approach emphasizes pure functions, immutability, and composition over inheritance.

## Key Components
- **NotamCli**: CLI interface and argument parsing (class retained for CLI structure)
- **Parser Functions**: Stateless functions for NOTAM processing and filtering
- **NotamScraper**: Data access layer for web scraping and HTML parsing (class retained for external library integration)
- **Type Definitions**: TypeScript interfaces for type safety and data contracts

## Design Patterns in Use
- **Functional Composition**: Functions are composed together to build complex operations
- **Pure Functions**: Most functions are pure with no side effects (filtering, formatting, parsing)
- **Separation of Concerns**: Side effects (HTTP, file I/O) are isolated in dedicated functions
- **Module Pattern**: Functions are grouped by responsibility and exported as modules
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
- **Functional Architecture**: Separated concerns into pure functions for maintainability and testability
- **No Custom Classes**: Business logic implemented as stateless functions to avoid state management complexity
- **TypeScript Types**: Comprehensive type definitions ensure data integrity and developer experience
- **Error Handling**: Centralized error handling with specific error types for different failure scenarios
- **Date Processing**: Multiple date format support with intelligent parsing and validation
- **Coordinate Conversion**: Automated conversion of aviation coordinates to Google Maps URLs
- **File Management**: Automatic directory creation and path resolution for export functionality

## Component Relationships
- **NotamCli** imports and calls **parser functions** directly
- **Parser functions** create **NotamScraper** instances as needed (dependency injection)
- **NotamScraper** is independent and handles all web scraping concerns
- **Type definitions** are shared across all components for consistency
- **Functions are stateless** - no persistent relationships between calls

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
