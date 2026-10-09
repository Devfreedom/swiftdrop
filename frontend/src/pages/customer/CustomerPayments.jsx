// Payment history for my deliveries: GET /payments.
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

export default function CustomerPayments() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/payments").then((d) => setItems(d.payments))
      .catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, []);
  if (loading) return <p className="muted">Loading…</p>;
  return (
    <div>
      <h2>Payments</h2>
      {err && <p className="error">{err}</p>}
      {items.map((p) => (
        <div key={p.id} className="row">
          <span>#{p.id} delivery #{p.deliveryId} · ₦{p.amount}</span>
          <span><StatusBadge value={p.method} /> <StatusBadge value={p.status} /></span>
        </div>
      ))}
      {items.length === 0 && <p className="muted">No payments yet.</p>}
    </div>
  );
}
