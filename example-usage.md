# NOTAM Parser - Example Usage

This document shows practical examples of how to use the NOTAM parser for flight planning.

## Example 1: Flight to Ben Gurion Airport

You're planning a flight to Ben Gurion Airport (LLBG) on January 15, 2025:

```bash
npm run parse -- -d 2025-01-15 -i LLBG
```

This will show you all NOTAMs that are valid for Ben Gurion Airport on that specific date.

## Example 2: All Aerodrome NOTAMs for a Date

To see all aerodrome-related NOTAMs for a specific date:

```bash
npm run parse -- -d 15/01/2025 -t A -s
```

The `-s` flag adds summary statistics showing how many NOTAMs of each type and for each airport.

## Example 3: Export for Flight Planning

Export filtered NOTAMs to a JSON file for use in flight planning software:

```bash
npm run parse -- -d 2025-01-15 -i LLBG -e flight-plan-notams.json
```

## Example 4: Quick Overview

Get a quick overview of all current NOTAMs:

```bash
npm run parse -- -s
```

## Example 5: Multiple Date Formats

The parser supports various date formats:

```bash
# ISO format (recommended)
npm run parse -- -d 2025-01-15

# DD/MM/YYYY format
npm run parse -- -d 15/01/2025

# DD-MM-YYYY format  
npm run parse -- -d 15-01-2025
```

## Sample Output

When you run the parser, you'll see output like this:

```
Fetched 114 NOTAMs (Last updated: 09 Sep 2025 21:29)

Filtered to 10 NOTAMs for:
  Flight Date: 15 Jan 2025
  ICAO Code: LLBG

NOTAMS (10 found):
==================================================
1. ID: A0807/25
ICAO: LLBG
Type: Aerodrome
Description: CRANES ERECTED AT TEL-AVIV VITANYA PROJECT, LIT AND DAY MARKED.
---

2. ID: A0803/25
ICAO: LLBG
Type: Aerodrome
Description: PREFERENTIAL DEP PROC AVBL H24, FLT NB VIA SID DAFNA,
---
```

## Flight Planning Workflow

1. **Check Current NOTAMs**: `npm run parse -- -s`
2. **Filter by Date and Airport**: `npm run parse -- -d [DATE] -i [ICAO]`
3. **Export for Records**: `npm run parse -- -d [DATE] -i [ICAO] -e notams.json`
4. **Review Aerodrome NOTAMs**: `npm run parse -- -d [DATE] -t A`

## Understanding NOTAM Types

- **A (Aerodrome)**: Airport closures, runway conditions, equipment outages
- **C (En-route)**: Airspace restrictions, navigation aid outages, route closures
- **R (Radar)**: Radar system outages or changes
- **N (Navigation)**: Navigation system changes or outages

This information is crucial for flight planning and safety.
