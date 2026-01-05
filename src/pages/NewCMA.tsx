// src/pages/NewCMA.tsx
import React, { useCallback, useMemo, useState } from "react";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import DashboardLayout from "../components/DashboardLayout";

import {
  Box,
  Paper,
  Stack,
  Typography,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Select,
} from "@mui/material";

import { fetchAuthSession } from "aws-amplify/auth";
import { useVerifiedAddress } from "../lib/VerifiedAddressContext";
import CmaPipelineResult from "../components/CmaPipelineResults";

// --- formatting helpers ---
function fmtInt(n: any) {
  const v = typeof n === "string" ? Number(n) : n;
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat().format(v);
}
function fmtMoney(n: any) {
  const v = typeof n === "string" ? Number(n) : n;
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

// --- inputs model ---
type Inputs = {
  goal?: "Max Price" | "Quick Sale" | "Test Market" | "";
  hoa?: "Yes" | "No" | "";
  condition?: "Needs updates" | "Some updates" | "Renovated" | "";
  compRadiusMiles?: number;
  soldWithinDays?: number;
  notes?: string;
};

type VerifiedAddressObj = {
  verifiedAddress: string;
  county?: string;
  lat?: number;
  lng?: number;
  city?: string;
  postalCode?: string;
};

function normalizeVerifiedAddress(v: any): VerifiedAddressObj | null {
  if (!v) return null;
  if (typeof v === "string") return { verifiedAddress: v };
  if (typeof v === "object" && typeof v.verifiedAddress === "string") return v as VerifiedAddressObj;
  return null;
}

const NewCMA: React.FC = () => {
  const { verifiedAddress } = useVerifiedAddress();

  const verified = useMemo(() => normalizeVerifiedAddress(verifiedAddress), [verifiedAddress]);
  const addressString = verified?.verifiedAddress || "";
  const lat = verified?.lat;
  const lng = verified?.lng;

  const [requestId, setRequestId] = useState<string | null>(null);
  const [facts, setFacts] = useState<any>(null);

  const [inputs, setInputs] = useState<Inputs>({
    goal: "",
    hoa: "",
    condition: "",
    compRadiusMiles: 2,
    soldWithinDays: 180,
    notes: "",
  });

  // user display name from Cognito
  const [displayName, setDisplayName] = useState<string>("");

  React.useEffect(() => {
    (async () => {
      try {
        const session = await fetchAuthSession();
        const payload: any = session.tokens?.idToken?.payload || {};
        const name =
          payload?.given_name ||
          payload?.name ||
          payload?.["cognito:username"] ||
          payload?.email ||
          "";
        setDisplayName(String(name || ""));
      } catch {
        // ignore
      }
    })();
  }, []);

  // ✅ stable callbacks so pipeline doesn't restart
  const onRequestId = useCallback((rid: string) => {
    setRequestId((prev) => (prev === rid ? prev : rid));
  }, []);

  const onPropertyFacts = useCallback((f: any) => {
    setFacts((prev: any) => {
      try {
        if (JSON.stringify(prev) === JSON.stringify(f)) return prev;
      } catch {}
      return f;
    });
  }, []);

  const topHeader = useMemo(() => {
    const who = displayName ? displayName.split("@")[0] : "there";
    return `Alright, ${who} — here are the details I’ve gathered about the property you want to build a CMA around.`;
  }, [displayName]);

  if (!verified || !verified.verifiedAddress) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <DashboardLayout>
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700}>
              Please verify an address to start a new CMA.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75, mt: 1 }}>
              Use the address verification modal, then come back here.
            </Typography>
          </Box>
        </DashboardLayout>
      </AppTheme>
    );
  }

  const location =
    lat !== undefined && lng !== undefined ? { lat, lng } : undefined;

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <DashboardLayout>
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
          {/* --- Section A: Snapshot at TOP --- */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={800}>
                Property Overview
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {topHeader}
              </Typography>

              <Divider />

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {requestId && (
                  <Chip size="small" label={`Request ID: ${requestId}`} variant="outlined" />
                )}
                <Chip size="small" label="County Records" variant="outlined" />
                {verified.county ? (
                  <Chip size="small" label={`County: ${verified.county}`} variant="outlined" />
                ) : null}
              </Stack>

              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                  Snapshot
                </Typography>

                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Address:</strong> {facts?.situs_address || addressString}
                  </Typography>

                  {/* optional debug line */}
                  {location && (
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      <strong>Lat/Lng:</strong> {location.lat}, {location.lng}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(6, 1fr)" },
                      gap: 1.5,
                    }}
                  >
                    <Fact label="Beds" value={String(facts?.beds ?? "—")} />
                    <Fact label="Baths" value={String(facts?.baths ?? "—")} />
                    <Fact label="Living sqft" value={facts?.living_sqft ? fmtInt(facts.living_sqft) : "—"} />
                    <Fact label="Lot sqft" value={facts?.lot_sqft ? fmtInt(facts.lot_sqft) : "—"} />
                    <Fact label="Year built" value={String(facts?.year_built ?? "—")} />
                    <Fact label="Zoning" value={String(facts?.zoning ?? "—")} />
                  </Box>

                  <Typography variant="body2">
                    <strong>Subdivision:</strong> {facts?.subdivision || "—"}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Last sale:</strong>{" "}
                    {facts?.last_sale?.date ? String(facts.last_sale.date) : "—"}{" "}
                    {facts?.last_sale?.price != null ? <>for {fmtMoney(facts.last_sale.price)}</> : null}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Assessed:</strong>{" "}
                    {facts?.assessed?.tax_year ? `Tax year ${facts.assessed.tax_year}` : "—"}
                    {facts?.assessed?.just_value != null ? <> • Just value {fmtMoney(facts.assessed.just_value)}</> : null}
                    {facts?.assessed?.assessed_value != null ? <> • Assessed {fmtMoney(facts.assessed.assessed_value)}</> : null}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>

          {/* ✅ Data-only pipeline runner */}
          <CmaPipelineResult
            address={addressString}
            stateHint="FL"
            countyHint={verified.county}
            renderUI={false}
            onRequestId={onRequestId}
            onPropertyFacts={onPropertyFacts}
            city={verified.city}
            postalCode={verified.postalCode}
          />

          {/* --- Section B: Inputs list --- */}
          <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  CMA Inputs
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  Answer these to tailor the comps search.
                </Typography>
              </Box>

              <Divider />

              <List sx={{ p: 0 }}>
                <QASelectRow
                  label="What’s your goal for this listing?"
                  value={inputs.goal || ""}
                  onChange={(v) => setInputs((s) => ({ ...s, goal: v as Inputs["goal"] }))}
                  options={["Max Price", "Quick Sale", "Test Market"]}
                />

                <QAToggleRow
                  label="Does the subject property have an HOA?"
                  value={inputs.hoa || ""}
                  onChange={(v) => setInputs((s) => ({ ...s, hoa: v as Inputs["hoa"] }))}
                  options={["Yes", "No"]}
                />

                <QASelectRow
                  label="How would you rate the home’s condition compared to nearby homes?"
                  value={inputs.condition || ""}
                  onChange={(v) => setInputs((s) => ({ ...s, condition: v as Inputs["condition"] }))}
                  options={["Needs updates", "Some updates", "Renovated"]}
                />

                <QANumberRow
                  label="How close should sold comps be?"
                  value={inputs.compRadiusMiles ?? 2}
                  suffix="miles"
                  onChange={(v) => setInputs((s) => ({ ...s, compRadiusMiles: v }))}
                  min={0.25}
                  max={25}
                  step={0.25}
                />

                <QANumberRow
                  label="How far back should we look for sold comps?"
                  value={inputs.soldWithinDays ?? 180}
                  suffix="days"
                  onChange={(v) => setInputs((s) => ({ ...s, soldWithinDays: v }))}
                  min={30}
                  max={730}
                  step={30}
                />
              </List>
            </Stack>
          </Paper>

          {/* --- Section C: Additional info --- */}
          <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Anything else?
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  Add details like pool, upgrades, busy road, premium lot, etc.
                </Typography>
              </Box>

              <TextField
                multiline
                minRows={3}
                placeholder="Example: has pool • new roof 2022 • corner lot • needs kitchen updates"
                value={inputs.notes ?? ""}
                onChange={(e) => setInputs((s) => ({ ...s, notes: e.target.value }))}
                fullWidth
              />
            </Stack>
          </Paper>
        </Box>
      </DashboardLayout>
    </AppTheme>
  );
};

export default NewCMA;

// ------- subcomponents -------

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "background.default" }}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={800}>
        {value}
      </Typography>
    </Box>
  );
}

function QASelectRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <ListItem
      disableGutters
      sx={{
        py: 1.25,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
        gap: 2,
      }}
    >
      <ListItemText primary={<Typography fontWeight={700}>{label}</Typography>} />
      <Select size="small" value={value} displayEmpty onChange={(e) => onChange(String(e.target.value))}>
        <MenuItem value="">
          <em>Not set</em>
        </MenuItem>
        {options.map((o) => (
          <MenuItem key={o} value={o}>
            {o}
          </MenuItem>
        ))}
      </Select>
    </ListItem>
  );
}

function QAToggleRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <ListItem
      disableGutters
      sx={{
        py: 1.25,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
        gap: 2,
      }}
    >
      <ListItemText primary={<Typography fontWeight={700}>{label}</Typography>} />
      <ToggleButtonGroup exclusive size="small" value={value} onChange={(_, v) => onChange(v || "")}>
        {options.map((o) => (
          <ToggleButton key={o} value={o}>
            {o}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </ListItem>
  );
}

function QANumberRow({
  label,
  value,
  onChange,
  suffix,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <ListItem
      disableGutters
      sx={{
        py: 1.25,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
        gap: 2,
      }}
    >
      <ListItemText primary={<Typography fontWeight={700}>{label}</Typography>} />
      <TextField
        size="small"
        type="number"
        value={value}
        inputProps={{ min, max, step }}
        onChange={(e) => onChange(Number(e.target.value))}
        helperText={suffix}
      />
    </ListItem>
  );
}