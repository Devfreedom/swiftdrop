// Single source of truth for status names. Every filter dropdown and every
// StatusBadge in the app uses these, so the names stay identical everywhere.
export const DELIVERY_STATUSES = [
  "PENDING", "CONFIRMED", "ASSIGNED", "PICKED_UP",
  "IN_TRANSIT", "DELIVERED", "CANCELLED",
];

export const PAYMENT_STATUSES = [
  "PENDING", "SUCCESSFUL", "FAILED", "REFUNDED",
];
