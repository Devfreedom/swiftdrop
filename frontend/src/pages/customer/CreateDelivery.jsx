// New delivery: POST /deliveries. Riders/payment come later in the flow.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

const FIELDS = [
  "pickupAddress", "pickupContact", "pickupPhone",
  "deliveryAddress", "deliveryContact", "deliveryPhone",
  "packageDescription",
];

export default function CreateDelivery() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    pickupAddress: "", pickupContact: "", pickupPhone: "",
    deliveryAddress: "", deliveryContact: "", deliveryPhone: "",
    packageDescription: "", packageWeightKg: "", deliveryFee: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const body = { ...form };
      body.packageWeightKg = body.packageWeightKg === "" ? undefined : Number(body.packageWeightKg);
      body.deliveryFee = Number(body.deliveryFee);
      const d = await api("/deliveries", { method: "POST", body });
      nav(`/customer/deliveries/${d.delivery.id}`);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="card">
      <h2>New delivery</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={submit} className="form grid2">
        {FIELDS.map((f) => (
          <label key={f}>{f}<input value={form[f]} onChange={set(f)} required /></label>
        ))}
        <label>packageWeightKg (optional)<input type="number" min="0" step="0.1" value={form.packageWeightKg} onChange={set("packageWeightKg")} /></label>
        <label>deliveryFee<input type="number" min="0" step="0.01" value={form.deliveryFee} onChange={set("deliveryFee")} required /></label>
        <button className="btn primary" disabled={busy}>{busy ? "Creating…" : "Create delivery"}</button>
      </form>
    </div>
  );
}
