import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import {
  Assessment,
  Flight,
  Radar,
  Navigation,
  Traffic,
} from '@mui/icons-material';

interface StatsBarProps {
  stats: {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byIcao: Record<string, number>;
  };
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'A': return <Flight sx={{ fontSize: 16 }} />;
      case 'C': return <Traffic sx={{ fontSize: 16 }} />;
      case 'R': return <Radar sx={{ fontSize: 16 }} />;
      case 'N': return <Navigation sx={{ fontSize: 16 }} />;
      default: return <Assessment sx={{ fontSize: 16 }} />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'A': return 'Aerodrome';
      case 'C': return 'En-route';
      case 'R': return 'Radar';
      case 'N': return 'Navigation';
      default: return type;
    }
  };

  const topIcaoCodes = Object.entries(stats.byIcao)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Assessment sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Statistics
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: 2 
      }}>
        {/* Overview */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
            {stats.total}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total NOTAMs
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
            {stats.unread}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Unread
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
            {stats.total - stats.unread}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Read
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
            {Math.round(((stats.total - stats.unread) / stats.total) * 100) || 0}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completion
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 2 
      }}>
        {/* By Type */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            By Type
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(stats.byType).map(([type, count]) => (
              <Chip
                key={type}
                icon={getTypeIcon(type)}
                label={`${getTypeName(type)}: ${count}`}
                variant="outlined"
                size="small"
                color="primary"
              />
            ))}
          </Box>
        </Box>

        {/* Top ICAO Codes */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Top Airports/FIRs
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {topIcaoCodes.map(([icao, count]) => (
              <Chip
                key={icao}
                label={`${icao}: ${count}`}
                variant="outlined"
                size="small"
                color="secondary"
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
