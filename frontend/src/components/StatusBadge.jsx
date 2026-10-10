// Colored pill with a small icon per status.
import { Ban, Check, CircleDollarSign, Clock, Truck, UserCheck, UserX, WifiOff } from "lucide-react";

const STYLES = {
  PENDING: ["b-amber", Clock], CONFIRMED: ["b-blue", Check],
  ASSIGNED: ["b-indigo", UserCheck], PICKED_UP: ["b-indigo", Check],
  IN_TRANSIT: ["b-cyan", Truck], DELIVERED: ["b-green", Check],
  CANCELLED: ["b-red", Ban], SUCCESSFUL: ["b-green", Check],
  FAILED: ["b-red", Ban], REFUNDED: ["b-amber", CircleDollarSign],
  AVAILABLE: ["b-green", Check], BUSY: ["b-amber", Clock],
  OFFLINE: ["b-gray", WifiOff], ACTIVE: ["b-green", Check],
  INACTIVE: ["b-gray", Clock], SUSPENDED: ["b-red", UserX],
  CASH: ["b-gray", CircleDollarSign], CARD: ["b-blue", CircleDollarSign],
  TRANSFER: ["b-purple", CircleDollarSign],
};

export default function StatusBadge({ value }) {
  const [cls, Icon] = STYLES[value] || ["b-gray", Clock];
  return (
    <span className={`badge ${cls}`}>
      {Icon && <Icon size={12} aria-hidden="true" />} {value}
    </span>
  );
}
