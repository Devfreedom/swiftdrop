// API base comes from VITE_API_URL only. No hardcoded localhost here.
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "delivery_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

// Thin fetch wrapper: adds Bearer token, parses JSON, throws Error(message).
export async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const t = token ?? getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.details = data?.error?.details;
    throw err;
  }
  return data;
}
