// Customer dashboard: greeting, stats, active-delivery card, recent table.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Package, PackageCheck, Plus, Wallet } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import StatCard from "../../components/StatCard";
import Stepper from "../../components/Stepper";
import DataTable from "../../components/DataTable";
import { CenterLoad, EmptyState } from "../../components/Feedback";
import { formatDate, formatNaira, timeAgo, trackingId } from "../../constants";

const FINAL = ["DELIVERED", "CANCELLED"];

export default function CustomerDashboard() {
  const { user } = useAuth();
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

  const paid = payments
    .filter((p) => p.status === "SUCCESSFUL")
    .reduce((s, p) => s + Number(p.amount), 0);
  const activeList = deliveries.filter((d) => !FINAL.includes(d.status));
  const active = activeList[0] || null; // most recent non-final delivery
  const latest = deliveries[0] || null;

  if (loading) return <CenterLoad text="Loading dashboard…" />;
  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Welcome back, {user.name.split(" ")[0]}! 👋</h2>
          <p className="muted">Here is what&apos;s happening with your deliveries today.</p>
        </div>
        <Link to="/customer/create" className="btn primary"><Plus size={16} aria-hidden="true" /> Create New Delivery</Link>
      </div>
      {err && <p className="error">{err}</p>}
      <div className="grid3">
        <StatCard icon={Package} value={deliveries.length} label="Total deliveries" />
        <StatCard icon={Wallet} value={formatNaira(paid)} label="Total paid" />
        <StatCard icon={PackageCheck} value={activeList.length} label="Active deliveries" />
      </div>

      <h3>Active Delivery</h3>
      {!active && (!latest || latest.status !== "CANCELLED") ? (
        <EmptyState icon={Package} title="No active delivery"
          hint="Create a request and track it here."
          actionTo="/customer/create" actionLabel="Create New Delivery" />
      ) : (
        <ActiveCard delivery={active || latest} />
      )}

      <div className="table-head">
        <h3>Recent Deliveries</h3>
        <Link to="/customer/deliveries" className="view-link">View all <ChevronRight size={14} aria-hidden="true" /></Link>
      </div>
      <DataTable
        columns={[
          { key: "id", label: "Tracking ID" }, { key: "dest", label: "Destination" },
          { key: "date", label: "Date" }, { key: "status", label: "Status" },
        ]}
        rows={deliveries.slice(0, 5).map((d) => ({ ...d, to: `/customer/deliveries/${d.id}` }))}
        render={(key, d) => {
          if (key === "id") return <strong>{trackingId(d.id)}</strong>;
          if (key === "dest") return <span className="dest-cell"><MapPin size={14} aria-hidden="true" /> <span className="trunc">{d.deliveryAddress}</span></span>;
          if (key === "date") return <span className="muted">{formatDate(d.createdAt)}</span>;
          return <StatusBadge value={d.status} />;
        }}
        empty={<EmptyState icon={Package} title="No deliveries yet"
          hint="Your recent deliveries will appear here."
          actionTo="/customer/create" actionLabel="Create New Delivery" />}
      />
    </div>
  );
}

// Most recent non-final delivery; falls back to a cancelled one (red banner).
function ActiveCard({ delivery: d }) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.deliveryAddress)}`;
  return (
    <div className="card active-card">
      <div className="active-top">
        <div>
          <p className="active-title"><span className="live-dot" aria-hidden="true" /> Active Delivery</p>
          <p className="tracking-code">Order {trackingId(d.id)}</p>
        </div>
        <div className="updated-box">
          <div><span>Updated</span><strong>{timeAgo(d.updatedAt)}</strong></div>
          <div><span>Driver</span><strong>{d.rider ? d.rider.name : "Not assigned yet"}</strong></div>
        </div>
      </div>
      <div className="dest-block">
        <MapPin size={18} aria-hidden="true" />
        <div>
          <span>Destination</span>
          <strong>{d.deliveryAddress}</strong>
          {d.deliveryLandmark && <small>{d.deliveryLandmark}</small>}
        </div>
      </div>
      <Stepper status={d.status} />
      <div className="active-links">
        <a className="view-link" href={mapUrl} target="_blank" rel="noreferrer">
          View on Map <ChevronRight size={14} aria-hidden="true" />
        </a>
        <Link className="view-link" to={`/customer/deliveries/${d.id}`}>
          View details <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
