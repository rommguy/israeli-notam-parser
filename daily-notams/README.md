# Daily NOTAM Files

This directory contains automatically generated NOTAM files for upcoming dates, created by the GitHub Action workflow.

## File Naming Convention
- Files are named in the format: `YYYY-MM-DD.json`
- Each file contains NOTAMs that are valid for the specified date

## Automation
- Files are automatically generated daily at 6:00 AM UTC
- The workflow fetches NOTAMs for the next day (tomorrow)
- Files are committed to this repository automatically

## Manual Generation
To manually generate NOTAMs for a specific date:
```bash
npm run start -- --date YYYY-MM-DD --export daily-notams/YYYY-MM-DD.json
```

## File Structure
Each JSON file contains:
- `totalCount`: Number of NOTAMs found
- `lastUpdated`: When the data was fetched
- `notams`: Array of NOTAM objects with details

## GitHub Action Workflow
The automation is handled by `.github/workflows/daily-notam-fetch.yml` which:
1. Runs daily at 6:00 AM UTC
2. Calculates tomorrow's date automatically
3. Fetches NOTAMs for that date
4. Commits the results to this directory
5. Uploads artifacts for easy download

## Manual Triggering
You can manually trigger the workflow from the GitHub Actions tab in the repository.
