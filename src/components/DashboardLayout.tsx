

import React from "react";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

import SideMenu from "./SideMenu";
import Header from "./Header";
// import ChartUserByCountry from "./ChartCmaByCounty";
import HighlightedCard from "./HighlightedCard";
import CustomizedDataGrid from "./CustomizedDataGrid";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          {/* <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mb: 3 }}>
            <ChartUserByCountry />
            <CustomizedDataGrid />
          </Box> */}
          {/* Removed HighlightedCard (explore your data) */}
          {children}
        </Box>
      </Box>
    </AppTheme>
  );
}
