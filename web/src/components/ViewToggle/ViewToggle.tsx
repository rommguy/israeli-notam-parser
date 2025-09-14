import type { MouseEvent } from "react";
import {
  Paper,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface ViewToggleProps {
  showOnlyUnread: boolean;
  onToggle: (showOnlyUnread: boolean) => void;
  totalCount: number;
  unreadCount: number;
  disabled?: boolean;
}

export const ViewToggle = ({
  showOnlyUnread,
  onToggle,
  totalCount,
  unreadCount,
  disabled = false,
}: ViewToggleProps) => {
  const handleChange = (
    _event: MouseEvent<HTMLElement>,
    newValue: "all" | "unread" | null,
  ) => {
    if (newValue !== null) {
      onToggle(newValue === "unread");
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          View Options
        </Typography>
      </Box>

      <ToggleButtonGroup
        value={showOnlyUnread ? "unread" : "all"}
        exclusive
        onChange={handleChange}
        aria-label="view toggle"
        fullWidth
        disabled={disabled}
        sx={{
          "& .MuiToggleButton-root": {
            py: 1,
            px: 2,
            textTransform: "none",
            border: "1px solid",
            borderColor: "divider",
            "&.Mui-selected": {
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            },
          },
        }}
      >
        <ToggleButton value="all" aria-label="show all NOTAMs">
          <Visibility sx={{ mr: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              All NOTAMs
            </Typography>
            <Badge
              badgeContent={totalCount}
              color="default"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.75rem",
                  height: 18,
                  minWidth: 18,
                },
              }}
            />
          </Box>
        </ToggleButton>

        <ToggleButton value="unread" aria-label="show unread NOTAMs only">
          <VisibilityOff sx={{ mr: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Unread Only
            </Typography>
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.75rem",
                  height: 18,
                  minWidth: 18,
                },
              }}
            />
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {unreadCount} of {totalCount} NOTAMs unread
        </Typography>
      </Box>
    </Paper>
  );
};
