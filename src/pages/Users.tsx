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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { fetchAuthSession } from "aws-amplify/auth";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";

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

async function authedFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString(); // if your authorizer expects accessToken, switch here
  if (!token) throw new Error("No idToken found (are you logged in?)");

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  return fetch(input, { ...init, headers });
}

export default function Users() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  // editable form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [timezone, setTimezone] = useState("");
  const [brokerageName, setBrokerageName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 180,
        valueGetter: (_: any, r: User) => `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim(),
      },
      { field: "brokerageName", headerName: "Brokerage", flex: 1, minWidth: 180 },
      { field: "timezone", headerName: "Timezone", flex: 1, minWidth: 180 },
      { field: "lastLoginAt", headerName: "Last Login", flex: 1, minWidth: 180 },
    ],
    []
  );

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await authedFetch(`${API_BASE}/users?limit=100`, { method: "GET" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRows((data.items || []).map((u: User) => ({ ...u, id: u.userId })));
    } finally {
      setLoading(false);
    }
  }

  function openEditor(u: User) {
    setSelected(u);
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

  async function save() {
    if (!selected) return;

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

    setOpen(false);
    await loadUsers();
  }

  useEffect(() => {
    loadUsers().catch((e) => console.error(e));
  }, []);

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h5" fontWeight={700}>
                Users
              </Typography>
              <Button variant="outlined" onClick={() => loadUsers()}>
                Refresh
              </Button>
            </Stack>

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

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
              <DialogTitle>Edit User</DialogTitle>
              <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  <TextField label="Phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  <TextField label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                  <TextField label="Brokerage name" value={brokerageName} onChange={(e) => setBrokerageName(e.target.value)} />
                  <TextField label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                  <Stack direction="row" spacing={2}>
                    <TextField label="City" fullWidth value={city} onChange={(e) => setCity(e.target.value)} />
                    <TextField label="State" sx={{ width: 120 }} value={stateVal} onChange={(e) => setStateVal(e.target.value)} />
                    <TextField label="ZIP" sx={{ width: 140 }} value={zip} onChange={(e) => setZip(e.target.value)} />
                  </Stack>
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={() => save()}>
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </Box>

    </AppTheme>
  );
}
