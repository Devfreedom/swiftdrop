// New delivery: POST /deliveries. Riders/payment come later in the flow.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useToast } from "../../components/Toast";
import { Spinner } from "../../components/Feedback";

const FIELDS = [
  ["pickupAddress", "Pickup address"], ["pickupContact", "Pickup contact"],
  ["pickupPhone", "Pickup phone"], ["deliveryAddress", "Delivery address"],
  ["deliveryContact", "Delivery contact"], ["deliveryPhone", "Delivery phone"],
  ["packageDescription", "Parcel description"],
];

export default function CreateDelivery() {
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    pickupAddress: "", pickupContact: "", pickupPhone: "",
    deliveryAddress: "", deliveryContact: "", deliveryPhone: "",
    packageDescription: "", packageWeightKg: "", deliveryFee: "",
  });
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const v = {};
    for (const [k, label] of FIELDS) if (!form[k].trim()) v[k] = `${label} is required.`;
    if (form.deliveryFee === "" || Number(form.deliveryFee) < 0) v.deliveryFee = "Enter a valid fee (₦0 or more).";
    if (form.packageWeightKg !== "" && Number(form.packageWeightKg) < 0) v.packageWeightKg = "Weight can't be negative.";
    setErrs(v);
    if (Object.keys(v).length) return;
    setErr(""); setBusy(true);
    try {
      const body = { ...form };
      body.packageWeightKg = body.packageWeightKg === "" ? undefined : Number(body.packageWeightKg);
      body.deliveryFee = Number(body.deliveryFee);
      const d = await api("/deliveries", { method: "POST", body });
      toast.success(`Delivery #${d.delivery.id} created.`);
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
      <form onSubmit={submit} className="form grid2" noValidate>
        {FIELDS.map(([k, label]) => (
          <div key={k}>
            <label>{label}
              <input value={form[k]} onChange={set(k)} aria-invalid={!!errs[k]} />
            </label>
            {errs[k] && <p className="field-error">{errs[k]}</p>}
          </div>
        ))}
        <div>
          <label>Weight (kg, optional)
            <input type="number" min="0" step="0.1" value={form.packageWeightKg}
              onChange={set("packageWeightKg")} aria-invalid={!!errs.packageWeightKg} />
          </label>
          {errs.packageWeightKg && <p className="field-error">{errs.packageWeightKg}</p>}
        </div>
        <div>
          <label>Fee (₦)
            <input type="number" min="0" step="0.01" value={form.deliveryFee}
              onChange={set("deliveryFee")} aria-invalid={!!errs.deliveryFee} />
          </label>
          {errs.deliveryFee && <p className="field-error">{errs.deliveryFee}</p>}
        </div>
        <div>
          <button className="btn primary" disabled={busy}>
            {busy && <Spinner />} {busy ? "Creating…" : "Create delivery"}
          </button>
        </div>
      </form>
    </div>
  );
}
