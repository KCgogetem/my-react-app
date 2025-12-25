import { getToken } from "../lib/auth";

const API_BASE = "https://tgzofi4q36.execute-api.us-east-1.amazonaws.com/DEV";

export async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(
      data?.message ||
      data?.errors?.[0]?.message ||
      `HTTP ${res.status}`
    );
  }

  return data as T;
}