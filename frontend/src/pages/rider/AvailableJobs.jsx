// Open jobs: GET /rider/available (requires AVAILABLE). Accept one.
import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../components/Toast";
import StatusBadge from "../../components/StatusBadge";
import { formatNaira, trackingId } from "../../constants";
import { EmptyState, SkeletonList } from "../../components/Feedback";

export default function AvailableJobs() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState(null);

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
    setTaking(id);
    try {
      await api(`/rider/deliveries/${id}/accept`, { method: "POST" });
      toast.success(`Job ${trackingId(id)} accepted — you're on it!`);
      load();
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    } finally {
      setTaking(null);
    }
  }
  return (
    <div>
      <h2>Open jobs</h2>
      {err && <p className="error">{err}</p>}
      {loading ? <SkeletonList /> : items.length === 0 && !err ? (
        <EmptyState icon={PackageSearch} title="No open jobs right now"
          hint="New confirmed requests will appear here. Check back soon." />
      ) : items.map((d) => (
        <div key={d.id} className="row">
          <span>{trackingId(d.id)} {d.pickupAddress} → {d.deliveryAddress} ({formatNaira(d.deliveryFee)})</span>
          <span><StatusBadge value={d.status} />{" "}
            <button className="btn primary small" disabled={taking === d.id} onClick={() => accept(d.id)}>
              {taking === d.id ? "Taking…" : "Accept"}
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
