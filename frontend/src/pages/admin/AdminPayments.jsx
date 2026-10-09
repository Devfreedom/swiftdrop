// All payments + refund button for SUCCESSFUL ones.
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

export default function AdminPayments() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setErr("");
    try {
      const d = await api(`/admin/payments${status ? `?status=${status}` : ""}`);
      setItems(d.payments);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => { load(); }, [status]);

  async function refund(id) {
    setErr(""); setMsg("");
    try {
      await api(`/admin/payments/${id}/refund`, { method: "POST" });
      setMsg(`Payment #${id} refunded.`);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <div>
      <h2>Payments</h2>
      {err && <p className="error">{err}</p>}
      {msg && <p className="ok">{msg}</p>}
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option><option>PENDING</option><option>SUCCESSFUL</option><option>FAILED</option><option>REFUNDED</option>
      </select>
      {items.map((p) => (
        <div key={p.id} className="row">
          <span>#{p.id} delivery #{p.deliveryId} · ₦{p.amount}</span>
          <span>
            <StatusBadge value={p.method} /> <StatusBadge value={p.status} />{" "}
            {p.status === "SUCCESSFUL" && <button className="btn small" onClick={() => refund(p.id)}>Refund</button>}
          </span>
        </div>
      ))}
      {items.length === 0 && <p className="muted">No payments.</p>}
    </div>
  );
}
