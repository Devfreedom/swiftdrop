// Own profile: GET/PUT /me. Email/role/status are admin-managed.
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function Profile() {
  const { setUser } = useAuth();
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/me").then((d) => {
      setMe(d.user);
      setName(d.user.name || "");
      setPhone(d.user.phone || "");
    }).catch((e) => setErr(e.message));
  }, []);

  async function save(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      const d = await api("/me", { method: "PUT", body: { name, phone } });
      setMe(d.user);
      setUser(d.user);
      setMsg("Saved.");
    } catch (e2) {
      setErr(e2.message);
    }
  }
  if (err && !me) return <p className="error">{err}</p>;
  if (!me) return <p className="muted">Loading…</p>;
  return (
    <div className="card narrow">
      <h2>Profile</h2>
      <p>{me.email} · <StatusBadge value={me.role} /> <StatusBadge value={me.status} /></p>
      {me.role === "RIDER" && <p>Availability: <StatusBadge value={me.availability} /></p>}
      {msg && <p className="ok">{msg}</p>}
      {err && <p className="error">{err}</p>}
      <form onSubmit={save} className="form">
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        <button className="btn primary">Save</button>
      </form>
    </div>
  );
}
