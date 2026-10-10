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

// "API is waking up" notice: shown while any request runs longer than 4s
// (cold backends can take ~30s), hidden when everything settles.
const WAKE_MS = 4000;
let inflight = 0;
let wakeTimer = null;
let wakeShown = false;

function wakeOn() {
  if (wakeShown) return;
  wakeShown = true;
  window.dispatchEvent(new CustomEvent("swiftdrop:wake", { detail: { on: true } }));
}
function wakeOff() {
  if (!wakeShown) return;
  wakeShown = false;
  window.dispatchEvent(new CustomEvent("swiftdrop:wake", { detail: { on: false } }));
}
function trackStart() {
  inflight += 1;
  if (inflight === 1) wakeTimer = setTimeout(wakeOn, WAKE_MS);
}
function trackEnd() {
  inflight = Math.max(0, inflight - 1);
  if (inflight === 0) {
    clearTimeout(wakeTimer);
    wakeOff();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Thin fetch wrapper: Bearer token, JSON, Error(message).
// GET retries up to 2 times (network failure or 5xx only, never 4xx).
export async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const t = token ?? getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const attempts = method === "GET" ? 3 : 1;
  let lastErr = null;
  for (let n = 0; n < attempts; n++) {
    trackStart();
    try {
      const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Retry server errors on GET; client errors fail immediately.
        if (method === "GET" && res.status >= 500 && n < attempts - 1) {
          await sleep(500 * (n + 1));
          continue;
        }
        const msg = data?.error?.message || data?.message || `Request failed (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        err.details = data?.error?.details;
        throw err;
      }
      return data;
    } catch (e) {
      // Network failure on GET: retry; anything else (or out of tries): throw.
      const network = e instanceof TypeError;
      if (method === "GET" && network && n < attempts - 1) {
        lastErr = e;
        await sleep(500 * (n + 1));
        continue;
      }
      throw e;
    } finally {
      trackEnd();
    }
  }
  throw lastErr || new Error("Request failed");
}
