# NOTAM Parser - Quick Reference for AI Assistants

## 🚨 CRITICAL: JSON Export Requires --export Flag
```bash
# ❌ This only shows console output (no JSON file created)
npm run start

# ✅ This creates JSON file in results/ directory
npm run start -- --export notams.json
```

## 📁 Key Files
- `src/index.ts` - CLI entry point
- `src/scraper.ts` - Web scraping + text cleaning
- `src/parser.ts` - Filtering + formatting
- `results/` - JSON output directory

## 🔧 Common Commands
```bash
# Basic usage (console only)
npm run start

# Export to JSON
npm run start -- --export notams.json

# Filter + export
npm run start -- --date 2025-01-15 --icao LLBG --export filtered.json

# Help
npm run start -- --help
```

## 🐛 Quick Fixes
- **No JSON file?** → Add `--export filename.json`
- **Messy rawText?** → Check `cleanText()` in `src/scraper.ts`
- **No NOTAMs found?** → Check parsing regex in `parseHtmlContent()`
- **Date issues?** → CLI only accepts YYYY-MM-DD format

## 🧪 Quick Test
```bash
npm run start -- --export test.json && echo "✅ JSON created" || echo "❌ Failed"
```
