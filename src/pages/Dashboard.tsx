// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Container,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";

export default function Dashboard() {
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    getCurrentUser().then((user: any) => {
      setEmail(user?.signInDetails?.loginId ?? "");
    });
  }, []);

  const handleLogout = () => {
    signOut();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={1} color="inherit">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={600}>
            AI CMA Dashboard
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            {email && (
              <Typography variant="body2" color="text.secondary">
                {email}
              </Typography>
            )}
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Welcome back 👋
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Start a new comparative market analysis or pick up where you left off.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddHomeWorkIcon />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              New CMA
            </Button>
          </Paper>

          <Paper elevation={1} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent CMAs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We&apos;ll list your recent CMAs here once we wire up the backend.
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}