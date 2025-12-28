import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE = import.meta.env.VITE_API_URL as string;

async function authedFetch(input: RequestInfo, init: RequestInit = {}) {
  const session = await fetchAuthSession({ forceRefresh: true });
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("No idToken found (are you logged in?)");

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, { ...init, headers });
}

export type CmaHistoryItem = {
  request_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  formatted_address: string;
  county_hint?: string | null;
  state_hint?: string | null;
  property_appraiser_status?: string | null;
};

export async function fetchCmaHistory(limit = 10): Promise<CmaHistoryItem[]> {
  if (!API_BASE) throw new Error("Missing VITE_API_URL");

  const res = await authedFetch(`${API_BASE}/cmas/history?limit=${limit}`, {
    method: "GET",
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return (data.items || []) as CmaHistoryItem[];
}
