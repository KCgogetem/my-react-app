import React, { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { apiFetch } from "../lib/api";

interface PropertyAppraiserDataProps {
  address: string;
}

const PropertyAppraiserData: React.FC<PropertyAppraiserDataProps> = ({ address }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    apiFetch(`/property-appraiser?address=${encodeURIComponent(address)}`)
      .then(setData)
      .catch((e) => setError(e.message || "Failed to fetch property appraiser data"))
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) return <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}><CircularProgress size={20} /> <span>Loading property appraiser data…</span></Box>;
  if (error) return <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>;
  if (!data) return null;

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>Property Appraiser Results</Typography>
      <Box component="pre" sx={{ fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-all', bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
        {JSON.stringify(data, null, 2)}
      </Box>
    </Paper>
  );
};

export default PropertyAppraiserData;
