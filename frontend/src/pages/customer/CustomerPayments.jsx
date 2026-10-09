// Payment history for my deliveries: GET /payments, filtered locally by status.
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { PAYMENT_STATUSES } from "../../constants";
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
      <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
        {["", ...PAYMENT_STATUSES].map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
      </select>
      {err && <p className="error">{err}</p>}
      {shown.length === 0 ? (
        <EmptyState icon={Wallet} title="No payments yet"
          hint="Payments for your deliveries will appear here." />
      ) : shown.map((p) => (
        <div key={p.id} className="row">
          <span>#{p.id} delivery #{p.deliveryId} · ₦{p.amount}</span>
          <span><StatusBadge value={p.method} /> <StatusBadge value={p.status} /></span>
        </div>
      ))}
    </div>
  );
}
