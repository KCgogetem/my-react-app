// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./amplify-auth";
import { CssBaseline } from "@mui/material";
import { VerifiedAddressProvider } from "./lib/VerifiedAddressContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <VerifiedAddressProvider>
      <CssBaseline />
      <App />
    </VerifiedAddressProvider>
  </React.StrictMode>
);