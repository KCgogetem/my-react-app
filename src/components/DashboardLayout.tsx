

import React from "react";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

import SideMenu from "./SideMenu";
import Header from "./Header";
import ChartUserByCountry from "./ChartCmaByCounty";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <ChartUserByCountry />
          {children}
        </Box>
      </Box>
    </AppTheme>
  );
}
