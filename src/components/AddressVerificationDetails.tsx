import React from "react";
import { Box, Typography, Stack, Divider } from "@mui/material";

export type AddressVerificationResult = {
  verifiedAddress?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  addressComponents?: Record<string, any>;
  [k: string]: any;
};

export default function AddressVerificationDetails({ result }: { result: AddressVerificationResult }) {
  if (!result) return null;

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Verified Address Details
      </Typography>
      <Stack spacing={0.5}>
        {result.verifiedAddress && (
          <Typography variant="body2"><b>Address:</b> {result.verifiedAddress}</Typography>
        )}
        {result.formattedAddress && result.formattedAddress !== result.verifiedAddress && (
          <Typography variant="body2"><b>Formatted:</b> {result.formattedAddress}</Typography>
        )}
        {result.placeId && (
          <Typography variant="body2"><b>Place ID:</b> {result.placeId}</Typography>
        )}
        {(result.lat !== undefined && result.lng !== undefined) && (
          <Typography variant="body2"><b>Lat/Lng:</b> {result.lat}, {result.lng}</Typography>
        )}
        {result.addressComponents && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" fontWeight={600}>Address Components:</Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              {Object.entries(result.addressComponents).map(([k, v]) => (
                <li key={k}>
                  <Typography variant="body2" component="span"><b>{k}:</b> {String(v)}</Typography>
                </li>
              ))}
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
}
