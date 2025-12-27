import React, { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { startCmaPipeline } from "../api/cmaPipeline";

interface CmaPipelineRawResultProps {
  address: string;
  stateHint?: string;
  countyHint?: string;
}

const CmaPipelineRawResult: React.FC<CmaPipelineRawResultProps> = ({ address, stateHint = "FL", countyHint }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    startCmaPipeline({ formattedAddress: address, stateHint, countyHint })
      .then(setData)
      .catch((e) => setError(e.message || "Failed to fetch CMA pipeline data"))
      .finally(() => setLoading(false));
  }, [address, stateHint, countyHint]);

  if (loading) return <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}><CircularProgress size={20} /> <span>Loading CMA pipeline data…</span></Box>;
  if (error) return <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>;
  if (!data) return null;

  // Helper to format object as plain text
  function formatPlain(obj: any, indent = 0): string {
    if (obj == null) return '';
    if (typeof obj !== 'object') return String(obj);
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '—';
      return obj.map((item, i) => `${' '.repeat(indent)}- ${formatPlain(item, indent + 2)}`).join('\n');
    }
    return Object.entries(obj)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return `${' '.repeat(indent)}${key}:\n${formatPlain(value, indent + 2)}`;
        }
        return `${' '.repeat(indent)}${key}: ${formatPlain(value)}`;
      })
      .join('\n');
  }

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>CMA Pipeline Result</Typography>
      <Box component="pre" sx={{ fontSize: 15, whiteSpace: 'pre-wrap', wordBreak: 'break-all', bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
        {formatPlain(data)}
      </Box>
    </Paper>
  );
};

export default CmaPipelineRawResult;