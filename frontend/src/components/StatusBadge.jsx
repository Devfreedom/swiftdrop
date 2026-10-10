// Colored status pill with a small icon per status (built on kit Badge).
import { Ban, Check, CircleDollarSign, Clock, Truck, UserCheck, UserX, WifiOff } from "lucide-react";
import Badge from "../ui/Badge";

const STYLES = {
  PENDING: ["amber", Clock], CONFIRMED: ["blue", Check],
  ASSIGNED: ["indigo", UserCheck], PICKED_UP: ["indigo", Check],
  IN_TRANSIT: ["cyan", Truck], DELIVERED: ["green", Check],
  CANCELLED: ["red", Ban], SUCCESSFUL: ["green", Check],
  FAILED: ["red", Ban], REFUNDED: ["amber", CircleDollarSign],
  AVAILABLE: ["green", Check], BUSY: ["amber", Clock],
  OFFLINE: ["gray", WifiOff], ACTIVE: ["green", Check],
  INACTIVE: ["gray", Clock], SUSPENDED: ["red", UserX],
  CASH: ["gray", CircleDollarSign], CARD: ["blue", CircleDollarSign],
  TRANSFER: ["purple", CircleDollarSign],
};

export default function StatusBadge({ value }) {
  const [tone, Icon] = STYLES[value] || ["gray", Clock];
  return (
    <Badge tone={tone} icon={Icon}>{value}</Badge>
  );
}
