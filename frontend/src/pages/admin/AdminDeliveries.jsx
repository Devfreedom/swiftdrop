// All deliveries with status filter. Links to manage page for confirm/assign/cancel.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { DELIVERY_STATUSES } from "../../constants";

export default function AdminDeliveries() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    api(`/admin/deliveries${status ? `?status=${status}` : ""}`)
      .then((d) => setItems(d.deliveries)).catch((e) => setErr(e.message));
  }, [status]);
  return (
    <div>
      <h2>Deliveries</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {["", ...DELIVERY_STATUSES].map((f) => <option key={f} value={f}>{f || "All statuses"}</option>)}
      </select>
      {err && <p className="error">{err}</p>}
      {items.map((d) => (
        <Link key={d.id} to={`/admin/deliveries/${d.id}`} className="row">
          <span>#{d.id} {d.customer?.name} → {d.deliveryAddress}</span>
          <StatusBadge value={d.status} />
        </Link>
      ))}
      {items.length === 0 && <p className="muted">No deliveries.</p>}
    </div>
  );
}
