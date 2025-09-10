import React from 'react';
import { 
  ToggleButton, 
  ToggleButtonGroup, 
  Paper, 
  Typography, 
  Box 
} from '@mui/material';
import { Today, Event } from '@mui/icons-material';
import { getDateDisplayLabel } from '../../utils/dateUtils';

interface DateSelectorProps {
  selectedDate: 'today' | 'tomorrow';
  onDateChange: (date: 'today' | 'tomorrow') => void;
  disabled?: boolean;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  disabled = false,
}) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: 'today' | 'tomorrow' | null,
  ) => {
    if (newValue !== null) {
      onDateChange(newValue);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Select Date
        </Typography>
      </Box>
      
      <ToggleButtonGroup
        value={selectedDate}
        exclusive
        onChange={handleChange}
        aria-label="date selection"
        fullWidth
        disabled={disabled}
        sx={{
          '& .MuiToggleButton-root': {
            py: 1.5,
            px: 2,
            textTransform: 'none',
            border: '1px solid',
            borderColor: 'divider',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            },
          },
        }}
      >
        <ToggleButton value="today" aria-label="today">
          <Today sx={{ mr: 1 }} />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
              Today
            </Typography>
            <Typography variant="caption" component="div" color="text.secondary">
              {getDateDisplayLabel('today').split(' (')[1]?.replace(')', '')}
            </Typography>
          </Box>
        </ToggleButton>
        
        <ToggleButton value="tomorrow" aria-label="tomorrow">
          <Event sx={{ mr: 1 }} />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
              Tomorrow
            </Typography>
            <Typography variant="caption" component="div" color="text.secondary">
              {getDateDisplayLabel('tomorrow').split(' (')[1]?.replace(')', '')}
            </Typography>
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
};
