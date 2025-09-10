# NOTAM Parser Tests

This directory contains unit tests for the NOTAM parser functionality.

## Test Files

- `scraper.test.ts` - Tests for the main `parseHtmlContent` function
- `extractDates.test.ts` - Comprehensive tests for date extraction patterns

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest scraper.test.ts
npx jest extractDates.test.ts
```

## Test Coverage

The tests provide comprehensive coverage of the most critical parsing functionality:

### parseHtmlContent Function
- ✅ Parsing NOTAMs from HTML `<div>` elements
- ✅ Parsing NOTAMs from HTML `<td>` elements  
- ✅ Handling multiple NOTAMs in single HTML document
- ✅ Removing duplicate NOTAMs based on ID
- ✅ Handling malformed HTML gracefully
- ✅ Text cleaning and map link extraction
- ✅ Case handling (lowercase to uppercase conversion)

### extractDates Function (tested indirectly)
- ✅ **Pattern 1**: Standard NOTAM format `FROM 2501011200 TO 2501011800`
- ✅ **Pattern 2**: Alternative format `VALID FROM 15 JAN 2025 08:00 TO 15 JAN 2025 20:00`  
- ✅ **Pattern 3**: Single date patterns (`WEF`, `TILL`, `UNTIL`)
- ✅ Cross-day and cross-month validity periods
- ✅ All month abbreviations (JAN through DEC)
- ✅ Case-insensitive pattern matching
- ✅ Permanent NOTAMs handling
- ✅ Priority handling when multiple patterns exist

## Coverage Report

Current test coverage for critical parsing functions:
- **scraper.ts**: 93.38% statement coverage, 80.55% branch coverage
- The uncovered lines are in the HTTP fetch function, which is expected

## Test Data Patterns

The tests use realistic NOTAM data patterns based on Israeli Aviation Authority format:
- ICAO codes: LLBG, LLLL, LLTB, LLHA (Israeli airports)
- NOTAM types: A (Aerodrome), C (En-route), R (Radar), N (Navigation)
- Various date formats and validity periods
- Coordinate patterns for map link generation
