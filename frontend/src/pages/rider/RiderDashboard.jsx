// Rider dashboard: availability toggle, job stats, earnings summary, active jobs.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageCheck, Power, Truck, Wallet } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../components/Toast";
import StatusBadge from "../../components/StatusBadge";
import StatCard from "../../components/StatCard";
import { CenterLoad, EmptyState, Spinner } from "../../components/Feedback";

export default function RiderDashboard() {
  const toast = useToast();
  const [me, setMe] = useState(null);
  const [assigned, setAssigned] = useState([]);
  const [history, setHistory] = useState([]);
  const [err, setErr] = useState("");
  const [switching, setSwitching] = useState(false);

  async function load() {
    try {
      const [m, a, h] = await Promise.all([api("/me"), api("/rider/assigned"), api("/rider/history")]);
      setMe(m.user);
      setAssigned(a.deliveries);
      setHistory(h.deliveries);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => { load(); }, []);

  async function setAvail(availability) {
    setErr("");
    setSwitching(true);
    try {
      await api("/rider/availability", { method: "PATCH", body: { availability } });
      toast.success(availability === "AVAILABLE" ? "You're online — open jobs are visible." : "You're offline.");
      load();
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    } finally {
      setSwitching(false);
    }
  }
  if (!me) return <CenterLoad text="Loading dashboard…" />;
  // Earnings: fees carried on finished (DELIVERED) jobs.
  const delivered = history.filter((d) => d.status === "DELIVERED");
  const earned = delivered.reduce((s, d) => s + Number(d.deliveryFee), 0);
  return (
    <div>
      <h2>Rider dashboard</h2>
      {err && <p className="error">{err}</p>}
      <div className="grid3">
        <StatCard icon={Power} value={me.availability} label="your status" />
        <StatCard icon={Truck} value={assigned.length} label="active jobs" />
        <StatCard icon={PackageCheck} value={delivered.length} label="completed" />
        <StatCard icon={Wallet} value={`₦${earned.toFixed(2)}`} label="total earned" />
      </div>
      <div className="inline">
        <button className="btn primary" disabled={switching} onClick={() => setAvail("AVAILABLE")}>
          {switching && <Spinner />} Go available
        </button>
        <button className="btn" disabled={switching} onClick={() => setAvail("OFFLINE")}>Go offline</button>
      </div>
      <h3>Active jobs ({assigned.length})</h3>
      {assigned.length === 0 ? (
        <EmptyState icon={Truck} title="No active jobs"
          hint="Go available, then claim a job from Open jobs."
          actionTo="/rider/available" actionLabel="See open jobs" />
      ) : assigned.map((d) => (
        <Link key={d.id} to={`/rider/deliveries/${d.id}`} className="row">
          <span>#{d.id} → {d.deliveryAddress}</span>
          <StatusBadge value={d.status} />
        </Link>
      ))}
    </div>
  );
}
