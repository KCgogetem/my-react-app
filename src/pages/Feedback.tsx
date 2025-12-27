import { useState } from "react";
import { Box, Button, Paper, TextField, Typography, Alert } from "@mui/material";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";

export default function Feedback() {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleShare() {
    setSending(true);
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
                Feedback
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                We would love to hear your feedback on CMPR. Are there things you would like it to do better or additional search parameters? Any feedback (even good) is helpful.
              </Typography>
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <TextField
                label="Your feedback"
                multiline
                minRows={4}
                fullWidth
                value={body}
                onChange={e => setBody(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleShare} disabled={sending || !body}>
                Share
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
