// src/api.ts

// HARD-CODE the working stage URL for now
export const API_BASE = "https://tgzofi4q36.execute-api.us-east-1.amazonaws.com/DEV";

export async function ping() {
  console.log("API_BASE at runtime:", API_BASE); // <-- debug log

  const res = await fetch(`${API_BASE}/ping`);
  if (!res.ok) {
    throw new Error(`Ping failed: ${res.status}`);
  }
  return res.json() as Promise<{ message: string }>;
}
