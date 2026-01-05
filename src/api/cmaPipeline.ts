// src/api/cmaPipeline.ts
// CMA Pipeline API utility (Tool 1: create + poll)
// Adds lat/lng support (store on subject) + keeps backwards compatibility.

import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE = import.meta.env.VITE_API_URL as string;

type GeoPoint = { lat: number; lng: number };

function pickLatLng(location?: GeoPoint | null) {
  if (!location) return { lat: undefined as number | undefined, lng: undefined as number | undefined };
  const lat = typeof location.lat === "number" ? location.lat : undefined;
  const lng = typeof location.lng === "number" ? location.lng : undefined;
  return { lat, lng };
}

async function authedFetch(path: string, init: RequestInit = {}) {
  if (!API_BASE) throw new Error("Missing VITE_API_URL");

  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("No idToken found");

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  // only set JSON header if caller isn't uploading FormData/etc
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const text = await res.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  }

  return data;
}

// START Tool 1 pipeline (POST /cmas)
export async function startCmaPipeline(args: {
  formattedAddress: string;
  stateHint?: string;
  countyHint?: string;
  requestId?: string;

  // ✅ preferred: lat/lng at top level
  lat?: number;
  lng?: number;

  // ✅ backward-compatible: allow location:{lat,lng}
  location?: GeoPoint;

  // optional extras if you want them in DB later
  postalCode?: string;
  city?: string;
}) {
  const loc = pickLatLng(args.location);

  const lat = typeof args.lat === "number" ? args.lat : loc.lat;
  const lng = typeof args.lng === "number" ? args.lng : loc.lng;

  // ✅ IMPORTANT: send lat/lng as top-level fields so Lambda can store subject.lat/subject.lng
  // Keep location too if you want for debugging/back-compat, but Tool 1 should rely on lat/lng.
  const body: any = {
    request_id: args.requestId,
    formatted_address: args.formattedAddress,
    state_hint: args.stateHint ?? "FL",
    county_hint: args.countyHint,
    postal_code: args.postalCode,
    city: args.city,
  };

  if (typeof lat === "number") body.lat = lat;
  if (typeof lng === "number") body.lng = lng;

  // optional: include original location object for debugging (won't break anything)
  if (args.location && typeof args.location.lat === "number" && typeof args.location.lng === "number") {
    body.location = args.location;
  }

  return authedFetch("/cmas", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// POLL Tool 1 record (GET /cmas/{request_id})
export async function getCmaPipelineStatus(requestId: string) {
  return authedFetch(`/cmas/${encodeURIComponent(requestId)}`, {
    method: "GET",
  });
}