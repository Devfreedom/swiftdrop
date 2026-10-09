// My deliveries: GET /deliveries with optional status filter.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

const FILTERS = ["", "PENDING", "CONFIRMED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"];

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
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {FILTERS.map((f) => <option key={f} value={f}>{f || "All statuses"}</option>)}
      </select>
      {err && <p className="error">{err}</p>}
      {loading ? <p className="muted">Loading…</p> : items.map((d) => (
        <Link key={d.id} to={`/customer/deliveries/${d.id}`} className="row">
          <span>#{d.id} → {d.deliveryAddress} (₦{d.deliveryFee})</span>
          <StatusBadge value={d.status} />
        </Link>
      ))}
      {!loading && items.length === 0 && <p className="muted">Nothing here.</p>}
    </div>
  );
}
