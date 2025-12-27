import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL as string;

export async function adminCreateUser(email: string, name?: string) {
  console.log("ADMIN CREATE USER API_BASE =", API_BASE);
  if (!API_BASE) throw new Error("Missing VITE_ADMIN_API_URL");

  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("Not authenticated");

  console.log("POSTING TO =", `${API_BASE}/admin/users`);
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, name }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed: ${res.status}`);
  return text ? JSON.parse(text) : { ok: true };
}