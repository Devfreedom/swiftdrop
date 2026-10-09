// My current jobs: GET /rider/assigned.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

export default function AssignedJobs() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    api("/rider/assigned").then((d) => setItems(d.deliveries)).catch((e) => setErr(e.message));
  }, []);
  return (
    <div>
      <h2>My jobs</h2>
      {err && <p className="error">{err}</p>}
      {items.map((d) => (
        <Link key={d.id} to={`/rider/deliveries/${d.id}`} className="row">
          <span>#{d.id} → {d.deliveryAddress}</span>
          <StatusBadge value={d.status} />
        </Link>
      ))}
      {items.length === 0 && <p className="muted">No active jobs.</p>}
    </div>
  );
}
