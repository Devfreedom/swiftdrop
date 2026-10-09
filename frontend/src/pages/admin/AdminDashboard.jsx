// Admin dashboard: platform totals + recent deliveries.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bike, Package, Users, Wallet } from "lucide-react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import StatCard from "../../components/StatCard";
import { CenterLoad } from "../../components/Feedback";

const count = (rows, key, val) => (rows || []).find((r) => r[key] === val)?.count ?? 0;

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  const [recent, setRecent] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    Promise.all([api("/admin/stats"), api("/admin/deliveries")])
      .then(([stats, del]) => { setS(stats); setRecent(del.deliveries.slice(0, 5)); })
      .catch((e) => setErr(e.message));
  }, []);
  if (err && !s) return <p className="error">{err}</p>;
  if (!s) return <CenterLoad text="Loading dashboard…" />;
  return (
    <div>
      <h2>Admin dashboard</h2>
      {err && <p className="error">{err}</p>}
      <div className="grid3">
        <StatCard icon={Users} value={count(s.usersByRole, "role", "CUSTOMER")} label="customers" />
        <StatCard icon={Bike} value={count(s.usersByRole, "role", "RIDER")} label="riders" />
        <StatCard icon={Package} value={(s.deliveriesByStatus || []).reduce((a, r) => a + Number(r.count), 0)} label="deliveries" />
        <StatCard icon={Wallet} value={`₦${Number(s.successfulPayments?.revenue || 0).toFixed(2)}`} label="revenue" />
      </div>
      <h3>Deliveries by status</h3>
      <div className="grid3">
        {(s.deliveriesByStatus || []).map((r) => (
          <StatCard key={r.status} value={r.count} label={r.status} />
        ))}
      </div>
      <h3>Recent deliveries</h3>
      <div className="card">
        {recent.length === 0 && <p className="muted">No deliveries yet.</p>}
        {recent.map((d) => (
          <Link key={d.id} to={`/admin/deliveries/${d.id}`} className="activity" style={{ textDecoration: "none", color: "inherit" }}>
            <span className="act-ico"><Package size={17} /></span>
            <span>#{d.id} · {d.customer?.name} → {d.deliveryAddress}
              <small><StatusBadge value={d.status} /></small>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
