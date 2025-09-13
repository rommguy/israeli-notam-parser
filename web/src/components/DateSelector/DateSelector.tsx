import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CalendarToday } from "@mui/icons-material";
import { format, addDays, subDays } from "date-fns";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  disabled?: boolean;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  disabled = false,
}) => {
  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      onDateChange(newDate);
    }
  };

  // Quick date buttons for common selections
  const quickDates = [
    { label: "Yesterday", date: subDays(new Date(), 1) },
    { label: "Today", date: new Date() },
    { label: "Tomorrow", date: addDays(new Date(), 1) },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <CalendarToday
              sx={{ fontSize: 16, mr: 1, verticalAlign: "middle" }}
            />
            Select Date
          </Typography>
        </Box>

        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          disabled={disabled}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: "outlined",
              size: "small",
            },
          }}
          format="MMM dd, yyyy"
        />

        {/* Quick date selection buttons */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Quick select:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            {quickDates.map(({ label, date }) => (
              <Box
                key={label}
                component="button"
                onClick={() => onDateChange(date)}
                disabled={disabled}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "transparent",
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    borderColor: "primary.main",
                    color: "primary.main",
                  },
                  "&:disabled": {
                    cursor: "not-allowed",
                    opacity: 0.5,
                  },
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Selected date info */}
        <Box
          sx={{ mt: 2, p: 1, backgroundColor: "action.hover", borderRadius: 1 }}
        >
          <Typography variant="caption" color="text.secondary">
            Selected: {format(selectedDate, "EEEE, MMMM dd, yyyy")}
          </Typography>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};
