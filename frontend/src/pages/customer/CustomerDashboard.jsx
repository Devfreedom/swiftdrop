// Customer dashboard: recent deliveries + quick payment totals.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

export default function CustomerDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api("/deliveries"), api("/payments")])
      .then(([d, p]) => {
        setDeliveries(d.deliveries.slice(0, 5));
        setPayments(p.payments);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const paid = payments.filter((p) => p.status === "SUCCESSFUL")
    .reduce((s, p) => s + Number(p.amount), 0);

  if (loading) return <p className="muted">Loading…</p>;
  return (
    <div>
      <h2>Customer dashboard</h2>
      {err && <p className="error">{err}</p>}
      <div className="grid3">
        <div className="stat"><b>{payments.length}</b><span>payments recorded</span></div>
        <div className="stat"><b>₦{paid.toFixed(2)}</b><span>total paid</span></div>
        <Link to="/customer/create" className="stat link">＋<span>new delivery</span></Link>
      </div>
      <h3>Recent deliveries</h3>
      {deliveries.length === 0 && <p className="muted">No deliveries yet.</p>}
      {deliveries.map((d) => (
        <Link key={d.id} to={`/customer/deliveries/${d.id}`} className="row">
          <span>#{d.id} {d.deliveryAddress}</span>
          <StatusBadge value={d.status} />
        </Link>
      ))}
    </div>
  );
}
