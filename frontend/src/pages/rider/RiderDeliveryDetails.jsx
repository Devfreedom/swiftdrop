// Rider delivery details: find job via assigned/history lists, then step status.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

const NEXT = { ASSIGNED: "PICKED_UP", PICKED_UP: "IN_TRANSIT", IN_TRANSIT: "DELIVERED" };

export default function RiderDeliveryDetails() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setErr("");
    try {
      const [a, h] = await Promise.all([api("/rider/assigned"), api("/rider/history")]);
      const found = [...a.deliveries, ...h.deliveries].find((x) => String(x.id) === String(id));
      if (!found) throw new Error("Delivery not found in your jobs");
      setD(found);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => { load(); }, [id]);

  async function advance() {
    setErr(""); setMsg("");
    try {
      const r = await api(`/rider/deliveries/${id}/status`, {
        method: "PATCH", body: { status: NEXT[d.status] },
      });
      setD(r.delivery);
      setMsg(`Moved to ${r.delivery.status}.`);
    } catch (e) {
      setErr(e.message);
    }
  }
  if (err && !d) return <p className="error">{err}</p>;
  if (!d) return <p className="muted">Loading…</p>;
  return (
    <div className="card">
      <h2>Job #{d.id} <StatusBadge value={d.status} /></h2>
      {err && <p className="error">{err}</p>}
      {msg && <p className="ok">{msg}</p>}
      <p><b>Pickup:</b> {d.pickupAddress} ({d.pickupContact}, {d.pickupPhone})</p>
      <p><b>Drop-off:</b> {d.deliveryAddress} ({d.deliveryContact}, {d.deliveryPhone})</p>
      <p><b>Parcel:</b> {d.packageDescription} · ₦{d.deliveryFee}</p>
      {NEXT[d.status] && (
        <button className="btn primary" onClick={advance}>Mark {NEXT[d.status]}</button>
      )}
    </div>
  );
}
