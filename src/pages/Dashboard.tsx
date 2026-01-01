// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { fetchAuthSession } from "aws-amplify/auth";

// DebugIdToken component for logging the ID token
function DebugIdToken() {
  useEffect(() => {
    (async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        console.log("🔥 ID TOKEN 🔥");
        console.log(idToken);

        if (!idToken) {
          console.error("No ID token found");
        }
      } catch (err) {
        console.error("Failed to fetch auth session:", err);
      }
    })();
  }, []);
  return null;
}


import DashboardLayout from "../components/DashboardLayout";
import MainGrid from "../components/MainGrid";
import CompleteProfileModal from "../components/CompleteProfileModal";
import ChartCmaByCounty from "../components/ChartCmaByCounty";
import CustomizedDataGrid from "../components/CustomizedDataGrid";

const API_BASE = import.meta.env.VITE_API_URL as string;

async function authedFetch(input: RequestInfo, init: RequestInit = {}) {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("No idToken found (are you logged in?)");

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, { ...init, headers });
}

// Compute completion client-side as a fallback when the backend /me
// does not return profileComplete yet.
function computeProfileComplete(user: any): boolean {
  const has = (v: any) => typeof v === "string" ? v.trim().length > 0 : !!v;

  return (
    has(user?.firstName) &&
    has(user?.lastName) &&
    has(user?.email) &&
    has(user?.mlsUsername) &&
    (has(user?.mlsPasswordSecretId) || has(user?.hasMlsPassword)) &&
    has(user?.brokerageName) &&
    has(user?.businessName) &&
    has(user?.businessAddress) &&
    has(user?.businessCity) &&
    has(user?.businessState) &&
    has(user?.businessZip)
  );
}

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [forceProfile, setForceProfile] = useState(false);
  const [loadingMe, setLoadingMe] = useState(true);

  async function loadMe() {
    if (!API_BASE) throw new Error("Missing VITE_API_URL");

    setLoadingMe(true);

    const res = await authedFetch(`${API_BASE}/me`, { method: "GET" });
    if (!res.ok) throw new Error(await res.text());

    // Your /me currently returns: { ok: true, user: {...} }
    const data = await res.json();
    const user = data?.user ?? data;

    setMe(user);

    // Prefer server value if it exists; otherwise compute locally
    const complete =
      typeof user?.profileComplete === "boolean"
        ? user.profileComplete
        : computeProfileComplete(user);

    setForceProfile(complete === false);
    setLoadingMe(false);
  }

  useEffect(() => {
    loadMe().catch((e) => {
      console.error(e);
      setLoadingMe(false);
    });
  }, []);

  // Same logic used for rendering
  const profileComplete =
    typeof me?.profileComplete === "boolean"
      ? me.profileComplete === true
      : computeProfileComplete(me);

  return (
    <DashboardLayout>
      <DebugIdToken />
      <Box>
        {/* Loading state so we don't flash dashboard content */}
        {loadingMe && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Forced modal */}
        {me && forceProfile && (
          <CompleteProfileModal
            open={true}
            me={me}
            apiBase={API_BASE}
            authedFetch={authedFetch}
            onSaved={async () => {
              // close immediately to avoid any "empty modal" flash
              setForceProfile(false);
              await loadMe();
            }}
          />
        )}

        {/* Only show dashboard content after profile is complete */}
        {!loadingMe && profileComplete && (
          <>
            <MainGrid userName={me?.firstName || me?.name || "User"} />
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mb: 3 }}>
              <ChartCmaByCounty />
              <CustomizedDataGrid />
            </Box>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}