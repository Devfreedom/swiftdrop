// Rider delivery details: stepper + one-tap move to the next stage.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import { useToast } from "../../components/Toast";
import StatusBadge from "../../components/StatusBadge";
import Stepper from "../../components/Stepper";
import { formatNaira, trackingId } from "../../constants";
import Button from "../../ui/Button";
import { CenterLoad, ErrorState } from "../../components/Feedback";

const NEXT = { ASSIGNED: "PICKED_UP", PICKED_UP: "IN_TRANSIT", IN_TRANSIT: "DELIVERED" };

export default function RiderDeliveryDetails() {
  const { id } = useParams();
  const toast = useToast();
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [moving, setMoving] = useState(false);

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
    setErr(""); setMoving(true);
    try {
      const r = await api(`/rider/deliveries/${id}/status`, {
        method: "PATCH", body: { status: NEXT[d.status] },
      });
      setD(r.delivery);
      toast.success(`Job ${trackingId(id)} → ${r.delivery.status.replace("_", " ")}.`);
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    } finally {
      setMoving(false);
    }
  }
  if (err && !d) return <ErrorState title="Job not found" hint={err} onRetry={load} />;
  if (!d) return <CenterLoad text="Loading job…" />;
  return (
    <div className="card">
      <h2>Job {trackingId(d.id)} <StatusBadge value={d.status} /></h2>
      <Stepper status={d.status} />
      {err && <p className="error">{err}</p>}
      <p><b>Pickup:</b> {d.pickupAddress} ({d.pickupContact}, {d.pickupPhone})</p>
      {d.pickupLandmark && <p><b>Pickup landmark:</b> {d.pickupLandmark}</p>}
      <p><b>Drop-off:</b> {d.deliveryAddress} ({d.deliveryContact}, {d.deliveryPhone})</p>
      {d.deliveryLandmark && <p><b>Drop-off landmark:</b> {d.deliveryLandmark}</p>}
      <p><b>Parcel:</b> {d.packageDescription} · {formatNaira(d.deliveryFee)}</p>
      {NEXT[d.status] && (
        <Button variant="primary" onClick={advance} loading={moving}>
          {moving ? "Updating…" : `Mark ${NEXT[d.status].replace("_", " ")}`}
        </Button>
      )}
    </div>
  );
}
