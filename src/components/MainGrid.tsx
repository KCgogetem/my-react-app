import { useEffect, useState } from "react";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import {
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

export default function MainGrid() {
  const [cmaModalOpen, setCmaModalOpen] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [lastStatus, setLastStatus] = useState<number | null>(null);
  const [lastBody, setLastBody] = useState<string>("");

  const API_BASE = import.meta.env.VITE_API_URL as string;

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

  useEffect(() => {
    (async () => {
      try {
        const session = await fetchAuthSession();
        const idGroups = session.tokens?.idToken?.payload?.["cognito:groups"];
        const accessGroups = session.tokens?.accessToken?.payload?.["cognito:groups"];

        console.log("ID TOKEN groups:", idGroups);
        console.log("ACCESS TOKEN groups:", accessGroups);

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
    const token = session.tokens?.idToken?.toString();
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

      const text = await res.text();
      setLastStatus(res.status);
      setLastBody(text);

      console.log(`${options?.method ?? "GET"} ${path} status:`, res.status);
      console.log(`${options?.method ?? "GET"} ${path} body:`, text);
      // Removed alert popup for dev tools
    } catch (err: any) {
      console.error("API call failed:", err);
      setLastStatus(null);
      setLastBody(String(err?.message ?? err));
      // Removed alert popup for dev tools
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
      const token = session.tokens?.idToken?.toString();
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
          email,
          phoneNumber: "+14075551234",
          brokerageName: "Example Realty",
          brokerageId: "BRK#001",
          mlsUsername: "test.mls",
          mlsPassword: "TempMLS!12345",
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
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Email and quick actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {/* Removed email from header */}
        {/* Removed Test / get me button */}
        {/* Removed 'Create test CMA' button */}
        <Tooltip title="List CMAs (GET /cmas)">
          <IconButton
            sx={{ bgcolor: "common.black", color: "common.white", mx: 0.5, "&:hover": { bgcolor: "grey.900" } }}
            onClick={listCmas}
            aria-label="list-cmas"
          >
            <Icon>list_alt</Icon>
          </IconButton>
        </Tooltip>
        {/* Removed 'Save test profile' button */}
        <Tooltip title="Sign out">
          <IconButton
            sx={{ bgcolor: "common.black", color: "common.white", mx: 0.5, "&:hover": { bgcolor: "grey.900" } }}
            onClick={handleLogout}
            aria-label="logout"
          >
            <Icon>logout</Icon>
          </IconButton>
        </Tooltip>
      </Box>

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
                variant="outlined"
                startIcon={<Icon>add_circle_outline</Icon>}
                sx={{ fontWeight: 600 }}
                onClick={() => navigate("/new-cma")}
              >
                Go to New CMA Page
              </Button>
                {/* Users button removed, now in sidebar */}
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

          // ...existing code...

          // ...existing code...
        </Stack>
      </Container>
    </Box>
  );
}
