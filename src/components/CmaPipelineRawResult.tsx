import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { startCmaPipeline, getCmaPipelineStatus } from "../api/cmaPipeline";

interface Props {
  address: string;
  stateHint?: string;
  countyHint?: string;
}

function fmtInt(n: any) {
  const v = typeof n === "string" ? Number(n) : n;
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat().format(v);
}

function fmtMoney(n: any) {
  const v = typeof n === "string" ? Number(n) : n;
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

function safeGet(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export default function CmaPipelineResult({ address, stateHint = "FL", countyHint }: Props) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [item, setItem] = useState<any>(null);
  const [starting, setStarting] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // prevents duplicate POST /cmas on re-render
  const startedRef = useRef(false);

  useEffect(() => {
    if (!address) return;

    // reset when address changes
    setRequestId(null);
    setItem(null);
    setError(null);
    startedRef.current = false;

    (async () => {
      try {
        setStarting(true);
        const res = await startCmaPipeline({
          formattedAddress: address,
          stateHint,
          countyHint,
        });

        // Tool 1 returns request_id
        const rid = res?.request_id || res?.requestId;
        if (!rid) throw new Error("Pipeline started but no request_id returned.");
        setRequestId(rid);
      } catch (e: any) {
        setError(e?.message ?? "Failed to start CMA pipeline.");
      } finally {
        setStarting(false);
      }
    })();
  }, [address, stateHint, countyHint]);

  useEffect(() => {
    if (!requestId) return;

    let alive = true;

    (async () => {
      try {
        setPolling(true);

        // poll up to ~30s
        for (let i = 0; i < 20; i++) {
          if (!alive) return;

          const res = await getCmaPipelineStatus(requestId);
          const record = res?.item ?? res; // depending on your API response shape
          setItem(record);

          const paStatus =
            safeGet(record, "tools.property_appraiser.status") ||
            safeGet(record, "item.tools.property_appraiser.status");

          if (paStatus === "DONE" || paStatus === "ERROR") break;

          await new Promise((r) => setTimeout(r, 1500));
        }
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Failed polling CMA status.");
      } finally {
        if (alive) setPolling(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [requestId]);

  const pa = useMemo(() => {
    // Your Tool 1 stores tool2 response at tools.property_appraiser.data
    return safeGet(item, "tools.property_appraiser.data") ?? null;
  }, [item]);

  const paStatus = useMemo(() => {
    return safeGet(item, "tools.property_appraiser.status") ?? null;
  }, [item]);

  const matched = pa?.match?.matched;
  const matchConf = pa?.match?.match_confidence;

  const facts = pa?.data || {};

  const headerChips = (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {paStatus && (
        <Chip
          size="small"
          label={`Property Appraiser: ${paStatus}`}
          color={paStatus === "DONE" ? "success" : paStatus === "ERROR" ? "error" : "default"}
          variant="outlined"
        />
      )}
      {matched === true && (
        <Chip
          size="small"
          label={`Match confidence: ${typeof matchConf === "number" ? matchConf.toFixed(2) : "—"}`}
          variant="outlined"
        />
      )}
      {requestId && <Chip size="small" label={`Request: ${requestId}`} variant="outlined" />}
    </Stack>
  );

  if (!address) return null;

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            CMA Property Summary
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            We’re pulling county record data and preparing your CMA.
          </Typography>
        </Box>

        {headerChips}

        {(starting || polling) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2">
              {starting ? "Starting CMA pipeline…" : "Fetching latest results…"}
            </Typography>
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {paStatus === "ERROR" && (
          <Alert severity="warning">
            We couldn’t retrieve county record data for this address. Try confirming the address, or try again in a minute.
          </Alert>
        )}

        {paStatus === "DONE" && (
          <>
            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                Property snapshot
              </Typography>

              <Typography variant="body2">
                <strong>Address:</strong> {facts.situs_address || pa?.match?.matched_address || address}
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Typography variant="body2">
                  <strong>Beds:</strong> {facts.beds ?? "—"}
                </Typography>
                <Typography variant="body2">
                  <strong>Baths:</strong> {facts.baths ?? "—"}
                </Typography>
                <Typography variant="body2">
                  <strong>Living:</strong> {fmtInt(facts.living_sqft)} sqft
                </Typography>
                <Typography variant="body2">
                  <strong>Lot:</strong> {fmtInt(facts.lot_sqft)} sqft
                </Typography>
                <Typography variant="body2">
                  <strong>Year built:</strong> {facts.year_built ?? "—"}
                </Typography>
              </Stack>

              <Typography variant="body2">
                <strong>Subdivision:</strong> {facts.subdivision || "—"}{" "}
                {facts.zoning ? <> • <strong>Zoning:</strong> {facts.zoning}</> : null}
              </Typography>

              <Typography variant="body2">
                <strong>Last sale:</strong>{" "}
                {facts.last_sale?.date ? String(facts.last_sale.date) : "—"}{" "}
                {facts.last_sale?.price != null ? <>for {fmtMoney(facts.last_sale.price)}</> : null}
              </Typography>

              <Typography variant="body2">
                <strong>Assessed:</strong>{" "}
                {facts.assessed?.tax_year ? `Tax year ${facts.assessed.tax_year}` : "—"}
                {facts.assessed?.just_value != null ? <> • Just value {fmtMoney(facts.assessed.just_value)}</> : null}
                {facts.assessed?.assessed_value != null ? <> • Assessed {fmtMoney(facts.assessed.assessed_value)}</> : null}
              </Typography>
            </Stack>

            <Accordion sx={{ mt: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Advanced details (for debugging)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  component="pre"
                  sx={{
                    fontSize: 13,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    bgcolor: "background.default",
                    p: 2,
                    borderRadius: 2,
                    m: 0,
                  }}
                >
                  {JSON.stringify(pa, null, 2)}
                </Box>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Stack>
    </Paper>
  );
}