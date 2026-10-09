// Manage one delivery: stepper, confirm PENDING, assign rider, cancel (confirmed).
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import { useToast } from "../../components/Toast";
import StatusBadge from "../../components/StatusBadge";
import Stepper from "../../components/Stepper";
import ConfirmModal from "../../components/ConfirmModal";
import { CenterLoad, Spinner } from "../../components/Feedback";

export default function AdminDeliveryDetails() {
  const { id } = useParams();
  const toast = useToast();
  const [d, setD] = useState(null);
  const [riders, setRiders] = useState([]);
  const [riderId, setRiderId] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

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

  async function act(path, body, okMsg, isPost) {
    setErr(""); setBusy(true);
    try {
      const r = await api(path, { method: isPost ? "POST" : "PATCH", body: body || {} });
      setD(r.delivery);
      toast.success(okMsg);
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (err && !d) return <p className="error">{err}</p>;
  if (!d) return <CenterLoad text="Loading delivery…" />;
  return (
    <div className="card">
      <h2>Delivery #{d.id} <StatusBadge value={d.status} /></h2>
      <Stepper status={d.status} />
      {err && <p className="error">{err}</p>}
      <p><b>Customer:</b> {d.customer?.name} ({d.customer?.email})</p>
      <p><b>Rider:</b> {d.rider ? `${d.rider.name}` : "unassigned"}</p>
      <p><b>Route:</b> {d.pickupAddress} → {d.deliveryAddress}</p>
      {d.pickupLandmark && <p><b>Pickup landmark:</b> {d.pickupLandmark}</p>}
      {d.deliveryLandmark && <p><b>Drop-off landmark:</b> {d.deliveryLandmark}</p>}
      <p><b>Fee:</b> ₦{d.deliveryFee}</p>
      <div className="inline">
        <button className="btn primary" disabled={busy}
          onClick={() => act(`/admin/deliveries/${id}/confirm`, {}, "Delivery confirmed.")}>
          {busy && <Spinner />} Confirm
        </button>
        <button className="btn danger" disabled={busy} onClick={() => setConfirmCancel(true)}>Cancel</button>
      </div>
      <h3>Assign rider (CONFIRMED + AVAILABLE only)</h3>
      <div className="inline">
        <select value={riderId} onChange={(e) => setRiderId(e.target.value)} aria-label="Pick a rider">
          <option value="">Pick a rider</option>
          {riders.map((r) => (
            <option key={r.id} value={r.id}>#{r.id} {r.name} ({r.availability})</option>
          ))}
        </select>
        <button className="btn primary" disabled={!riderId || busy}
          onClick={() => act(`/admin/deliveries/${id}/assign`, { riderId: Number(riderId) }, "Rider assigned.", true)}>
          {busy && <Spinner />} Assign
        </button>
      </div>
      <ConfirmModal open={confirmCancel} title={`Cancel delivery #${d.id}?`}
        message="The rider (if any) will be freed. This can't be undone."
        confirmLabel="Yes, cancel"
        onConfirm={() => { setConfirmCancel(false); act(`/admin/deliveries/${id}/cancel`, {}, "Delivery cancelled."); }}
        onCancel={() => setConfirmCancel(false)} />
    </div>
  );
}
