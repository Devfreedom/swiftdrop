// Admin dashboard: GET /admin/stats (totals by role/status/availability/money).
import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    api("/admin/stats").then(setS).catch((e) => setErr(e.message));
  }, []);
  if (err) return <p className="error">{err}</p>;
  if (!s) return <p className="muted">Loading…</p>;
  return (
    <div>
      <h2>Admin dashboard</h2>
      <div className="grid3">
        {(s.usersByRole || []).map((r) => (
          <div key={r.role} className="stat"><b>{r.count}</b><span>{r.role}</span></div>
        ))}
      </div>
      <h3>Deliveries by status</h3>
      <div className="grid3">
        {(s.deliveriesByStatus || []).map((r) => (
          <div key={r.status} className="stat"><b>{r.count}</b><span>{r.status}</span></div>
        ))}
      </div>
      <h3>Riders by availability</h3>
      <div className="grid3">
        {(s.ridersByAvailability || []).map((r) => (
          <div key={r.availability} className="stat"><b>{r.count}</b><span>{r.availability}</span></div>
        ))}
      </div>
      <p className="muted">Revenue: ₦{Number(s.successfulPayments?.revenue || 0).toFixed(2)} from {s.successfulPayments?.count || 0} payments</p>
    </div>
  );
}
