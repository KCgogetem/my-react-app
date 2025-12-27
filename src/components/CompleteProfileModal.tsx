// src/components/CompleteProfileModal.tsx
import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

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

type Props = {
  open: boolean;
  me: any;
  apiBase: string;
  authedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  onSaved: (updatedMe: any) => void;
};

export default function CompleteProfileModal({
  open,
  me,
  apiBase,
  authedFetch,
  onSaved,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Seed from /me (NOTE: businessAddress is a string in your DB)
  const [firstName, setFirstName] = useState(me?.firstName ?? "");
  const [lastName, setLastName] = useState(me?.lastName ?? "");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let alive = true;

    (async () => {
      // 1) Prefer API /me email if present
      const apiEmail = (me?.email ?? "").trim();
      if (apiEmail) {
        if (alive) setEmail(apiEmail);
        return;
      }

      // 2) Fallback to Cognito token email
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        if (!idToken) return;

        const payloadBase64 = idToken.split(".")[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadJson);

        const tokenEmail = (payload.email ?? "").trim();
        if (alive) setEmail(tokenEmail);
      } catch {
        // ignore
      }
    })();

    return () => {
      alive = false;
    };
  }, [me]);
  const [mlsUsername, setMlsUsername] = useState(me?.mlsUsername ?? "");
  const [mlsPassword, setMlsPassword] = useState(""); // only enter if missing
  const [brokerageName, setBrokerageName] = useState(me?.brokerageName ?? "");
  const [businessName, setBusinessName] = useState(me?.businessName ?? "");
  const [businessAddress, setBusinessAddress] = useState(me?.businessAddress ?? "");
  const [businessCity, setBusinessCity] = useState(me?.businessCity ?? "");
  const [businessState, setBusinessState] = useState(me?.businessState ?? "");
  const [businessZip, setBusinessZip] = useState(me?.businessZip ?? "");

  const hasMlsPassword = !!me?.mlsPasswordSecretId || !!me?.hasMlsPassword;

  // If /me loads after mount, re-seed
  useEffect(() => {
    setFirstName(me?.firstName ?? "");
    setLastName(me?.lastName ?? "");
    setMlsUsername(me?.mlsUsername ?? "");
    setBrokerageName(me?.brokerageName ?? "");
    setBusinessName(me?.businessName ?? "");
    setBusinessAddress(me?.businessAddress ?? "");
    setBusinessCity(me?.businessCity ?? "");
    setBusinessState(me?.businessState ?? "");
    setBusinessZip(me?.businessZip ?? "");
  }, [me]);

  const missingRequired =
    !firstName.trim() ||
    !lastName.trim() ||
    !email.trim() ||
    !mlsUsername.trim() ||
    (!hasMlsPassword && !mlsPassword.trim()) ||
    !brokerageName.trim() ||
    !businessName.trim() ||
    !businessAddress.trim() ||
    !businessCity.trim() ||
    !businessState.trim() ||
    !businessZip.trim();

  async function save() {
    setError(null);
    setSaving(true);

    try {
      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        mlsUsername: mlsUsername.trim(),
        brokerageName: brokerageName.trim(),
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim(),
        businessCity: businessCity.trim(),
        businessState: businessState,
        businessZip: businessZip.trim(),
      };

      // Only send password if it’s not already stored
      if (!hasMlsPassword) payload.mlsPassword = mlsPassword;

      const res = await authedFetch(`${apiBase}/users/me`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();

      onSaved(updated);
    } catch (e: any) {
      setError(e?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const missing = [
    !firstName.trim() && "firstName",
    !lastName.trim() && "lastName",
    !email.trim() && "email",
    !mlsUsername.trim() && "mlsUsername",
    (!hasMlsPassword && !mlsPassword.trim()) && "mlsPassword",
    !brokerageName.trim() && "brokerageName",
    !businessName.trim() && "businessName",
    !businessAddress.trim() && "businessAddress",
    !businessCity.trim() && "businessCity",
    !businessState.trim() && "businessState",
    !businessZip.trim() && "businessZip",
  ].filter(Boolean);

  console.log("CompleteProfile missing:", missing);
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      disableEscapeKeyDown
      onClose={(_, reason) => {
        if (reason === "backdropClick") return; // blocks closing
      }}
    >
      <DialogTitle>Complete your profile</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            You must complete your profile before using the app.
          </Alert>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="First"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <TextField
            label="Last"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <TextField
            label="Email"
            value={email}
            disabled
            helperText="Email comes from your login and cannot be changed here."
            required
          />

          <TextField
            label="MLS ID"
            value={mlsUsername}
            onChange={(e) => setMlsUsername(e.target.value)}
            required
          />

          {!hasMlsPassword ? (
            <TextField
              label="MLS Password"
              type="password"
              value={mlsPassword}
              onChange={(e) => setMlsPassword(e.target.value)}
              required
            />
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              MLS password is already on file.
            </Typography>
          )}

          <TextField
            label="Brokered By"
            value={brokerageName}
            onChange={(e) => setBrokerageName(e.target.value)}
            required
          />

          <TextField
            label="Business"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />

          <TextField
            label="Address"
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            required
          />

          <TextField
            label="City"
            value={businessCity}
            onChange={(e) => setBusinessCity(e.target.value)}
            required
          />

          <FormControl fullWidth required>
            <InputLabel id="state-select-label">State</InputLabel>
            <Select
              labelId="state-select-label"
              value={businessState}
              label="State"
              onChange={(e) => setBusinessState(e.target.value)}
            >
              {US_STATES.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Zip"
            value={businessZip}
            onChange={(e) => setBusinessZip(e.target.value)}
            required
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          onClick={save}
          disabled={saving || missingRequired}
        >
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}