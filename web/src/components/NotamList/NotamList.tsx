import React from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import type { NOTAM } from '../../types';
import { NotamCard } from '../NotamCard/NotamCard';

interface NotamListProps {
  notams: NOTAM[];
  isLoading?: boolean;
  error?: string | null;
  isRead: (notamId: string) => boolean;
  onToggleRead: (notamId: string) => void;
  emptyMessage?: string;
}

export const NotamList: React.FC<NotamListProps> = ({
  notams,
  isLoading = false,
  error = null,
  isRead,
  onToggleRead,
  emptyMessage = "No NOTAMs found matching your criteria.",
}) => {
  if (isLoading) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          backgroundColor: 'transparent',
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
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        variant="outlined"
      >
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
          textAlign: 'center',
          backgroundColor: 'grey.50',
          border: '1px dashed',
          borderColor: 'grey.300',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Results Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          NOTAMs ({notams.length})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {notams.filter(notam => !isRead(notam.id)).length} unread • {notams.filter(notam => isRead(notam.id)).length} read
        </Typography>
      </Box>

      {/* NOTAM Cards */}
      <Box>
        {notams.map((notam) => (
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
