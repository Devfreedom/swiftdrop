// Manage one delivery: confirm PENDING, assign AVAILABLE rider, cancel.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

export default function AdminDeliveryDetails() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [riders, setRiders] = useState([]);
  const [riderId, setRiderId] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setErr("");
    try {
      const [all, r] = await Promise.all([
        api("/admin/deliveries"),
        api("/admin/users?role=RIDER&status=ACTIVE"),
      ]);
      const found = all.deliveries.find((x) => String(x.id) === String(id));
      if (!found) throw new Error("Delivery not found");
      setD(found);
      setRiders(r.users);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => { load(); }, [id]);

  async function act(path, body, okMsg) {
    setErr(""); setMsg("");
    try {
      const r = await api(path, { method: path.includes("assign") ? "POST" : "PATCH", body: body || {} });
      setD(r.delivery);
      setMsg(okMsg);
    } catch (e) {
      setErr(e.message);
    }
  }
  if (err && !d) return <p className="error">{err}</p>;
  if (!d) return <p className="muted">Loading…</p>;
  return (
    <div className="card">
      <h2>Delivery #{d.id} <StatusBadge value={d.status} /></h2>
      {err && <p className="error">{err}</p>}
      {msg && <p className="ok">{msg}</p>}
      <p><b>Customer:</b> {d.customer?.name} ({d.customer?.email})</p>
      <p><b>Rider:</b> {d.rider ? `${d.rider.name}` : "unassigned"}</p>
      <p><b>Route:</b> {d.pickupAddress} → {d.deliveryAddress}</p>
      <p><b>Fee:</b> ₵{d.deliveryFee}</p>
      <div className="inline">
        <button className="btn primary" onClick={() => act(`/admin/deliveries/${id}/confirm`, {}, "Confirmed.")}>Confirm</button>
        <button className="btn danger" onClick={() => act(`/admin/deliveries/${id}/cancel`, {}, "Cancelled.")}>Cancel</button>
      </div>
      <h3>Assign rider (CONFIRMED + AVAILABLE only)</h3>
      <div className="inline">
        <select value={riderId} onChange={(e) => setRiderId(e.target.value)}>
          <option value="">Pick a rider</option>
          {riders.map((r) => (
            <option key={r.id} value={r.id}>#{r.id} {r.name} ({r.availability})</option>
          ))}
        </select>
        <button className="btn primary" disabled={!riderId}
          onClick={() => act(`/admin/deliveries/${id}/assign`, { riderId: Number(riderId) }, "Rider assigned.")}>
          Assign
        </button>
      </div>
    </div>
  );
}
