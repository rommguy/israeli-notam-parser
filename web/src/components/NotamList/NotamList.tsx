import { Box, Typography, Alert, CircularProgress, Paper } from "@mui/material";
import type { NOTAM } from "../../types";
import { NotamCard } from "../NotamCard/NotamCard";

interface NotamListProps {
  notams: NOTAM[];
  isLoading?: boolean;
  error?: string | null;
  isRead: (notamId: string) => boolean;
  onToggleRead: (notamId: string) => void;
  emptyMessage?: string;
  showOnlyUnread: boolean;
}

export const NotamList = ({
  notams,
  isLoading = false,
  error = null,
  isRead,
  onToggleRead,
  showOnlyUnread,
  emptyMessage = "No NOTAMs found matching your criteria.",
}: NotamListProps) => {
  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: "center",
          backgroundColor: "transparent",
        }}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Loading NOTAMs...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }} variant="outlined">
        <Typography variant="body2">
          <strong>Error loading NOTAMs:</strong> {error}
        </Typography>
      </Alert>
    );
  }

  if (notams.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: "center",
          backgroundColor: "grey.50",
          border: "1px dashed",
          borderColor: "grey.300",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  const readNotams = notams.filter((notam) => isRead(notam.id));
  const unreadNotams = notams.filter((notam) => !isRead(notam.id));
  const notamsToDisplay = showOnlyUnread ? unreadNotams : notams;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Filtered NOTAMs ({notams.length})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {unreadNotams.length} unread • {readNotams.length} read
        </Typography>
      </Box>

      {/* NOTAM Cards */}
      <Box>
        {notamsToDisplay.map((notam) => (
          <NotamCard
            key={notam.id}
            notam={notam}
            isRead={isRead(notam.id)}
            onToggleRead={onToggleRead}
          />
        ))}
      </Box>
    </Box>
  );
};
