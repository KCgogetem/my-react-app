import React, { useState } from "react";
import { useVerifiedAddress } from "../lib/VerifiedAddressContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

type VerifiedResult = {
  formatted: string;
  valid: boolean;
  error?: string;
  lat?: number;
  lng?: number;
};

async function verifyAddress(address: string): Promise<VerifiedResult> {
  if (!GOOGLE_API_KEY) return { formatted: address, valid: false, error: "No Google API key set." };
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status === "OK" && data.results.length > 0) {
    const result = data.results[0];
    const location = result.geometry?.location;
    return {
      formatted: result.formatted_address,
      valid: true,
      lat: location?.lat,
      lng: location?.lng,
    };
  }
  return { formatted: address, valid: false, error: data.error_message || "Address not found." };
}

const COUNTY_OPTIONS = ["Seminole", "Orange", "Osceola", "Lake", "Volusia", "Polk", "Brevard", "Other"];

export default function NewCmaModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (payload: { formatted_address: string; county: string; lat?: number; lng?: number }) => void;
}) {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ store the full verify response (not just the string)
  const [verified, setVerified] = useState<VerifiedResult | null>(null);

  const [county, setCounty] = useState<string>(COUNTY_OPTIONS[0]);
  const { setVerifiedAddress } = useVerifiedAddress();

  const handleVerify = async () => {
    setError(null);
    setVerifying(true);
    setVerified(null);

    try {
      const result = await verifyAddress(address);
      if (result.valid) {
        setVerified(result);
      } else {
        setError(result.error || "Invalid address");
      }
    } catch (e: any) {
      setError(e?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = () => {
    if (!verified?.valid) return;

    // ✅ store full object in context
    setVerifiedAddress({
      verifiedAddress: verified.formatted,
      county,
      lat: verified.lat,
      lng: verified.lng,
    });

    // ✅ pass full payload to parent
    onSuccess({
      formatted_address: verified.formatted,
      county,
      lat: verified.lat,
      lng: verified.lng,
    });

    // reset
    setAddress("");
    setVerified(null);
    setError(null);
    setCounty(COUNTY_OPTIONS[0]);

    navigate("/new-cma");
  };

  const handleClose = () => {
    setAddress("");
    setVerified(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>New CMA - Enter Address</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Property Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
            autoFocus
            disabled={verifying}
          />

          <FormControl fullWidth>
            <InputLabel id="county-label">County</InputLabel>
            <Select
              labelId="county-label"
              value={county}
              label="County"
              onChange={(e) => setCounty(String(e.target.value))}
              disabled={verifying}
            >
              {COUNTY_OPTIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button onClick={handleVerify} variant="outlined" disabled={!address || verifying}>
            {verifying ? <CircularProgress size={20} /> : "Verify Address"}
          </Button>

          {verified?.valid && (
            <Alert severity="success">
              <Typography variant="body2" fontWeight={700}>
                Verified:
              </Typography>
              <Typography variant="body2">{verified.formatted}</Typography>
              {(verified.lat != null && verified.lng != null) && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  lat: {verified.lat}, lng: {verified.lng}
                </Typography>
              )}
            </Alert>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!verified?.valid}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}