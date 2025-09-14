import { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Box, Alert } from "@mui/material";
import { AppLayout } from "./components/Layout/AppLayout";
import { DateSelector } from "./components/DateSelector/DateSelector";
import { IcaoFilter } from "./components/IcaoFilter/IcaoFilter";
import { CenterPosFilter } from "./components/CenterPosFilter/CenterPosFilter";
import { ViewToggle } from "./components/ViewToggle/ViewToggle";
import { NotamList } from "./components/NotamList/NotamList";
import { StatsBar } from "./components/StatsBar/StatsBar";
import { useNotams } from "./hooks/useNotams";
import { getUniqueIcaoCodes } from "./services/notamService";

// Create Material-UI theme with aviation colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#1565C0", // Aviation blue
      light: "#42A5F5",
      dark: "#0D47A1",
    },
    secondary: {
      main: "#FF6F00", // Aviation orange
      light: "#FFB74D",
      dark: "#E65100",
    },
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Use the custom hook for NOTAM data management
  const {
    notams,
    filteredNotams,
    isLoading,
    error,
    stats,
    selectedIcaoCodes,
    showOnlyUnread,
    centerPosFilter,
    setSelectedIcaoCodes,
    setShowOnlyUnread,
    setCenterPosFilter,
    toggleReadStatus,
    isRead,
  } = useNotams(selectedDate);

  // Get available ICAO codes from current data
  const availableIcaoCodes = getUniqueIcaoCodes(notams);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Left Sidebar - Controls */}
          <Box
            sx={{
              width: { xs: "100%", md: "300px" },
              flexShrink: 0,
              position: { md: "sticky" },
              top: { md: 24 },
              alignSelf: { md: "flex-start" },
            }}
          >
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              disabled={isLoading}
            />

            <IcaoFilter
              selectedIcaoCodes={selectedIcaoCodes}
              onIcaoCodesChange={setSelectedIcaoCodes}
              availableIcaoCodes={availableIcaoCodes}
              disabled={isLoading}
            />

            <CenterPosFilter
              centerPosFilter={centerPosFilter}
              onCenterPosFilterChange={setCenterPosFilter}
              disabled={isLoading}
            />

            <ViewToggle
              showOnlyUnread={showOnlyUnread}
              onToggle={setShowOnlyUnread}
              totalCount={stats.total}
              unreadCount={stats.unread}
              disabled={isLoading}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Statistics */}
            {!isLoading && !error && stats.total > 0 && (
              <StatsBar stats={stats} />
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <NotamList
              notams={filteredNotams}
              isLoading={isLoading}
              error={error}
              isRead={isRead}
              onToggleRead={toggleReadStatus}
              emptyMessage={
                showOnlyUnread
                  ? "No unread NOTAMs found. Great job staying up to date!"
                  : "No NOTAMs found for the selected filters."
              }
            />
          </Box>
        </Box>
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;
