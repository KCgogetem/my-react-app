import { useEffect, useMemo, useRef, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchCmaHistory, type CmaHistoryItem } from "../api/cmaHistory";

type Row = {
  id: string;
  request_id: string;
  created_at: string;
  status?: string;
  formatted_address: string;
  county_hint?: string | null;
  state_hint?: string | null;
  property_appraiser_status?: string | null;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export default function CustomizedDataGrid() {
  const navigate = useNavigate();

  // ✅ must match your router
  const CMA_RESULTS_ROUTE_PREFIX = "/cma-results";

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // StrictMode/dev can run effects twice; this prevents duplicate state updates.
  const didLoadRef = useRef(false);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "formatted_address",
        headerName: "Address",
        minWidth: 320,
        flex: 1,
      },
      {
        field: "price",
        headerName: "Price",
        width: 120,
        valueGetter: () => "—",
      },
      {
        field: "created_at",
        headerName: "Created",
        width: 140,
        valueGetter: (_, r) => formatDate(r.created_at),
      },
      {
        field: "county_hint",
        headerName: "County",
        width: 130,
        valueGetter: (_, r) => r.county_hint ?? "—",
      },
      {
        field: "state_hint",
        headerName: "State",
        width: 90,
        valueGetter: (_, r) => r.state_hint ?? "—",
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 140,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <Button
            variant="contained"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}
            onClick={(e) => {
              e.stopPropagation();
              const requestId = params.row.request_id as string;
              navigate(`${CMA_RESULTS_ROUTE_PREFIX}/${requestId}`);
            }}
          >
            View CMA
          </Button>
        ),
      },
    ],
    [navigate, CMA_RESULTS_ROUTE_PREFIX]
  );

  useEffect(() => {
    // In dev + StrictMode, effect runs twice. We only want one “real” load.
    if (didLoadRef.current) return;
    didLoadRef.current = true;

    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const items: CmaHistoryItem[] = await fetchCmaHistory(10);

        // If your backend already returns newest first, you can skip this sort.
        const sorted = [...items].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const mapped: Row[] = sorted.slice(0, 10).map((it) => ({
          id: it.request_id,
          request_id: it.request_id,
          created_at: it.created_at,
          status: it.status ?? "",
          formatted_address: it.formatted_address,
          county_hint: it.county_hint ?? null,
          state_hint: it.state_hint ?? null,
          property_appraiser_status: it.property_appraiser_status ?? null,
        }));

        setRows(mapped);
      } catch (e: any) {
        // Ignore abort errors
        if (ac.signal.aborted) return;
        setError(e?.message ?? "Failed to load CMA history");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
        <CircularProgress size={18} />
        <Typography variant="body2">Loading CMA history…</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2" sx={{ py: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ height: 420, minWidth: 900, overflowX: "auto" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        density="compact"
        disableRowSelectionOnClick
        onRowDoubleClick={(params) => {
          const requestId = (params.row as any).request_id as string;
          navigate(`${CMA_RESULTS_ROUTE_PREFIX}/${requestId}`);
        }}
      />
    </Box>
  );
}