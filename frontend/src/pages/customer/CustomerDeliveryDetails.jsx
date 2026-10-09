// Delivery details: status, rider, payments. Actions: pay + cancel.
// CASH stays PENDING until an admin confirms it; CARD/TRANSFER are instant.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

export default function CustomerDeliveryDetails() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [method, setMethod] = useState("CARD");

  async function load() {
    try {
      const r = await api(`/deliveries/${id}`);
      setD(r.delivery);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => { load(); }, [id]);

  async function pay() {
    setErr(""); setMsg("");
    try {
      const r = await api(`/deliveries/${id}/pay`, { method: "POST", body: { method } });
      setMsg(r.payment.status === "PENDING"
        ? "Cash payment recorded as pending — pay the rider on delivery."
        : `Paid with ${method}.`);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }
  async function cancel() {
    setErr(""); setMsg("");
    try {
      const r = await api(`/deliveries/${id}/cancel`, { method: "PATCH", body: {} });
      setD(r.delivery);
      setMsg("Delivery cancelled.");
    } catch (e) {
      setErr(e.message);
    }
  }
  if (err && !d) return <p className="error">{err}</p>;
  if (!d) return <p className="muted">Loading…</p>;
  const paid = (d.payments || []).some((p) => p.status === "SUCCESSFUL");
  const pending = !paid && (d.payments || []).some((p) => p.status === "PENDING");
  return (
    <div className="card">
      <h2>Delivery #{d.id} <StatusBadge value={d.status} /></h2>
      {err && <p className="error">{err}</p>}
      {msg && <p className="ok">{msg}</p>}
      <p><b>Pickup:</b> {d.pickupAddress} ({d.pickupContact}, {d.pickupPhone})</p>
      <p><b>Drop-off:</b> {d.deliveryAddress} ({d.deliveryContact}, {d.deliveryPhone})</p>
      <p><b>Parcel:</b> {d.packageDescription} · ₦{d.deliveryFee}</p>
      <p><b>Rider:</b> {d.rider ? `${d.rider.name} (${d.rider.phone || "no phone"})` : "not assigned yet"}</p>
      <h3>Payments</h3>
      {(d.payments || []).length === 0 && <p className="muted">No payment yet.</p>}
      {(d.payments || []).map((p) => (
        <p key={p.id}>#{p.id} ₦{p.amount} <StatusBadge value={p.method} /> <StatusBadge value={p.status} /></p>
      ))}
      {pending && <p className="muted">Cash payment pending — an admin confirms it once collected.</p>}
      {!paid && !pending && d.status !== "CANCELLED" && d.status !== "DELIVERED" && (
        <div className="inline">
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>CASH</option><option>CARD</option><option>TRANSFER</option>
          </select>
          <button className="btn primary" onClick={pay}>Pay ₦{d.deliveryFee}</button>
        </div>
      )}
      <div className="inline">
        <button className="btn danger" onClick={cancel}>Cancel delivery</button>
      </div>
    </div>
  );
}
