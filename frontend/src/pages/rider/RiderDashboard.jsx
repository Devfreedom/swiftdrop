// Rider dashboard: availability toggle + job counts.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

export default function RiderDashboard() {
  const [me, setMe] = useState(null);
  const [assigned, setAssigned] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    try {
      const [m, a] = await Promise.all([api("/me"), api("/rider/assigned")]);
      setMe(m.user);
      setAssigned(a.deliveries);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => { load(); }, []);

  async function setAvail(availability) {
    setErr("");
    try {
      await api("/rider/availability", { method: "PATCH", body: { availability } });
      load();
    } catch (e) {
      setErr(e.message);
    }
  }
  if (!me) return <p className="muted">Loading…</p>;
  return (
    <div>
      <h2>Rider dashboard</h2>
      {err && <p className="error">{err}</p>}
      <p>Availability: <StatusBadge value={me.availability} /></p>
      <div className="inline">
        <button className="btn primary" onClick={() => setAvail("AVAILABLE")}>Go available</button>
        <button className="btn" onClick={() => setAvail("OFFLINE")}>Go offline</button>
      </div>
      <h3>Active jobs ({assigned.length})</h3>
      {assigned.map((d) => (
        <Link key={d.id} to={`/rider/deliveries/${d.id}`} className="row">
          <span>#{d.id} → {d.deliveryAddress}</span>
          <StatusBadge value={d.status} />
        </Link>
      ))}
      {assigned.length === 0 && <p className="muted">No active jobs.</p>}
    </div>
  );
}
