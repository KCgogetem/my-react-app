// cmaPipeline API utility
// Replace property appraiser API with this file for new CMA pipeline endpoints

import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE = import.meta.env.VITE_API_URL as string;

async function authedFetch(path: string, init: RequestInit = {}) {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("No idToken found");

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

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
  requestId?: string; // optional; let lambda generate if omitted
}) {
  return authedFetch("/cmas", {
    method: "POST",
    body: JSON.stringify({
      request_id: args.requestId,
      formatted_address: args.formattedAddress,
      state_hint: args.stateHint ?? "FL",
      county_hint: args.countyHint,
    }),
  });
}

// POLL Tool 1 record (GET /cmas/{request_id})
export async function getCmaPipelineStatus(requestId: string) {
  return authedFetch(`/cmas/${encodeURIComponent(requestId)}`, {
    method: "GET",
  });
}
