// Finished jobs: GET /rider/history (DELIVERED + CANCELLED), filtered locally.
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { DELIVERY_STATUSES } from "../../constants";

export default function RiderHistory() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    api("/rider/history").then((d) => setItems(d.deliveries)).catch((e) => setErr(e.message));
  }, []);
  const shown = status ? items.filter((d) => d.status === status) : items;
  return (
    <div>
      <h2>History</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {["", ...DELIVERY_STATUSES].map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
      </select>
      {err && <p className="error">{err}</p>}
      {shown.map((d) => (
        <div key={d.id} className="row">
          <span>#{d.id} → {d.deliveryAddress}</span>
          <StatusBadge value={d.status} />
        </div>
      ))}
      {shown.length === 0 && <p className="muted">No finished jobs yet.</p>}
    </div>
  );
}
