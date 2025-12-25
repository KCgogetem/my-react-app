// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./amplify-auth";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { VerifiedAddressProvider } from "./lib/VerifiedAddressContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <VerifiedAddressProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </VerifiedAddressProvider>
  </React.StrictMode>
);