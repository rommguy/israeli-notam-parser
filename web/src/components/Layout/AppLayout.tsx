import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import { FlightTakeoff } from "@mui/icons-material";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title = "NOTAM Viewer",
  subtitle = "Israeli Aviation Authority NOTAMs",
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "grey.50",
      }}
    >
      {/* App Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "primary.main",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Toolbar>
          <FlightTakeoff
            sx={{
              mr: 2,
              fontSize: 28,
              color: "primary.contrastText",
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 600,
                color: "primary.contrastText",
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.primary.contrastText, 0.8),
                  fontSize: "0.875rem",
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
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 0,
            bgcolor: "transparent",
            flexGrow: 1,
          }}
        >
          {children}
        </Paper>
      </Container>

      {/* Sticky Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          backgroundColor: alpha(theme.palette.grey[100], 0.8),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          position: "sticky",
          bottom: 0,
          zIndex: theme.zIndex.appBar - 1,
          backdropFilter: "blur(8px)",
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 0.5, sm: 2 },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ fontSize: "0.75rem" }}
            >
              NOTAMs updated every day at 2:00 UTC
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{
                fontSize: "0.75rem",
                display: { xs: "none", sm: "inline" },
              }}
            >
              •
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ fontSize: "0.75rem" }}
            >
              Built by Guy Romm
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
