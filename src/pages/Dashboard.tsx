// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
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
  Tooltip,
  Divider,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import NewCmaModal from "../components/NewCmaModal";
import { useNavigate } from "react-router-dom";

// ...existing code...
export default function Dashboard() {
  const [cmaModalOpen, setCmaModalOpen] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [lastStatus, setLastStatus] = useState<number | null>(null);
  const [lastBody, setLastBody] = useState<string>("");

  const API_BASE = "https://tgzofi4q36.execute-api.us-east-1.amazonaws.com/DEV";

  // Existing effect: loads email from idToken
  useEffect(() => {
    (async () => {
      try {
        const session = await fetchAuthSession();
        const claims: any = session.tokens?.idToken?.payload;
        setEmail(claims?.email ?? "");
      } catch (err) {
        console.error("Error loading session:", err);
      }
    })();
  }, []);

  // ✅ NEW: Debug groups in both tokens (Admins check)
  useEffect(() => {
    (async () => {
      try {
        const session = await fetchAuthSession();
        const idGroups = session.tokens?.idToken?.payload?.["cognito:groups"];
        const accessGroups = session.tokens?.accessToken?.payload?.["cognito:groups"];

        console.log("ID TOKEN groups:", idGroups);
        console.log("ACCESS TOKEN groups:", accessGroups);

        // Optional: show token_use to confirm which token you’re sending
        console.log("token_use (idToken):", session.tokens?.idToken?.payload?.token_use);
        console.log("token_use (accessToken):", session.tokens?.accessToken?.payload?.token_use);
      } catch (err) {
        console.error("Error reading groups from tokens:", err);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const getAccessToken = async (): Promise<string> => {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString(); // currently using idToken
    if (!token) throw new Error("No access token found. Are you logged in?");
    return token;
  };

  const callApi = async (path: string, options?: RequestInit) => {
    try {
      setLastStatus(null);
      setLastBody("");

      const token = await getAccessToken();

      const res = await fetch(`${API_BASE}${path}`, {
        ...(options ?? {}),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(options?.headers ?? {}),
        },
      });

      const text = await res.text(); // don't assume JSON
      setLastStatus(res.status);
      setLastBody(text);

      console.log(`${options?.method ?? "GET"} ${path} status:`, res.status);
      console.log(`${options?.method ?? "GET"} ${path} body:`, text);

      alert(`${options?.method ?? "GET"} ${path} → ${res.status} (see console)`);
    } catch (err: any) {
      console.error("API call failed:", err);
      setLastStatus(null);
      setLastBody(String(err?.message ?? err));
      alert(`API call failed: ${err?.message ?? err}`);
    }
  };

  const debugJwtMeta = async () => {
    const session = await fetchAuthSession();
    const p: any = session.tokens?.idToken?.payload;

    console.log("JWT META", {
      token_use: p?.token_use,
      aud: p?.aud,
      iss: p?.iss,
      exp: p?.exp,
    });
  };

  const testMeEndpoint = async () => {
    await debugJwtMeta();
    await callApi("/me", { method: "GET" });
  };

  const createTestCma = async () => {
    await callApi("/cmas", {
      method: "POST",
      body: JSON.stringify({
        status: "draft",
        subject: { address: "1821 Killarney Dr, Winter Park, FL 32789" },
        comps: [],
      }),
    });
  };

  const listCmas = async () => {
    await callApi("/cmas", { method: "GET" });
  };

  const saveTestProfile = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString(); // use idToken (your authorizer accepts it)
      if (!token) return alert("No id token found.");

      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: "Test",
          lastName: "User",
          email, // uses the email already shown in your header
          phoneNumber: "+14075551234",
          brokerageName: "Example Realty",
          brokerageId: "BRK#001",
          mlsUsername: "test.mls",
          mlsPassword: "TempMLS!12345", // ✅ will go to Secrets Manager
          businessName: "AI CMA Portal LLC",
          timezone: "America/New_York",
          businessAddress: {
            street1: "123 Main St",
            street2: "Suite 200",
            city: "Winter Park",
            state: "FL",
            zip: "32789",
          },
        }),
      });

      const text = await res.text();
      console.log("PUT /users/me status:", res.status);
      console.log("PUT /users/me body:", text);
      alert(`PUT /users/me → ${res.status} (see console)`);
    } catch (err: any) {
      console.error("PUT /users/me failed:", err);
      alert(`PUT /users/me failed: ${err?.message ?? err}`);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={1} color="inherit">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={600}>
            AI CMA Dashboard
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            {email && (
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                {email}
              </Typography>
            )}

            <Tooltip title="Test GET /me">
              <IconButton
                sx={{ bgcolor: "common.black", color: "common.white", mx: 0.5, "&:hover": { bgcolor: "grey.900" } }}
                onClick={testMeEndpoint}
                aria-label="test-me-endpoint"
              >
                <Icon>api</Icon>
              </IconButton>
            </Tooltip>

            <Tooltip title="Create test CMA (POST /cmas)">
              <IconButton
                sx={{ bgcolor: "common.black", color: "common.white", mx: 0.5, "&:hover": { bgcolor: "grey.900" } }}
                onClick={createTestCma}
                aria-label="create-test-cma"
              >
                <Icon>post_add</Icon>
              </IconButton>
            </Tooltip>

            <Tooltip title="List CMAs (GET /cmas)">
              <IconButton
                sx={{ bgcolor: "common.black", color: "common.white", mx: 0.5, "&:hover": { bgcolor: "grey.900" } }}
                onClick={listCmas}
                aria-label="list-cmas"
              >
                <Icon>list_alt</Icon>
              </IconButton>
            </Tooltip>

            <Tooltip title="Save test profile (PUT /users/me)">
              <IconButton
                sx={{ bgcolor: "common.black", color: "common.white", mx: 0.5, "&:hover": { bgcolor: "grey.900" } }}
                onClick={saveTestProfile}
                aria-label="save-test-profile"
              >
                <Icon>save</Icon>
              </IconButton>
            </Tooltip>

            <Tooltip title="Sign out">
              <IconButton
                sx={{ bgcolor: "common.black", color: "common.white", mx: 0.5, "&:hover": { bgcolor: "grey.900" } }}
                onClick={handleLogout}
                aria-label="logout"
              >
                <Icon>logout</Icon>
              </IconButton>
            </Tooltip>
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

            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Icon>home_work</Icon>}
                sx={{ textTransform: "none", fontWeight: 600 }}
                onClick={() => setCmaModalOpen(true)}
              >
                New CMA
              </Button>
              <Button
                variant="contained"
                startIcon={<Icon>group</Icon>}
                sx={{ bgcolor: "secondary.main", color: "white", fontWeight: 600, "&:hover": { bgcolor: "secondary.dark" } }}
                onClick={() => navigate("/users")}
              >
                Users
              </Button>
            </Box>
          </Paper>

          <NewCmaModal
            open={cmaModalOpen}
            onClose={() => setCmaModalOpen(false)}
            onSuccess={async (address: string) => {
              setCmaModalOpen(false);
              await callApi("/cmas", {
                method: "POST",
                body: JSON.stringify({
                  status: "draft",
                  subject: { address },
                  comps: [],
                }),
              });
            }}
          />

          <Paper elevation={1} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Backend Test Panel (DEV)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the icons in the top bar to hit <code>/me</code> and <code>/cmas</code>. Results appear below.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={700}>
              Last API Result
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {lastStatus ?? "—"}
            </Typography>

            <pre
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                background: "rgba(0,0,0,0.04)",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {lastBody || "—"}
            </pre>
          </Paper>

          <Paper elevation={1} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent CMAs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We&apos;ll replace this section with a real list once the backend routes are confirmed. For now, click the list icon (GET /cmas).
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
