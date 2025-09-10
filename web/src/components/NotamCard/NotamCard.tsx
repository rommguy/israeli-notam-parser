import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Map,
  Flight,
  Schedule,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { NOTAM } from '../../types';

interface NotamCardProps {
  notam: NOTAM;
  isRead: boolean;
  onToggleRead: (notamId: string) => void;
}

export const NotamCard: React.FC<NotamCardProps> = ({
  notam,
  isRead,
  onToggleRead,
}) => {
  const theme = useTheme();

  const getTypeDescription = (type: NOTAM['type']): string => {
    switch (type) {
      case 'A': return 'Aerodrome';
      case 'C': return 'En-route';
      case 'R': return 'Radar';
      case 'N': return 'Navigation';
      default: return type;
    }
  };

  const getTypeColor = (type: NOTAM['type']): 'primary' | 'secondary' | 'warning' | 'info' => {
    switch (type) {
      case 'A': return 'primary';
      case 'C': return 'info';
      case 'R': return 'warning';
      case 'N': return 'secondary';
      default: return 'primary';
    }
  };

  const handleToggleRead = () => {
    onToggleRead(notam.id);
  };

  const handleMapClick = () => {
    if (notam.mapLink) {
      window.open(notam.mapLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card 
      elevation={isRead ? 1 : 3}
      sx={{
        mb: 2,
        opacity: isRead ? 0.7 : 1,
        backgroundColor: isRead 
          ? alpha(theme.palette.grey[100], 0.5)
          : 'background.paper',
        border: isRead 
          ? `1px solid ${alpha(theme.palette.grey[300], 0.5)}`
          : `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: isRead ? 2 : 4,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="h6" 
              component="h3"
              sx={{ 
                fontWeight: 700,
                color: isRead ? 'text.secondary' : 'primary.main',
              }}
            >
              {notam.id}
            </Typography>
            <Chip
              label={getTypeDescription(notam.type)}
              color={getTypeColor(notam.type)}
              size="small"
              variant={isRead ? 'outlined' : 'filled'}
            />
          </Box>
          
          <IconButton
            onClick={handleToggleRead}
            color={isRead ? 'default' : 'primary'}
            aria-label={isRead ? 'Mark as unread' : 'Mark as read'}
            sx={{ ml: 1 }}
          >
            {isRead ? <CheckCircle /> : <RadioButtonUnchecked />}
          </IconButton>
        </Box>

        {/* ICAO Code */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Flight sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            <strong>ICAO:</strong> {notam.icaoCode}
          </Typography>
        </Box>

        {/* Description */}
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 2,
            lineHeight: 1.6,
            color: isRead ? 'text.secondary' : 'text.primary',
          }}
        >
          {notam.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Created Date */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {format(notam.createdDate, 'MMM dd, HH:mm')}
              </Typography>
            </Box>

            {/* Validity Dates */}
            {(notam.validFrom || notam.validTo) && (
              <Box>
                {notam.validFrom && (
                  <Typography variant="caption" color="text.secondary">
                    From: {format(notam.validFrom, 'MMM dd, HH:mm')}
                  </Typography>
                )}
                {notam.validFrom && notam.validTo && (
                  <Typography variant="caption" color="text.secondary"> • </Typography>
                )}
                {notam.validTo && (
                  <Typography variant="caption" color="text.secondary">
                    To: {format(notam.validTo, 'MMM dd, HH:mm')}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Map Link */}
          {notam.mapLink && (
            <Button
              size="small"
              startIcon={<Map />}
              onClick={handleMapClick}
              variant="outlined"
              color="primary"
              sx={{ textTransform: 'none' }}
            >
              View Map
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
