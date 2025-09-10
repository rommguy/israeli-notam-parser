import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import { FlightTakeoff } from '@mui/icons-material';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title = "NOTAM Viewer", 
  subtitle = "Israeli Aviation Authority NOTAMs"
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* App Bar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          bgcolor: 'primary.main',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        }}
      >
        <Toolbar>
          <FlightTakeoff 
            sx={{ 
              mr: 2, 
              fontSize: 28,
              color: 'primary.contrastText'
            }} 
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                color: 'primary.contrastText'
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: alpha(theme.palette.primary.contrastText, 0.8),
                  fontSize: '0.875rem'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: 3,
          minHeight: 'calc(100vh - 64px)', // Subtract AppBar height
        }}
      >
        <Paper 
          elevation={0}
          sx={{
            p: 0,
            bgcolor: 'transparent',
            minHeight: 'calc(100vh - 64px - 48px)', // Subtract AppBar and container padding
          }}
        >
          {children}
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          backgroundColor: alpha(theme.palette.grey[100], 0.5),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        }}
      >
        <Container maxWidth="xl">
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center"
            sx={{ fontSize: '0.75rem' }}
          >
            Data sourced from Israeli Aviation Authority • 
            Last updated: {new Date().toLocaleString()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
