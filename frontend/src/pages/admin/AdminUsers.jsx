// Users: list + filter + suspend/activate (with confirmation). Riders page reuses this.
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../components/Toast";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
import Button from "../../ui/Button";
import { SelectInput } from "../../ui/fields";
import { EmptyState, SkeletonList, Spinner } from "../../components/Feedback";

export default function AdminUsers({ fixedRole }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [role, setRole] = useState(fixedRole || "");
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null); // {id, name, status} pending change
  const [saving, setSaving] = useState(false);

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
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { setLoading(true); load(); }, [role, status]);

  async function applyStatus() {
    if (!target) return;
    setSaving(true);
    try {
      await api(`/admin/users/${target.id}/status`, { method: "PATCH", body: { status: target.status } });
      toast.success(`${target.name} → ${target.status}.`);
      setTarget(null);
      load();
    } catch (e) {
      setErr(e.message);
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div>
      <h2>{fixedRole ? `${fixedRole.toLowerCase()}s` : "Users"}</h2>
      {err && <p className="error">{err}</p>}
      <div className="inline">
        {!fixedRole && (
          <SelectInput aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option><option>CUSTOMER</option><option>RIDER</option><option>ADMIN</option>
          </SelectInput>
        )}
        <SelectInput aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option><option>ACTIVE</option><option>INACTIVE</option><option>SUSPENDED</option>
        </SelectInput>
      </div>
      {loading ? <SkeletonList /> : items.length === 0 ? (
        <EmptyState icon={Users} title="No users found" hint="Try a different filter." />
      ) : items.map((u) => (
        <div key={u.id} className="row">
          <span>#{u.id} {u.name} · {u.email}</span>
          <span>
            <StatusBadge value={u.role} />{" "}
            {u.status === "INACTIVE"
              ? <span className="badge b-amber">Pending approval</span>
              : <StatusBadge value={u.status} />}{" "}
            {u.role === "RIDER" && <StatusBadge value={u.availability} />}{" "}
            {u.status === "INACTIVE"
              ? <Button size="sm" onClick={() => setTarget({ id: u.id, name: u.name, status: "ACTIVE", from: "INACTIVE" })}>Approve</Button>
              : u.status === "SUSPENDED"
                ? <Button size="sm" onClick={() => setTarget({ id: u.id, name: u.name, status: "ACTIVE", from: u.status })}>Activate</Button>
                : <Button size="sm" onClick={() => setTarget({ id: u.id, name: u.name, status: "SUSPENDED", from: u.status })}>Suspend</Button>}
          </span>
        </div>
      ))}
      <ConfirmModal open={!!target} title={`${target?.status === "SUSPENDED" ? "Suspend" : target?.from === "INACTIVE" ? "Approve" : "Activate"} ${target?.name}?`}
        message={target?.status === "SUSPENDED"
          ? "They won't be able to log in until reactivated."
          : target?.from === "INACTIVE"
            ? "They'll be able to log in and start working."
            : "They'll be able to log in again."}
        confirmLabel={target?.status === "SUSPENDED" ? "Suspend" : target?.from === "INACTIVE" ? "Approve" : "Activate"} danger={target?.status === "SUSPENDED"}
        onConfirm={applyStatus} onCancel={() => !saving && setTarget(null)} />
      {saving && <p className="muted small"><Spinner dark /> Saving…</p>}
    </div>
  );
}
