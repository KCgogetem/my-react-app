import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { fetchAuthSession } from "aws-amplify/auth";
import { apiFetch } from "../lib/api"; // adjust if your path differs
import { useVerifiedAddress } from "../lib/VerifiedAddressContext";

const NewCMA: React.FC = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);


  // Use context for verified address
  const { verifiedAddress } = useVerifiedAddress();
  const stateHint = "FL";     // TODO: set from address parsing
  const countyHint = "Seminole"; // TODO: set from your county resolver

  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthSession()
      .then((session) => {
        const payload = session.tokens?.idToken?.payload;
        let name: string | null = null;
        let email: string | null = null;

        if (payload) {
          if (typeof payload.name === "string") {
            name = payload.name;
          } else if (
            typeof payload.given_name === "string" ||
            typeof payload.family_name === "string"
          ) {
            name = `${payload.given_name || ""} ${payload.family_name || ""}`.trim();
          }
          if (typeof payload.email === "string") {
            email = payload.email;
          }
        }

        setUserName(name || null);
        setUserEmail(email || null);
      })
      .catch(() => {
        setUserName(null);
        setUserEmail(null);
      });
  }, []);

  async function handleRunCma() {
    setRunError(null);

    if (!verifiedAddress) {
      setRunError("Missing verified address.");
      return;
    }

    setIsRunning(true);

    // Use a stable ID so you can navigate + fetch later
    const requestId = `cma_${crypto.randomUUID()}`;

    try {
      const res = await apiFetch<{ status: string; request_id: string }>("/cmas", {
        method: "POST",
        body: JSON.stringify({
          request_id: requestId,
          formatted_address: verifiedAddress,
          state_hint: stateHint,
          county_hint: countyHint,
        }),
      });

      // Navigate to a CMA results page (you’ll build this route next)
      navigate(`/cmas/${res.request_id}`);
    } catch (err: any) {
      console.error("Run CMA failed:", err);
      setRunError(err?.message || "Failed to start CMA");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "80vh" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, maxWidth: 600, width: "100%", mt: 4 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                New CMA
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {userName && userEmail
                  ? `Signed in as: ${userName} (${userEmail})`
                  : userEmail
                  ? `Signed in as: ${userEmail}`
                  : "Identifying signed-in user..."}
              </Typography>

              <Typography variant="subtitle1" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
                Verified Address:
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {verifiedAddress}
              </Typography>

              <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
                Are you ready to run the new CMA, or would you like to provide additional info?
              </Typography>

              {runError && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  {runError}
                </Typography>
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRunCma}
                  disabled={isRunning}
                >
                  {isRunning ? "Running..." : "Run CMA"}
                </Button>

                <Button variant="outlined" color="primary">
                  Additional Info
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default NewCMA;