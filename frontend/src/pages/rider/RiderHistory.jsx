// Finished jobs: GET /rider/history (DELIVERED + CANCELLED), filtered locally.
import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { DELIVERY_STATUSES } from "../../constants";
import { EmptyState, SkeletonList } from "../../components/Feedback";

export default function RiderHistory() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/rider/history").then((d) => setItems(d.deliveries))
      .catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, []);
  const shown = status ? items.filter((d) => d.status === status) : items;
  return (
    <div>
      <h2>History</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
        {["", ...DELIVERY_STATUSES].map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
      </select>
      {err && <p className="error">{err}</p>}
      {loading ? <SkeletonList /> : shown.length === 0 ? (
        <EmptyState icon={History} title="Nothing finished yet"
          hint="Delivered and cancelled jobs will show up here." />
      ) : shown.map((d) => (
        <div key={d.id} className="row">
          <span>#{d.id} → {d.deliveryAddress}</span>
          <StatusBadge value={d.status} />
        </div>
      ))}
    </div>
  );
}
