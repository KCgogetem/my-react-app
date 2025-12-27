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
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchPropertyAppraiserData(args: {
  formattedAddress: string;
  county?: string; // default Seminole
  state?: string;  // default FL
  requestId?: string;
}) {
  return authedFetch("/property-appraiser", {
    method: "POST",
    body: JSON.stringify({
      request_id: args.requestId,
      subject: {
        formatted_address: args.formattedAddress,
        county: args.county ?? "Seminole",
        state: args.state ?? "FL",
      },
    }),
  });
}
