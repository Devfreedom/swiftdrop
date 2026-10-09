// Users: list + filter + suspend/activate. Riders page reuses this with role=RIDER.
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

export default function AdminUsers({ fixedRole }) {
  const [items, setItems] = useState([]);
  const [role, setRole] = useState(fixedRole || "");
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setErr("");
    try {
      const q = new URLSearchParams();
      const r = fixedRole || role;
      if (r) q.set("role", r);
      if (status) q.set("status", status);
      const d = await api(`/admin/users?${q.toString()}`);
      setItems(d.users);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => { load(); }, [role, status]);

  async function setStatusOf(id, s) {
    setErr(""); setMsg("");
    try {
      await api(`/admin/users/${id}/status`, { method: "PATCH", body: { status: s } });
      setMsg(`User #${id} → ${s}`);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <div>
      <h2>{fixedRole ? `${fixedRole.toLowerCase()}s` : "Users"}</h2>
      {err && <p className="error">{err}</p>}
      {msg && <p className="ok">{msg}</p>}
      <div className="inline">
        {!fixedRole && (
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option><option>CUSTOMER</option><option>RIDER</option><option>ADMIN</option>
          </select>
        )}
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option><option>ACTIVE</option><option>INACTIVE</option><option>SUSPENDED</option>
        </select>
      </div>
      {items.map((u) => (
        <div key={u.id} className="row">
          <span>#{u.id} {u.name} · {u.email}</span>
          <span>
            <StatusBadge value={u.role} /> <StatusBadge value={u.status} />{" "}
            {u.role === "RIDER" && <StatusBadge value={u.availability} />}{" "}
            <button className="btn small" onClick={() => setStatusOf(u.id, "ACTIVE")}>Activate</button>{" "}
            <button className="btn small" onClick={() => setStatusOf(u.id, "SUSPENDED")}>Suspend</button>
          </span>
        </div>
      ))}
      {items.length === 0 && <p className="muted">No users.</p>}
    </div>
  );
}
