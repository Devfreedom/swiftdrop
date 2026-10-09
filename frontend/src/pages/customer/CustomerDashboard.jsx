// Customer dashboard: stat cards + recent activity.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, PackageCheck, Plus, Wallet } from "lucide-react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import StatCard from "../../components/StatCard";
import { CenterLoad, EmptyState } from "../../components/Feedback";

export default function CustomerDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api("/deliveries"), api("/payments")])
      .then(([d, p]) => {
        setDeliveries(d.deliveries);
        setPayments(p.payments);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const paid = payments.filter((p) => p.status === "SUCCESSFUL")
    .reduce((s, p) => s + Number(p.amount), 0);
  const active = deliveries.filter((d) => !["DELIVERED", "CANCELLED"].includes(d.status)).length;

  if (loading) return <CenterLoad text="Loading dashboard…" />;
  return (
    <div>
      <h2>Customer dashboard</h2>
      {err && <p className="error">{err}</p>}
      <div className="grid3">
        <StatCard icon={Package} value={active} label="active deliveries" />
        <StatCard icon={Wallet} value={`₦${paid.toFixed(2)}`} label="total paid" />
        <StatCard icon={PackageCheck} value={deliveries.length} label="all deliveries" />
      </div>
      <h3>Recent activity</h3>
      {deliveries.length === 0 ? (
        <EmptyState icon={Package} title="No deliveries yet"
          hint="Create your first request and track it here."
          actionTo="/customer/create" actionLabel="＋ New delivery" />
      ) : (
        <div className="card">
          {deliveries.slice(0, 5).map((d) => (
            <Link key={d.id} to={`/customer/deliveries/${d.id}`} className="activity" style={{ textDecoration: "none", color: "inherit" }}>
              <span className="act-ico"><Package size={17} /></span>
              <span>Delivery #{d.id} → {d.deliveryAddress}
                <small>₦{d.deliveryFee} · <StatusBadge value={d.status} /></small>
              </span>
            </Link>
          ))}
          <div className="inline">
            <Link to="/customer/create" className="btn primary"><Plus size={16} /> New delivery</Link>
          </div>
        </div>
      )}
    </div>
  );
}
