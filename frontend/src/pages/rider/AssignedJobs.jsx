// My current jobs: GET /rider/assigned, filtered locally by status.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { DELIVERY_STATUSES } from "../../constants";

export default function AssignedJobs() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    api("/rider/assigned").then((d) => setItems(d.deliveries)).catch((e) => setErr(e.message));
  }, []);
  const shown = status ? items.filter((d) => d.status === status) : items;
  return (
    <div>
      <h2>My jobs</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {["", ...DELIVERY_STATUSES].map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
      </select>
      {err && <p className="error">{err}</p>}
      {shown.map((d) => (
        <Link key={d.id} to={`/rider/deliveries/${d.id}`} className="row">
          <span>#{d.id} → {d.deliveryAddress}</span>
          <StatusBadge value={d.status} />
        </Link>
      ))}
      {shown.length === 0 && <p className="muted">No active jobs.</p>}
    </div>
  );
}
