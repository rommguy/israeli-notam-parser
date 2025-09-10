# NOTAM Viewer Web Application

A modern React-based web application for viewing and managing NOTAMs (Notice to Airmen) from the Israeli Aviation Authority.

## Features

- **Date Selection**: View NOTAMs for today or tomorrow
- **ICAO Filtering**: Multi-select filtering by airport/FIR codes
- **Read/Unread Management**: Mark NOTAMs as read/unread with local storage persistence
- **View Modes**: Toggle between showing all NOTAMs or unread only
- **Statistics Dashboard**: Real-time statistics showing totals, completion rates, and breakdowns
- **Google Maps Integration**: Clickable map links for NOTAMs with coordinate data
- **Responsive Design**: Mobile-friendly interface using Material-UI
- **Type Safety**: Full TypeScript implementation

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v6
- **Build Tool**: Vite
- **State Management**: React hooks with localStorage
- **Date Handling**: date-fns
- **Styling**: Material-UI theming with aviation colors

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server

The development server runs on `http://localhost:5173` by default.

## Data Source

The application loads NOTAM data from JSON files in the `public/data/` directory:
- `2025-09-10.json` - Today's NOTAMs
- `2025-09-11.json` - Tomorrow's NOTAMs

These files are automatically copied from the parent `daily-notams/` directory during the build process.

## Features Overview

### Date Selection
- Toggle between today and tomorrow
- Automatically loads the corresponding NOTAM data file
- Shows formatted dates for easy identification

### ICAO Code Filtering
- Multi-select dropdown with all available Israeli airports/FIRs
- Shows airport names alongside ICAO codes
- Filters NOTAMs in real-time as selections change

### Read/Unread Management
- Click the circle icon on any NOTAM card to mark as read/unread
- Read state persists across browser sessions using localStorage
- Global read state per NOTAM ID (not per date)

### View Modes
- **All NOTAMs**: Shows all NOTAMs matching current filters
- **Unread Only**: Shows only unread NOTAMs
- Badge counters show total and unread counts

### Statistics
- Total NOTAMs count
- Unread vs read counts
- Completion percentage
- Breakdown by NOTAM type (Aerodrome, En-route, etc.)
- Top airports/FIRs by NOTAM count

### NOTAM Cards
- Full NOTAM information display
- Type badges with color coding
- Created date and validity periods
- Clickable Google Maps links for coordinate data
- Visual distinction between read and unread items

## Project Structure

```
web/
├── public/
│   └── data/           # NOTAM JSON files (copied during build)
├── src/
│   ├── components/     # React components
│   │   ├── Layout/
│   │   ├── DateSelector/
│   │   ├── IcaoFilter/
│   │   ├── ViewToggle/
│   │   ├── NotamCard/
│   │   ├── NotamList/
│   │   └── StatsBar/
│   ├── hooks/          # Custom React hooks
│   ├── services/       # Data loading and processing
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── App.tsx         # Main application component
├── package.json
├── vite.config.ts      # Vite configuration with data copying
└── README.md
```

## Build Process

The Vite configuration includes a custom plugin that:
1. Creates the `public/data/` directory
2. Copies NOTAM JSON files from `../daily-notams/`
3. Ensures data is available for the application

## Browser Support

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Make changes to components or add new features
2. Test thoroughly with both today and tomorrow data
3. Ensure TypeScript compilation passes: `npm run build`
4. Test responsive design on mobile and desktop

## Integration with CLI Tool

This web application complements the existing CLI NOTAM parser by providing a user-friendly interface for the same data. The CLI tool continues to fetch and generate the daily JSON files that this web app consumes.