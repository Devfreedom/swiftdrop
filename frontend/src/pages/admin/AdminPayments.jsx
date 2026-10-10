// All payments: confirm PENDING (cash) ones, refund SUCCESSFUL ones (confirmed).
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../components/Toast";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
import { PAYMENT_STATUSES, formatNaira, trackingId } from "../../constants";
import Button from "../../ui/Button";
import { SelectInput } from "../../ui/fields";
import { EmptyState, SkeletonList } from "../../components/Feedback";

export default function AdminPayments() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [refundId, setRefundId] = useState(null);

  async function load() {
    setErr("");
    try {
      const d = await api(`/admin/payments${status ? `?status=${status}` : ""}`);
      setItems(d.payments);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { setLoading(true); load(); }, [status]);

  async function confirm(id) {
    setErr("");
    try {
      await api(`/admin/payments/${id}/confirm`, { method: "POST" });
      toast.success(`Payment #${id} confirmed as collected.`);
      load();
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    }
  }
  async function refund() {
    setRefundId(null);
    setErr("");
    try {
      await api(`/admin/payments/${refundId}/refund`, { method: "POST" });
      toast.success(`Payment #${refundId} refunded.`);
      load();
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    }
  }
  return (
    <div>
      <h2>Payments</h2>
      {err && <p className="error">{err}</p>}
      <SelectInput aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
        {["", ...PAYMENT_STATUSES].map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
      </SelectInput>
      {loading ? <SkeletonList /> : items.length === 0 ? (
        <EmptyState icon={Wallet} title="No payments found" hint="Try a different filter." />
      ) : items.map((p) => (
        <div key={p.id} className="row">
          <span>{trackingId(p.deliveryId)} · {formatNaira(p.amount)}</span>
          <span>
            <StatusBadge value={p.method} /> <StatusBadge value={p.status} />{" "}
            {p.status === "PENDING" && <Button size="sm" onClick={() => confirm(p.id)}>Confirm</Button>}
            {p.status === "SUCCESSFUL" && <Button size="sm" onClick={() => setRefundId(p.id)}>Refund</Button>}
          </span>
        </div>
      ))}
      <ConfirmModal open={refundId !== null} title={`Refund payment #${refundId}?`}
        message="The amount returns to pending settlement. This can't be undone."
        confirmLabel="Yes, refund" onConfirm={refund} onCancel={() => setRefundId(null)} />
    </div>
  );
}
