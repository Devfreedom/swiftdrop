// Finished jobs: GET /rider/history (DELIVERED + CANCELLED).
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

export default function RiderHistory() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    api("/rider/history").then((d) => setItems(d.deliveries)).catch((e) => setErr(e.message));
  }, []);
  return (
    <div>
      <h2>History</h2>
      {err && <p className="error">{err}</p>}
      {items.map((d) => (
        <div key={d.id} className="row">
          <span>#{d.id} → {d.deliveryAddress}</span>
          <StatusBadge value={d.status} />
        </div>
      ))}
      {items.length === 0 && <p className="muted">No finished jobs yet.</p>}
    </div>
  );
}
