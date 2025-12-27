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

  const [cmaResult, setCmaResult] = useState<any>(null);
  useEffect(() => {
    if (!verifiedAddress) return;
    setRunError(null);
    setCmaResult(null);
    setIsRunning(true);
    const requestId = `cma_${crypto.randomUUID()}`;
    apiFetch<{ status: string; request_id: string; result?: any }>("/cmas", {
      method: "POST",
      body: JSON.stringify({
        request_id: requestId,
        formatted_address: verifiedAddress,
        state_hint: stateHint,
        county_hint: countyHint,
      }),
    })
      .then(res => setCmaResult(res.result || res))
      .catch(err => {
        console.error("Run CMA failed:", err);
        setRunError(err?.message || "Failed to start CMA");
      })
      .finally(() => setIsRunning(false));
  }, [verifiedAddress]);

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "80vh" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, maxWidth: 600, width: "100%", mt: 4, bgcolor: "grey.900", color: "common.white" }}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: "common.white" }}>
                New CMA
              </Typography>

              <Typography variant="body1" sx={{ mb: 2, color: "grey.200" }}>
                {userName && userEmail
                  ? `Signed in as: ${userName} (${userEmail})`
                  : userEmail
                  ? `Signed in as: ${userEmail}`
                  : "Identifying signed-in user..."}
              </Typography>

              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: "grey.100" }}>
                Verified Address:
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: "grey.200" }}>
                {verifiedAddress}
              </Typography>

              <Typography variant="body1" sx={{ mb: 2, color: "grey.100" }}>
                Are you ready to run the new CMA, or would you like to provide additional info?
              </Typography>

              {runError && (
                <Typography variant="body2" color="error" sx={{ mb: 2, color: "error.light" }}>
                  {runError}
                </Typography>
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={isRunning}
                >
                  Additional Info
                </Button>
              </Stack>

              {/* Display CMA results after running */}
              {cmaResult && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: "common.white" }}>
                    CMA Results
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "grey.800", color: "grey.100" }}>
                    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color: "inherit" }}>{JSON.stringify(cmaResult, null, 2)}</pre>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default NewCMA;