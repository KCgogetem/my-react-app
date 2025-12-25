// src/pages/AuthCallback.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const err = params.get("error");

    if (err) {
      setError(err);
      return;
    }

    if (code) {
      // TODO: exchange `code` for tokens with your backend or use Amplify's OAuth helpers.
      // For now, we simply redirect to the dashboard. Replace this with your token handling flow.
      navigate("/dashboard", { replace: true });
    } else {
      setError("No authorization code found in the callback URL.");
    }
  }, [navigate]);

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Box sx={{ p: 4 }}>
            {error ? (
              <>
                <h2>Authentication error</h2>
                <p>{error}</p>
              </>
            ) : (
              <>
                <h2>Processing sign-in...</h2>
                <p>If you are not redirected automatically, please wait or return to the <a href="/login">login</a> page.</p>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
