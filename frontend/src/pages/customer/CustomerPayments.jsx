// Payment history for my deliveries: GET /payments, filtered locally by status.
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { PAYMENT_STATUSES, formatNaira, trackingId } from "../../constants";
import { SelectInput } from "../../ui/fields";
import { CenterLoad, EmptyState } from "../../components/Feedback";

export default function CustomerPayments() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/payments").then((d) => setItems(d.payments))
      .catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, []);
  const shown = status ? items.filter((p) => p.status === status) : items;
  if (loading) return <CenterLoad text="Loading payments…" />;
  return (
    <div>
      <h2>Payments</h2>
      <SelectInput aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
        {["", ...PAYMENT_STATUSES].map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
      </SelectInput>
      {err && <p className="error">{err}</p>}
      {shown.length === 0 ? (
        <EmptyState icon={Wallet} title="No payments yet"
          hint="Payments for your deliveries will appear here." />
      ) : shown.map((p) => (
        <div key={p.id} className="row">
          <span>{trackingId(p.deliveryId)} · {formatNaira(p.amount)}</span>
          <span><StatusBadge value={p.method} /> <StatusBadge value={p.status} /></span>
        </div>
      ))}
    </div>
  );
}
