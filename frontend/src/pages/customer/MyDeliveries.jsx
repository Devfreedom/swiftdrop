// My deliveries: GET /deliveries with optional status filter.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { DELIVERY_STATUSES, formatNaira, trackingId } from "../../constants";
import { EmptyState, SkeletonList } from "../../components/Feedback";

export default function MyDeliveries() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api(`/deliveries${status ? `?status=${status}` : ""}`)
      .then((d) => setItems(d.deliveries))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <h2>My deliveries</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
        {["", ...DELIVERY_STATUSES].map((f) => <option key={f} value={f}>{f || "All statuses"}</option>)}
      </select>
      {err && <p className="error">{err}</p>}
      {loading ? <SkeletonList /> : items.length === 0 ? (
        <EmptyState icon={Package} title={status ? `No ${status} deliveries` : "No deliveries yet"}
          hint="Create a request and it will show up here."
          actionTo="/customer/create" actionLabel="＋ New delivery" />
      ) : items.map((d) => (
        <Link key={d.id} to={`/customer/deliveries/${d.id}`} className="row">
          <span>#{d.id} → {d.deliveryAddress} (₦{d.deliveryFee})</span>
          <StatusBadge value={d.status} />
        </Link>
      ))}
    </div>
  );
}
