// src/pages/Users.tsx
console.log("ADMIN API:", import.meta.env.VITE_ADMIN_API_URL);
console.log("API:", import.meta.env.VITE_API_URL);

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
  Typography,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { fetchAuthSession } from "aws-amplify/auth";

import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";
import { adminCreateUser } from "../api/adminUsers";

// List of all US states
const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

type BusinessAddress = {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type User = {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  timezone?: string;
  brokerageName?: string;
  businessName?: string;
  businessAddress?: BusinessAddress;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  mlsUsername?: string;
  hasMlsPassword?: boolean;
};

const API_BASE = import.meta.env.VITE_API_URL as string;

async function authedFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("No idToken found (are you logged in?)");

  const headers = new Headers(init.headers || {});

  // ✅ API Gateway JWT authorizer expects Bearer <token>
  headers.set("Authorization", `Bearer ${token}`);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, { ...init, headers });
}

function emptyNewUser(): User {
  return { userId: "", email: "" };
}

export default function Users() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);

  // editable form fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [timezone, setTimezone] = useState("");
  const [brokerageName, setBrokerageName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "email", headerName: "Email", flex: 1, minWidth: 240 },
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 180,
        valueGetter: (_: any, r: User) =>
          `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim(),
      },
      { field: "brokerageName", headerName: "Brokerage", flex: 1, minWidth: 180 },
      { field: "timezone", headerName: "Timezone", flex: 1, minWidth: 160 },
      { field: "lastLoginAt", headerName: "Last Login", flex: 1, minWidth: 180 },
    ],
    []
  );

  async function loadUsers() {
    if (!API_BASE) throw new Error("Missing VITE_API_URL");
    setLoading(true);
    try {
      const res = await authedFetch(`${API_BASE}/users?limit=100`, { method: "GET" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRows((data.items || []) as User[]);
    } finally {
      setLoading(false);
    }
  }

  function openEditor(u: User) {
    setError(null);
    setSuccess(null);

    setSelected(u);

    setEmail(u.email ?? "");
    setFirstName(u.firstName ?? "");
    setLastName(u.lastName ?? "");
    setPhoneNumber(u.phoneNumber ?? "");
    setTimezone(u.timezone ?? "");
    setBrokerageName(u.brokerageName ?? "");
    setBusinessName(u.businessName ?? "");
    setCity(u.businessAddress?.city ?? "");
    setStateVal(u.businessAddress?.state ?? "");
    setZip(u.businessAddress?.zip ?? "");

    setOpen(true);
  }

  function closeEditor() {
    setOpen(false);
    setSelected(null);
    setSaving(false);
    setError(null);
  }

  const isNewInvite = !selected?.userId;

  async function save() {
    if (!selected) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // NEW USER INVITE FLOW
      if (isNewInvite) {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
          setError("Email is required to invite a user.");
          return;
        }

        const displayName = `${firstName} ${lastName}`.trim() || undefined;

        await adminCreateUser(trimmedEmail, displayName);

        closeEditor();
        await loadUsers();

        // Important: user hits Dynamo on first successful login (PostAuthentication)
        setSuccess("Invite sent! User will appear after their first successful login.");
        return;
      }

      // EXISTING USER UPDATE FLOW
      const payload: Partial<User> = {
        firstName,
        lastName,
        phoneNumber,
        timezone,
        brokerageName,
        businessName,
        businessAddress: {
          city,
          state: stateVal,
          zip,
        },
      };

      const res = await authedFetch(`${API_BASE}/users/${selected.userId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      setSuccess("User updated.");
      closeEditor();
      await loadUsers();
    } catch (e: any) {
      const msg = e?.message ?? "Save failed.";
      if (msg.includes("UsernameExistsException") || msg.includes("already exists")) {
        setError("That email already exists in Cognito. Try a different email or use Resend Invite.");
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadUsers().catch((e) => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />

          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h5" fontWeight={700}>
                Users
              </Typography>
              <Button variant="contained" onClick={() => openEditor(emptyNewUser())}>
                Create User
              </Button>
            </Stack>

            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ height: 560, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                getRowId={(r: User) => r.userId}
                onRowDoubleClick={(params: any) => openEditor(params.row as User)}
                disableRowSelectionOnClick
              />
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                Tip: double-click a row to edit.
              </Typography>
            </Box>

            <Dialog open={open} onClose={closeEditor} fullWidth maxWidth="sm">
              <DialogTitle>{isNewInvite ? "Create User (Invite)" : "Edit User"}</DialogTitle>
              <DialogContent>
                {error && <Alert severity="error">{error}</Alert>}
                <Stack spacing={2} sx={{ mt: 1 }}>
                  {isNewInvite && (
                    <TextField
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  )}

                  <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />

                  <TextField
                    label="Phone"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setPhoneNumber(val);
                    }}
                    inputProps={{ maxLength: 10, inputMode: "numeric", pattern: "[0-9]{10}" }}
                    error={phoneNumber.length > 0 && phoneNumber.length !== 10}
                    helperText={
                      phoneNumber.length > 0 && phoneNumber.length !== 10
                        ? "Enter a valid 10-digit phone number"
                        : ""
                    }
                    required
                  />

                  <TextField label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />

                  <TextField label="Brokerage name" value={brokerageName} onChange={(e) => setBrokerageName(e.target.value)} required />
                  <TextField label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />

                  <Stack direction="row" spacing={2}>
                    <TextField label="City" fullWidth value={city} onChange={(e) => setCity(e.target.value)} required />
                    <FormControl sx={{ width: 160 }} required>
                      <InputLabel id="state-select-label">State</InputLabel>
                      <Select
                        labelId="state-select-label"
                        value={stateVal}
                        label="State"
                        onChange={(e) => setStateVal(e.target.value)}
                        required
                      >
                        {US_STATES.map((s) => (
                          <MenuItem key={s.code} value={s.code}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField label="ZIP" sx={{ width: 140 }} value={zip} onChange={(e) => setZip(e.target.value)} required />
                  </Stack>

                  {isNewInvite && (
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                      This sends a Cognito invite email. The user will be written into DynamoDB after their first successful login.
                    </Typography>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeEditor} disabled={saving}>Cancel</Button>
                <Button variant="contained" onClick={save} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}