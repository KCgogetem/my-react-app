// src/components/CmaPipelineResults.tsx
import { useEffect, useMemo, useRef, useState } from "react";
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

  // ✅ geo + optional extras to persist for MLS radius work
  lat?: number;
  lng?: number;
  postalCode?: string;
  city?: string;

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

/**
 * Normalizes whatever shape comes back from:
 * - GET /cmas/{id} -> { status, request_id, item: {...ddb item...} }
 * - older shapes where property_appraiser is top-level
 * - tools.property_appraiser.data may be nested
 */
function normalizePropertyAppraiserPayload(anyRecord: any) {
  if (!anyRecord) return null;

  const record = anyRecord?.item ? anyRecord.item : anyRecord;

  // Preferred: from Dynamo "tools.property_appraiser.data"
  const fromTools =
    safeGet(record, "tools.property_appraiser.data") ??
    safeGet(record, "item.tools.property_appraiser.data") ??
    null;

  if (fromTools) {
    // Sometimes saved as { data: { ...tool2Payload } } - unwrap once
    if (fromTools.data && fromTools.match === undefined && fromTools.source === undefined) {
      return fromTools.data;
    }
    return fromTools; // tool2 payload
  }

  // Fallback: top-level property_appraiser
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
  lat,
  lng,
  postalCode,
  city,
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
  // Key "run eligibility" by address+county+state+geo to avoid spam
  const startedRef = useRef(false);
  const lastRunKeyRef = useRef<string | null>(null);

  const runKey = useMemo(() => {
    const latKey = typeof lat === "number" ? lat.toFixed(6) : "";
    const lngKey = typeof lng === "number" ? lng.toFixed(6) : "";
    const countyKey = countyHint ?? "";
    const stateKey = stateHint ?? "";
    return `${address}|${stateKey}|${countyKey}|${latKey}|${lngKey}`;
  }, [address, stateHint, countyHint, lat, lng]);

  useEffect(() => {
    if (!address) return;

    // If runKey changes, allow a fresh run
    if (lastRunKeyRef.current !== runKey) {
      lastRunKeyRef.current = runKey;
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

        // ✅ FIX: API helper expects `location: {lat,lng}` not top-level lat/lng
        const location =
          typeof lat === "number" && typeof lng === "number" ? { lat, lng } : undefined;

        const res = await startCmaPipeline({
          formattedAddress: address,
          stateHint,
          countyHint,
          location,
          postalCode,
          city,
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
    // ✅ intentionally do NOT depend on callbacks (we use refs)
  }, [runKey, address, stateHint, countyHint, lat, lng, postalCode, city]);

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

  /**
   * facts normalization rules:
   * - Tool2 response: { status, match, source, data: {...facts...} }
   * - Dynamo: tools.property_appraiser.data = tool2 payload
   * - Older/wonky: tools.property_appraiser.data.data = {...facts...}
   */
  const facts = useMemo(() => {
    if (!pa) return null;

    if (pa.data && typeof pa.data === "object") {
      if (pa.data?.data && typeof pa.data.data === "object") return pa.data.data;
      return pa.data;
    }

    return pa;
  }, [pa]);

  useEffect(() => {
    if (facts) onPropertyFactsRef.current?.(facts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                typeof matchConf === "number" && !Number.isNaN(matchConf)
                  ? matchConf.toFixed(2)
                  : "—"
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