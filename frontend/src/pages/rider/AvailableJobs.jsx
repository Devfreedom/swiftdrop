// Open jobs: GET /rider/available (requires AVAILABLE). Accept one.
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

export default function AvailableJobs() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const d = await api("/rider/available");
      setItems(d.deliveries);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function accept(id) {
    setErr("");
    try {
      await api(`/rider/deliveries/${id}/accept`, { method: "POST" });
      load();
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <div>
      <h2>Open jobs</h2>
      {err && <p className="error">{err}</p>}
      {loading ? <p className="muted">Loading…</p> : items.map((d) => (
        <div key={d.id} className="row">
          <span>#{d.id} {d.pickupAddress} → {d.deliveryAddress} (₦{d.deliveryFee})</span>
          <span><StatusBadge value={d.status} /> <button className="btn primary" onClick={() => accept(d.id)}>Accept</button></span>
        </div>
      ))}
      {!loading && items.length === 0 && !err && <p className="muted">No open jobs.</p>}
    </div>
  );
}
