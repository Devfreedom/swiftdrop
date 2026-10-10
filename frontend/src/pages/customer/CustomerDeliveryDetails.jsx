// Delivery details: stepper, rider, payments. Actions: pay + cancel (confirmed).
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import { useToast } from "../../components/Toast";
import StatusBadge from "../../components/StatusBadge";
import Stepper from "../../components/Stepper";
import ConfirmModal from "../../components/ConfirmModal";
import Button from "../../ui/Button";
import { SelectInput } from "../../ui/fields";
import { formatNaira, trackingId } from "../../constants";
import { CenterLoad, ErrorState } from "../../components/Feedback";

export default function CustomerDeliveryDetails() {
  const { id } = useParams();
  const toast = useToast();
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [method, setMethod] = useState("CARD");
  const [paying, setPaying] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

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
    setErr(""); setPaying(true);
    try {
      const r = await api(`/deliveries/${id}/pay`, { method: "POST", body: { method } });
      toast.success(r.payment.status === "PENDING"
        ? "Cash payment recorded — pay the rider on delivery."
        : `Paid ${formatNaira(r.payment.amount)} with ${method}.`);
      load();
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    } finally {
      setPaying(false);
    }
  }
  async function cancel() {
    setConfirmCancel(false);
    setErr("");
    try {
      const r = await api(`/deliveries/${id}/cancel`, { method: "PATCH", body: {} });
      setD(r.delivery);
      toast.success("Delivery cancelled.");
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    }
  }
  if (err && !d) return <ErrorState title="Delivery not found" hint={err} onRetry={load} />;
  if (!d) return <CenterLoad text="Loading delivery…" />;
  const paid = (d.payments || []).some((p) => p.status === "SUCCESSFUL");
  const pending = !paid && (d.payments || []).some((p) => p.status === "PENDING");
  const cancellable = ["PENDING", "CONFIRMED", "ASSIGNED"].includes(d.status);
  return (
    <div className="card">
      <h2>Delivery {trackingId(d.id)} <StatusBadge value={d.status} /></h2>
      <Stepper status={d.status} />
      {err && <p className="error">{err}</p>}
      <p><b>Pickup:</b> {d.pickupAddress} ({d.pickupContact}, {d.pickupPhone})</p>
      {d.pickupLandmark && <p><b>Pickup landmark:</b> {d.pickupLandmark}</p>}
      <p><b>Drop-off:</b> {d.deliveryAddress} ({d.deliveryContact}, {d.deliveryPhone})</p>
      {d.deliveryLandmark && <p><b>Drop-off landmark:</b> {d.deliveryLandmark}</p>}
      <p><b>Parcel:</b> {d.packageDescription}{d.packageWeightKg != null && ` · ${d.packageWeightKg} kg`}</p>
      <p><b>Price:</b> {formatNaira(d.deliveryFee)}</p>
      <p><b>Rider:</b> {d.rider ? `${d.rider.name} (${d.rider.phone || "no phone"})` : "not assigned yet"}</p>
      <h3 className="eyebrow">Payments</h3>
      {(d.payments || []).length === 0 && <p className="muted">No payment yet.</p>}
      {(d.payments || []).map((p) => (
        <p key={p.id}>{trackingId(d.id)} · {formatNaira(p.amount)} <StatusBadge value={p.method} /> <StatusBadge value={p.status} /></p>
      ))}
      {pending && <p className="muted">Cash payment pending — an admin confirms it once collected.</p>}
      {!paid && !pending && d.status !== "CANCELLED" && d.status !== "DELIVERED" && (
        <div className="inline">
          <SelectInput aria-label="Payment method" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>CASH</option><option>CARD</option><option>TRANSFER</option>
          </SelectInput>
          <Button variant="primary" onClick={pay} loading={paying}>
            {paying ? "Paying…" : `Pay ${formatNaira(d.deliveryFee)}`}
          </Button>
        </div>
      )}
      {cancellable && (
        <div className="inline">
          <Button variant="danger" onClick={() => setConfirmCancel(true)}>Cancel delivery</Button>
        </div>
      )}
      <ConfirmModal open={confirmCancel} title={`Cancel delivery ${trackingId(d.id)}?`}
        message="The rider (if any) will be freed. This can't be undone."
        confirmLabel="Yes, cancel" onConfirm={cancel} onCancel={() => setConfirmCancel(false)} />
    </div>
  );
}
