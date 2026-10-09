// Own profile: GET/PUT /me. Email/role/status are admin-managed.
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import StatusBadge from "../components/StatusBadge";
import { CenterLoad, Spinner } from "../components/Feedback";

export default function Profile() {
  const { setUser } = useAuth();
  const toast = useToast();
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/me").then((d) => {
      setMe(d.user);
      setName(d.user.name || "");
      setPhone(d.user.phone || "");
    }).catch((e) => setErr(e.message));
  }, []);

  async function save(e) {
    e.preventDefault();
    const v = {};
    if (!name.trim()) v.name = "Name can't be empty.";
    setErrs(v);
    if (Object.keys(v).length) return;
    setErr("");
    setBusy(true);
    try {
      const d = await api("/me", { method: "PUT", body: { name: name.trim(), phone } });
      setMe(d.user);
      setUser(d.user);
      toast.success("Profile saved.");
    } catch (e2) {
      setErr(e2.message);
      toast.error(e2.message);
    } finally {
      setBusy(false);
    }
  }
  if (err && !me) return <p className="error">{err}</p>;
  if (!me) return <CenterLoad text="Loading profile…" />;
  return (
    <div className="card narrow">
      <h2><UserRound size={22} style={{ verticalAlign: "-4px" }} /> Profile</h2>
      <p>{me.email} · <StatusBadge value={me.role} /> <StatusBadge value={me.status} /></p>
      {me.role === "RIDER" && <p>Availability: <StatusBadge value={me.availability} /></p>}
      {err && <p className="error">{err}</p>}
      <form onSubmit={save} className="form" noValidate>
        <label>Name
          <input value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errs.name} />
        </label>
        {errs.name && <p className="field-error">{errs.name}</p>}
        <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        <button className="btn primary" disabled={busy}>
          {busy && <Spinner />} {busy ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
