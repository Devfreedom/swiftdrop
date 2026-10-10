// New delivery: POST /deliveries. The fee is priced server-side
// (base + per-kg); the form shows a read-only estimate that updates with weight.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useToast } from "../../components/Toast";
import { Spinner } from "../../components/Feedback";
import {
  BASE_FEE, PER_KG_FEE, estimateDeliveryFee, formatNaira,
  resolveWeightKg, trackingId,
} from "../../constants";

const REQUIRED = [
  ["pickupAddress", "Pickup address"], ["pickupContact", "Pickup contact"],
  ["pickupPhone", "Pickup phone"], ["deliveryAddress", "Delivery address"],
  ["deliveryContact", "Delivery contact"], ["deliveryPhone", "Delivery phone"],
  ["packageDescription", "Parcel description"],
];

function Field({ label, error, children }) {
  return (
    <div>
      <label>{label}{children}</label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default function CreateDelivery() {
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    pickupAddress: "", pickupContact: "", pickupPhone: "", pickupLandmark: "",
    deliveryAddress: "", deliveryContact: "", deliveryPhone: "", deliveryLandmark: "",
    packageDescription: "", packageWeightKg: "",
  });
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const weight = resolveWeightKg(form.packageWeightKg);
  const estimate = estimateDeliveryFee(form.packageWeightKg);

  async function submit(e) {
    e.preventDefault();
    const v = {};
    for (const [k, label] of REQUIRED) if (!form[k].trim()) v[k] = `${label} is required.`;
    if (form.packageWeightKg !== "" && Number(form.packageWeightKg) < 0) v.packageWeightKg = "Weight can't be negative.";
    setErrs(v);
    if (Object.keys(v).length) return;
    setErr(""); setBusy(true);
    try {
      const body = { ...form };
      body.packageWeightKg = body.packageWeightKg === "" ? undefined : Number(body.packageWeightKg);
      if (body.pickupLandmark === "") body.pickupLandmark = undefined;
      if (body.deliveryLandmark === "") body.deliveryLandmark = undefined;
      const d = await api("/deliveries", { method: "POST", body });
      toast.success(`Delivery ${trackingId(d.delivery.id)} created.`);
      nav(`/customer/deliveries/${d.delivery.id}`);
    } catch (e2) {
      setErr(e2.message);
      toast.error(e2.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="card">
      <h2>New delivery</h2>
      <p className="muted small">Tell us what to move and where — we handle the rest.</p>
      {err && <p className="error">{err}</p>}
      <form onSubmit={submit} noValidate>
        <h3>Pickup</h3>
        <div className="form grid2">
          <Field label="Pickup address" error={errs.pickupAddress}>
            <input value={form.pickupAddress} onChange={set("pickupAddress")}
              name="pickupAddress" autoComplete="street-address" aria-invalid={!!errs.pickupAddress} />
          </Field>
          <Field label="Pickup contact" error={errs.pickupContact}>
            <input value={form.pickupContact} onChange={set("pickupContact")}
              name="pickupContact" autoComplete="name" aria-invalid={!!errs.pickupContact} />
          </Field>
          <Field label="Pickup phone" error={errs.pickupPhone}>
            <input type="tel" value={form.pickupPhone} onChange={set("pickupPhone")}
              name="pickupPhone" autoComplete="tel" placeholder="e.g. 020 000 0000"
              aria-invalid={!!errs.pickupPhone} />
          </Field>
          <Field label="Pickup landmark (optional)">
            <input value={form.pickupLandmark} onChange={set("pickupLandmark")}
              name="pickupLandmark" autoComplete="off"
              placeholder="e.g. Opposite the mall main gate" />
          </Field>
        </div>

        <h3>Drop-off</h3>
        <div className="form grid2">
          <Field label="Delivery address" error={errs.deliveryAddress}>
            <input value={form.deliveryAddress} onChange={set("deliveryAddress")}
              name="deliveryAddress" autoComplete="shipping street-address"
              aria-invalid={!!errs.deliveryAddress} />
          </Field>
          <Field label="Delivery contact" error={errs.deliveryContact}>
            <input value={form.deliveryContact} onChange={set("deliveryContact")}
              name="deliveryContact" autoComplete="shipping name"
              aria-invalid={!!errs.deliveryContact} />
          </Field>
          <Field label="Delivery phone" error={errs.deliveryPhone}>
            <input type="tel" value={form.deliveryPhone} onChange={set("deliveryPhone")}
              name="deliveryPhone" autoComplete="shipping tel" placeholder="e.g. 020 000 0000"
              aria-invalid={!!errs.deliveryPhone} />
          </Field>
          <Field label="Drop-off landmark (optional)">
            <input value={form.deliveryLandmark} onChange={set("deliveryLandmark")}
              name="deliveryLandmark" autoComplete="off"
              placeholder="e.g. Blue house after the junction" />
          </Field>
        </div>

        <h3>Package</h3>
        <div className="form grid2">
          <Field label="Parcel description" error={errs.packageDescription}>
            <textarea value={form.packageDescription} onChange={set("packageDescription")}
              name="packageDescription" rows={3}
              placeholder="e.g. Laptop in a padded box"
              aria-invalid={!!errs.packageDescription} />
          </Field>
          <Field label="Weight (kg, optional)" error={errs.packageWeightKg}>
            <input type="number" min="0" step="0.1" value={form.packageWeightKg}
              onChange={set("packageWeightKg")} name="packageWeightKg"
              placeholder="Defaults to 1 kg" aria-invalid={!!errs.packageWeightKg} />
          </Field>
        </div>

        <div className="price-box" role="status" aria-live="polite">
          <div>
            <span>Estimated price</span>
            <strong>{formatNaira(estimate)}</strong>
          </div>
          <small>Base {formatNaira(BASE_FEE)} + {formatNaira(PER_KG_FEE)} × {weight} kg · final price is set when you submit</small>
        </div>

        <div className="inline">
          <button className="btn primary" disabled={busy}>
            {busy && <Spinner />} {busy ? "Creating…" : "Create delivery"}
          </button>
        </div>
      </form>
    </div>
  );
}
