// Colored pill for delivery / payment / availability / account states.
const COLORS = {
  PENDING: "b-amber", CONFIRMED: "b-blue", ASSIGNED: "b-purple",
  PICKED_UP: "b-indigo", IN_TRANSIT: "b-cyan", DELIVERED: "b-green",
  CANCELLED: "b-red", SUCCESSFUL: "b-green", FAILED: "b-red",
  REFUNDED: "b-amber", AVAILABLE: "b-green", BUSY: "b-amber",
  OFFLINE: "b-gray", ACTIVE: "b-green", INACTIVE: "b-gray",
  SUSPENDED: "b-red", CASH: "b-gray", CARD: "b-blue", TRANSFER: "b-purple",
};
export default function StatusBadge({ value }) {
  return <span className={`badge ${COLORS[value] || "b-gray"}`}>{value}</span>;
}
