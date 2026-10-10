// New delivery: POST /deliveries. The fee is priced server-side
// (base + per-kg); the form shows a read-only estimate that updates with weight.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useToast } from "../../components/Toast";
import Button from "../../ui/Button";
import PageHeader from "../../ui/PageHeader";
import { TextInput, TextareaInput } from "../../ui/fields";
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
      <PageHeader title="New delivery" sub="Tell us what to move and where — we handle the rest." />
      {err && <p className="error">{err}</p>}
      <form onSubmit={submit} noValidate>
        <h3 className="eyebrow">Pickup</h3>
        <div className="form grid2">
          <TextInput label="Pickup address" error={errs.pickupAddress}
            value={form.pickupAddress} onChange={set("pickupAddress")}
            name="pickupAddress" autoComplete="street-address" />
          <TextInput label="Pickup contact" error={errs.pickupContact}
            value={form.pickupContact} onChange={set("pickupContact")}
            name="pickupContact" autoComplete="name" />
          <TextInput label="Pickup phone" error={errs.pickupPhone}
            type="tel" value={form.pickupPhone} onChange={set("pickupPhone")}
            name="pickupPhone" autoComplete="tel" placeholder="e.g. 020 000 0000" />
          <TextInput label="Pickup landmark (optional)"
            value={form.pickupLandmark} onChange={set("pickupLandmark")}
            name="pickupLandmark" autoComplete="off"
            placeholder="e.g. Opposite the mall main gate" />
        </div>

        <h3 className="eyebrow">Drop-off</h3>
        <div className="form grid2">
          <TextInput label="Delivery address" error={errs.deliveryAddress}
            value={form.deliveryAddress} onChange={set("deliveryAddress")}
            name="deliveryAddress" autoComplete="shipping street-address" />
          <TextInput label="Delivery contact" error={errs.deliveryContact}
            value={form.deliveryContact} onChange={set("deliveryContact")}
            name="deliveryContact" autoComplete="shipping name" />
          <TextInput label="Delivery phone" error={errs.deliveryPhone}
            type="tel" value={form.deliveryPhone} onChange={set("deliveryPhone")}
            name="deliveryPhone" autoComplete="shipping tel" placeholder="e.g. 020 000 0000" />
          <TextInput label="Drop-off landmark (optional)"
            value={form.deliveryLandmark} onChange={set("deliveryLandmark")}
            name="deliveryLandmark" autoComplete="off"
            placeholder="e.g. Blue house after the junction" />
        </div>

        <h3 className="eyebrow">Package</h3>
        <div className="form grid2">
          <TextareaInput label="Parcel description" error={errs.packageDescription}
            value={form.packageDescription} onChange={set("packageDescription")}
            name="packageDescription" rows={3}
            placeholder="e.g. Laptop in a padded box" />
          <TextInput label="Weight (kg, optional)" error={errs.packageWeightKg}
            type="number" min="0" step="0.1" value={form.packageWeightKg}
            onChange={set("packageWeightKg")} name="packageWeightKg"
            placeholder="Defaults to 1 kg" hint="Price updates live below." />
        </div>

        <div className="price-box" role="status" aria-live="polite">
          <div>
            <span>Estimated price</span>
            <strong>{formatNaira(estimate)}</strong>
          </div>
          <small>Base {formatNaira(BASE_FEE)} + {formatNaira(PER_KG_FEE)} × {weight} kg · final price is set when you submit</small>
        </div>

        <div className="inline">
          <Button type="submit" variant="primary" loading={busy}>
            {busy ? "Creating…" : "Create delivery"}
          </Button>
        </div>
      </form>
    </div>
  );
}
