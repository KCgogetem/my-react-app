// src/components/CmaPipelineResults.tsx
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

  renderUI?: boolean;

  onRequestId?: (requestId: string) => void;
  onPropertyFacts?: (facts: any) => void;
  onItem?: (item: any) => void;
}

function safeGet(obj: any, path: string) {
  return path
    .split(".")
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function normalizePropertyAppraiserPayload(anyRecord: any) {
  if (!anyRecord) return null;

  const record = anyRecord?.item ? anyRecord.item : anyRecord;

  const fromTools =
    safeGet(record, "tools.property_appraiser.data") ??
    safeGet(record, "item.tools.property_appraiser.data") ??
    null;

  if (fromTools) {
    if (fromTools.data && fromTools.match === undefined && fromTools.source === undefined) {
      return fromTools.data;
    }
    return fromTools;
  }

  const fromTopLevel =
    safeGet(record, "property_appraiser") ??
    safeGet(record, "item.property_appraiser") ??
    null;

  if (fromTopLevel) return fromTopLevel;

  return null;
}

export default function CmaPipelineResult({
  address,
  stateHint = "FL",
  countyHint,
  renderUI = true,
  onRequestId,
  onPropertyFacts,
  onItem,
}: Props) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [item, setItem] = useState<any>(null);
  const [starting, setStarting] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ keep latest callbacks without causing effects to rerun
  const onRequestIdRef = useRef(onRequestId);
  const onPropertyFactsRef = useRef(onPropertyFacts);
  const onItemRef = useRef(onItem);

  useEffect(() => {
    onRequestIdRef.current = onRequestId;
  }, [onRequestId]);
  useEffect(() => {
    onPropertyFactsRef.current = onPropertyFacts;
  }, [onPropertyFacts]);
  useEffect(() => {
    onItemRef.current = onItem;
  }, [onItem]);

  // ✅ prevents duplicate POST /cmas (StrictMode + rerenders)
  const startedRef = useRef(false);
  const lastAddressRef = useRef<string | null>(null);

  useEffect(() => {
    if (!address) return;

    // If address changed, allow a fresh run.
    if (lastAddressRef.current !== address) {
      lastAddressRef.current = address;
      startedRef.current = false;
      setRequestId(null);
      setItem(null);
      setError(null);
    }

    (async () => {
      if (startedRef.current) return;
      startedRef.current = true;

      try {
        setStarting(true);

        const res = await startCmaPipeline({
          formattedAddress: address,
          stateHint,
          countyHint,
        });

        const rid = res?.request_id || res?.requestId;
        if (!rid) throw new Error("Pipeline started but no request_id returned.");

        setRequestId(rid);
        onRequestIdRef.current?.(rid);
      } catch (e: any) {
        setError(e?.message ?? "Failed to start CMA pipeline.");
        startedRef.current = false; // allow retry if start failed
      } finally {
        setStarting(false);
      }
    })();
    // ✅ intentionally do NOT depend on callbacks
  }, [address, stateHint, countyHint]);

  useEffect(() => {
    if (!requestId) return;

    let alive = true;

    (async () => {
      try {
        setPolling(true);

        for (let i = 0; i < 20; i++) {
          if (!alive) return;

          const res = await getCmaPipelineStatus(requestId);
          const record = res?.item ?? res;

          setItem(record);
          onItemRef.current?.(record);

          const recordUnwrapped = record?.item ? record.item : record;
          const paStatus =
            safeGet(recordUnwrapped, "tools.property_appraiser.status") ??
            safeGet(recordUnwrapped, "property_appraiser.status") ??
            null;

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

  const pa = useMemo(() => normalizePropertyAppraiserPayload(item), [item]);

  const paStatus = useMemo(() => {
    const record = item?.item ? item.item : item;
    return (
      safeGet(record, "tools.property_appraiser.status") ??
      safeGet(record, "property_appraiser.status") ??
      null
    );
  }, [item]);

  const facts = useMemo(() => {
    if (!pa) return null;
    if (pa.data && typeof pa.data === "object" && !pa.data.data) return pa.data;
    if (pa.data?.data) return pa.data.data;
    return pa;
  }, [pa]);

  useEffect(() => {
    if (facts) onPropertyFactsRef.current?.(facts);
  }, [facts]);

  if (!renderUI) return null;

  const matched = pa?.match?.matched;
  const matchConfRaw = pa?.match?.match_confidence;
  const matchConf = typeof matchConfRaw === "string" ? Number(matchConfRaw) : matchConfRaw;

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
              label={`Match confidence: ${
                typeof matchConf === "number" && !Number.isNaN(matchConf) ? matchConf.toFixed(2) : "—"
              }`}
              variant="outlined"
            />
          )}
          {requestId && <Chip size="small" label={`Request: ${requestId}`} variant="outlined" />}
        </Stack>

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
            We couldn’t retrieve county record data for this address. Try confirming the address, or try again in a
            minute.
          </Alert>
        )}

        {paStatus === "DONE" && (
          <>
            <Divider />
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