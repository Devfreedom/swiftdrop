// My current jobs: GET /rider/assigned, filtered locally by status.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { DELIVERY_STATUSES } from "../../constants";
import { EmptyState, SkeletonList } from "../../components/Feedback";

export default function AssignedJobs() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/rider/assigned").then((d) => setItems(d.deliveries))
      .catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, []);
  const shown = status ? items.filter((d) => d.status === status) : items;
  return (
    <div>
      <h2>My jobs</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
        {["", ...DELIVERY_STATUSES].map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
      </select>
      {err && <p className="error">{err}</p>}
      {loading ? <SkeletonList /> : shown.length === 0 ? (
        <EmptyState icon={Truck} title="No jobs here"
          hint="Accept an open job to get moving."
          actionTo="/rider/available" actionLabel="See open jobs" />
      ) : shown.map((d) => (
        <Link key={d.id} to={`/rider/deliveries/${d.id}`} className="row">
          <span>#{d.id} → {d.deliveryAddress}</span>
          <StatusBadge value={d.status} />
        </Link>
      ))}
    </div>
  );
}
