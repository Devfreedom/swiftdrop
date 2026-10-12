// Single source of truth for status names. Every filter dropdown and every
// StatusBadge in the app uses these, so the names stay identical everywhere.
export const DELIVERY_STATUSES = [
  "PENDING", "CONFIRMED", "ASSIGNED", "PICKED_UP",
  "IN_TRANSIT", "DELIVERED", "CANCELLED",
];

export const PAYMENT_STATUSES = [
  "PENDING", "SUCCESSFUL", "FAILED", "REFUNDED",
];

// Delivery pricing mirrors backend src/utils/pricing.js — the server is the
// authority (client fee is ignored); this is only for live estimates in the UI.
// Fee = BASE_FEE + PER_KG_FEE × weight, weight defaults to DEFAULT_WEIGHT_KG.
export const BASE_FEE = 1000;
export const PER_KG_FEE = 200;
export const DEFAULT_WEIGHT_KG = 1;

export function resolveWeightKg(value) {
  if (value === undefined || value === null || value === "") return DEFAULT_WEIGHT_KG;
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) return DEFAULT_WEIGHT_KG;
  return n;
}

export const estimateDeliveryFee = (weightKg) =>
  BASE_FEE + PER_KG_FEE * resolveWeightKg(weightKg);

// Friendly tracking code derived from the id (no DB change needed).
export const trackingId = (id) => `DEL-${String(id).padStart(4, "0")}`;

// Money always as ₦ with thousands separators, e.g. ₦1,500.00.
export const formatNaira = (n) =>
  "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Coordinates arrive from Postgres DECIMALs as strings (or null when unset).
// num() normalizes to a number or null; asPos() builds a {lat,lng} pin or null.
export const num = (v) => (v === null || v === undefined || v === "" ? null : Number(v));
export const asPos = (lat, lng) =>
  lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng)
    ? { lat, lng }
    : null;

// Dates like "Oct 9, 2026".
export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// Relative times like "5 mins ago".
export function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (Number.isNaN(s) || s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return formatDate(ts);
}
