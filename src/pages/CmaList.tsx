import React from "react";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";
import Stack from "@mui/material/Stack";

const CmaList: React.FC = () => {
  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1 }}>
          <Header />
          <Stack spacing={2} sx={{ p: 4 }}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                CMA Results List
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This is a placeholder for the CMA results list page. You can implement the list here.
              </Typography>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default CmaList;
