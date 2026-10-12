// Manage one delivery: stepper, confirm PENDING, assign rider, cancel (confirmed).
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import { useToast } from "../../components/Toast";
import StatusBadge from "../../components/StatusBadge";
import Stepper from "../../components/Stepper";
import LiveDeliveryMap, { asPos, num } from "../../components/LiveDeliveryMap";
import ConfirmModal from "../../components/ConfirmModal";
import { formatNaira, trackingId } from "../../constants";
import Button from "../../ui/Button";
import { SelectInput } from "../../ui/fields";
import { CenterLoad, ErrorState } from "../../components/Feedback";

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
  if (err && !d) return <ErrorState title="Delivery not found" hint={err} onRetry={load} />;
  if (!d) return <CenterLoad text="Loading delivery…" />;
  return (
    <div className="card">
      <h2>Delivery {trackingId(d.id)} <StatusBadge value={d.status} /></h2>
      <Stepper status={d.status} />
      <LiveDeliveryMap
        deliveryId={d.id}
        pickup={asPos(num(d.pickupLat), num(d.pickupLng))}
        dropoff={asPos(num(d.dropoffLat), num(d.dropoffLng))}
        active={!["DELIVERED", "CANCELLED"].includes(d.status)}
      />
      {err && <p className="error">{err}</p>}
      <p><b>Customer:</b> {d.customer?.name} ({d.customer?.email})</p>
      <p><b>Rider:</b> {d.rider ? `${d.rider.name}` : "unassigned"}</p>
      <p><b>Route:</b> {d.pickupAddress} → {d.deliveryAddress}</p>
      {d.pickupLandmark && <p><b>Pickup landmark:</b> {d.pickupLandmark}</p>}
      {d.deliveryLandmark && <p><b>Drop-off landmark:</b> {d.deliveryLandmark}</p>}
      <p><b>Fee:</b> {formatNaira(d.deliveryFee)}</p>
      {(d.status === "PENDING" || d.status === "CONFIRMED") && (
        <div className="inline">
          {d.status === "PENDING" && (
            <Button variant="primary" loading={busy}
              onClick={() => act(`/admin/deliveries/${id}/confirm`, {}, "Delivery confirmed.")}>
              Confirm
            </Button>
          )}
          <Button variant="danger" disabled={busy} onClick={() => setConfirmCancel(true)}>Cancel</Button>
        </div>
      )}
      {d.status === "CONFIRMED" && (
        <>
          <h3 className="eyebrow">Assign rider (CONFIRMED + AVAILABLE only)</h3>
          <div className="inline">
            <SelectInput aria-label="Pick a rider" value={riderId} onChange={(e) => setRiderId(e.target.value)}>
              <option value="">Pick a rider</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>#{r.id} {r.name} ({r.availability})</option>
              ))}
            </SelectInput>
            <Button variant="primary" disabled={!riderId || busy} loading={busy}
              onClick={() => act(`/admin/deliveries/${id}/assign`, { riderId: Number(riderId) }, "Rider assigned.", true)}>
              Assign
            </Button>
          </div>
        </>
      )}
      <ConfirmModal open={confirmCancel} title={`Cancel delivery ${trackingId(d.id)}?`}
        message="The rider (if any) will be freed. This can't be undone."
        confirmLabel="Yes, cancel"
        onConfirm={() => { setConfirmCancel(false); act(`/admin/deliveries/${id}/cancel`, {}, "Delivery cancelled."); }}
        onCancel={() => setConfirmCancel(false)} />
    </div>
  );
}
