import React, { useState } from "react";
import { useVerifiedAddress } from "../lib/VerifiedAddressContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
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
} from "@mui/material";

// You need to set your Google Maps Geocoding API key in .env as VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

async function verifyAddress(address: string): Promise<{ formatted: string; valid: boolean; error?: string }> {
  if (!GOOGLE_API_KEY) return { formatted: address, valid: false, error: "No Google API key set." };
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "OK" && data.results.length > 0) {
    return { formatted: data.results[0].formatted_address, valid: true };
  } else {
    return { formatted: address, valid: false, error: data.error_message || "Address not found." };
  }
}

export default function NewCmaModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (address: string) => void }) {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState<string | null>(null);
  const { setVerifiedAddress } = useVerifiedAddress();

  const handleVerify = async () => {
    setError(null);
    setVerifying(true);
    setVerified(null);
    try {
      const result = await verifyAddress(address);
      if (result.valid) {
        setVerified(result.formatted);
      } else {
        setError(result.error || "Invalid address");
      }
    } catch (e: any) {
      setError(e.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = () => {
    if (verified) {
      setVerifiedAddress(verified); // Store in context
      onSuccess(verified);
      setAddress("");
      setVerified(null);
      setError(null);
      navigate("/new-cma");
    }
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
            onChange={e => setAddress(e.target.value)}
            fullWidth
            autoFocus
            disabled={verifying}
          />
          <Button onClick={handleVerify} variant="outlined" disabled={!address || verifying}>
            {verifying ? <CircularProgress size={20} /> : "Verify Address"}
          </Button>
          {verified && <Alert severity="success">Verified: {verified}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!verified}>Continue</Button>
      </DialogActions>
    </Dialog>
  );
}
