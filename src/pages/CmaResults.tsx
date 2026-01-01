import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import { apiFetch } from "../lib/api";

type CmaGetResponse = {
  status: "ok" | "error";
  request_id: string;
  item?: any;
  errors?: any[];
};

const CmaResults: React.FC = () => {
  const { requestId } = useParams();
  const [data, setData] = useState<CmaGetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const paStatus = useMemo(() => data?.item?.tools?.property_appraiser?.status, [data]);
  const mlsStatus = useMemo(() => data?.item?.tools?.mls_comps?.status, [data]);

  const isDone = paStatus === "DONE" && mlsStatus === "DONE";
  const isErrored = data?.item?.status === "ERROR" || paStatus === "ERROR" || mlsStatus === "ERROR";

  async function fetchOnce() {
    if (!requestId) return;
    const res = await apiFetch<CmaGetResponse>(`/cmas/${encodeURIComponent(requestId)}`);
    setData(res);
    return res;
  }

  useEffect(() => {
    if (!requestId) {
      setErrMsg("Missing requestId in URL.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    async function poll() {
      try {
        setErrMsg(null);
        const res = await fetchOnce();
        if (cancelled) return;

        setLoading(false);

        const pa = res?.item?.tools?.property_appraiser?.status;
        const mls = res?.item?.tools?.mls_comps?.status;

        // Poll until both tools are done (mls_comps will be PENDING for now)
        if (pa !== "DONE" || mls !== "DONE") {
          timer = window.setTimeout(poll, 2500);
        }
      } catch (e: any) {
        if (cancelled) return;
        setLoading(false);
        setErrMsg(e?.message || "Failed to load CMA");
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [requestId]);

  const paData = data?.item?.tools?.property_appraiser?.data?.data;

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />

          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "80vh" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, maxWidth: 900, width: "100%", mt: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4" fontWeight={700}>
                  CMA Results
                </Typography>

                <Button variant="outlined" onClick={() => fetchOnce()}>
                  Refresh
                </Button>
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Request ID: <b>{requestId}</b>
              </Typography>

              {loading && (
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Loading...</Typography>
                </Stack>
              )}

              {errMsg && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  {errMsg}
                </Typography>
              )}

              <Typography variant="h6" sx={{ mt: 2 }}>
                Tool Status
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Property Appraiser: <b>{paStatus || "UNKNOWN"}</b>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                MLS Comps: <b>{mlsStatus || "UNKNOWN"}</b>
              </Typography>

              {!isDone && !isErrored && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  We’ll keep checking until all tools finish…
                </Typography>
              )}

              {paStatus === "DONE" && paData && (
                <>
                  <Typography variant="h6" sx={{ mt: 4 }}>
                    Property Data (Appraiser)
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Beds/Baths: <b>{paData.beds}</b> / <b>{paData.baths}</b>
                    </Typography>
                    <Typography variant="body2">
                      Living Sqft: <b>{paData.living_sqft}</b>
                    </Typography>
                    <Typography variant="body2">
                      Year Built: <b>{paData.year_built}</b>
                    </Typography>
                    <Typography variant="body2">
                      Parcel ID: <b>{paData.parcel_id}</b>
                    </Typography>
                    <Typography variant="body2">
                      Subdivision: <b>{paData.subdivision}</b>
                    </Typography>
                    <Typography variant="body2">
                      Zoning: <b>{paData.zoning}</b>
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    (Numbers may come back as strings right now — that’s OK.)
                  </Typography>
                </>
              )}

              {/* Raw Results (JSON) removed as requested */}
            </Paper>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default CmaResults;
