import React from "react";
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";

interface CenterPosFilterProps {
  centerPosFilter: "all" | "north" | "south";
  onCenterPosFilterChange: (filter: "all" | "north" | "south") => void;
  disabled?: boolean;
}

export const CenterPosFilter: React.FC<CenterPosFilterProps> = ({
  centerPosFilter,
  onCenterPosFilterChange,
  disabled = false,
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as "all" | "north" | "south";
    onCenterPosFilterChange(value);
  };

  const getFilterDescription = (filter: "all" | "north" | "south") => {
    switch (filter) {
      case "all":
        return "Show all NOTAMs";
      case "north":
        return "North of 32.05°N (or no location)";
      case "south":
        return "South of 32.15°N (or no location)";
      default:
        return "";
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Filter by Geographic Region
        </Typography>
      </Box>

      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="centerpos-filter-label">Geographic Region</InputLabel>
        <Select
          labelId="centerpos-filter-label"
          value={centerPosFilter}
          onChange={handleChange}
          label="Geographic Region"
        >
          <MenuItem value="all">
            <Box>
              <Typography
                variant="body2"
                component="div"
                sx={{ fontWeight: 600 }}
              >
                All Regions
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Show all NOTAMs regardless of location
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem value="north">
            <Box>
              <Typography
                variant="body2"
                component="div"
                sx={{ fontWeight: 600 }}
              >
                Northern Region
              </Typography>
              <Typography variant="caption" color="text.secondary">
                North of 32.05°N (includes NOTAMs without location data)
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem value="south">
            <Box>
              <Typography
                variant="body2"
                component="div"
                sx={{ fontWeight: 600 }}
              >
                Southern Region
              </Typography>
              <Typography variant="caption" color="text.secondary">
                South of 32.15°N (includes NOTAMs without location data)
              </Typography>
            </Box>
          </MenuItem>
        </Select>
      </FormControl>

      {centerPosFilter !== "all" && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Filtering by: {getFilterDescription(centerPosFilter)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
