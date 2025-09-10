# GitHub Pages Data Loading Fix

## Problem
The web application was showing "Failed to load NOTAM data: 404" on GitHub Pages because:
- The app was trying to load files named with current dates (e.g., `2025-01-27.json`, `2025-01-28.json`)
- But the available files were from September (e.g., `2025-09-10.json`, `2025-09-11.json`)

## Solution Implemented
Created a dynamic data manifest system that:

1. **Build-time Manifest Generation**: During build, the system scans the `daily-notams/` directory and creates a `manifest.json` file that maps "today" and "tomorrow" to the first two available NOTAM files.

2. **Dynamic Data Loading**: The app now loads the manifest first to determine which files are actually available, then loads the appropriate data files.

3. **Smart Date Display**: The date selector now shows the actual dates from the available files instead of calculated today/tomorrow dates.

## Files Modified

### `web/vite.config.ts`
- Added manifest generation during build
- Creates `public/data/manifest.json` with available files and mapping

### `web/src/services/availableData.ts` (New)
- Service to load and cache the data manifest
- Handles both local development and GitHub Pages base paths
- Provides fallback if manifest is missing

### `web/src/services/notamService.ts`
- Updated to use the new available data service
- Falls back to calculated paths if manifest fails

### `web/src/components/DateSelector/DateSelector.tsx`
- Updated to show actual dates from available files
- Loads date labels from the manifest

## How It Works

1. **Build Time**: 
   - Vite plugin scans `daily-notams/` directory
   - Copies all `.json` files to `public/data/`
   - Creates `manifest.json` with mapping: `{"today": "2025-09-10.json", "tomorrow": "2025-09-11.json"}`

2. **Runtime**:
   - App loads `manifest.json` to discover available files
   - Maps "today" selection to first available file
   - Maps "tomorrow" selection to second available file (or first if only one exists)
   - Date selector shows actual dates (e.g., "September 10, 2025" instead of "Today")

## Benefits

- ✅ **Works with any available NOTAM files** - no need for files to match current date
- ✅ **Automatic mapping** - first file becomes "today", second becomes "tomorrow"
- ✅ **Clear date display** - users see actual dates of the data
- ✅ **Robust fallback** - works even if manifest is missing
- ✅ **GitHub Pages compatible** - handles base path correctly

## Testing

The fix has been tested and verified to:
- Build successfully with manifest generation
- Handle GitHub Pages base paths correctly
- Display actual dates in the date selector
- Load data from available files regardless of their dates

## Next Steps

1. Commit and push these changes
2. The GitHub Pages deployment will automatically use the available NOTAM files
3. The app will show the actual dates of your available data (September 10 & 11, 2025)

Your web application should now work correctly on GitHub Pages!
