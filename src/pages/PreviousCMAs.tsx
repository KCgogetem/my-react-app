import React from "react";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";

const PreviousCMAs: React.FC = () => {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "80vh" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, maxWidth: 600, width: "100%", mt: 4 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Previous CMAs
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {/* Add your Previous CMAs content or list here */}
                This is the Previous CMAs page. Display your previous CMA records or workflow here.
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default PreviousCMAs;
