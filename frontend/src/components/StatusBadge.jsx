// Colored status pill with a small icon per status (built on kit Badge).
import { Ban, Check, CircleDollarSign, Clock, Truck, UserCheck, UserX, WifiOff } from "lucide-react";
import Badge from "../ui/Badge";

const STYLES = {
  PENDING: ["amber", Clock], CONFIRMED: ["blue", Check],
  ASSIGNED: ["brand", UserCheck], PICKED_UP: ["brand", Check],
  IN_TRANSIT: ["cyan", Truck], DELIVERED: ["green", Check],
  CANCELLED: ["red", Ban], SUCCESSFUL: ["green", Check],
  FAILED: ["red", Ban], REFUNDED: ["amber", CircleDollarSign],
  AVAILABLE: ["green", Check], BUSY: ["amber", Clock],
  OFFLINE: ["gray", WifiOff], ACTIVE: ["green", Check],
  INACTIVE: ["gray", Clock], SUSPENDED: ["red", UserX],
  CASH: ["gray", CircleDollarSign], CARD: ["blue", CircleDollarSign],
  TRANSFER: ["brand", CircleDollarSign],
};

/* Human display labels: backend stores SCREAMING_SNAKE statuses, but the
   pill must never show raw underscores (e.g. "PICKED_UP"). Values are
   untouched — this is display only. Unknown values are prettified. */
const LABELS = {
  PENDING: "Pending", CONFIRMED: "Confirmed", ASSIGNED: "Assigned",
  PICKED_UP: "Picked up", IN_TRANSIT: "In transit", DELIVERED: "Delivered",
  CANCELLED: "Cancelled", SUCCESSFUL: "Successful", FAILED: "Failed",
  REFUNDED: "Refunded", AVAILABLE: "Available", BUSY: "Busy",
  OFFLINE: "Offline", ACTIVE: "Active", INACTIVE: "Inactive",
  SUSPENDED: "Suspended", CASH: "Cash", CARD: "Card", TRANSFER: "Transfer",
};

function prettify(value) {
  const s = String(value ?? "").replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function StatusBadge({ value }) {
  const [tone, Icon] = STYLES[value] || ["gray", Clock];
  return (
    <Badge tone={tone} icon={Icon}>{LABELS[value] || prettify(value)}</Badge>
  );
}
