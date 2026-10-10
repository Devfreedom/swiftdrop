// Settings for every role: account info + change password form.
import { useEffect, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { api } from "../api/client";
import { useToast } from "../components/Toast";
import StatusBadge from "../components/StatusBadge";
import { PasswordInput } from "../components/AuthFields";
import { CenterLoad, Spinner } from "../components/Feedback";

export default function Settings() {
  const toast = useToast();
  const [me, setMe] = useState(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/me").then((d) => setMe(d.user)).catch((e) => setErr(e.message));
  }, []);

  async function submit(e) {
    e.preventDefault();
    const v = {};
    if (!current) v.current = "Enter your current password.";
    if (next.length < 8) v.next = "New password needs at least 8 characters.";
    if (confirm !== next) v.confirm = "Passwords do not match.";
    setErrs(v);
    if (Object.keys(v).length) return;
    setErr("");
    setBusy(true);
    try {
      await api("/me/password", { method: "PATCH", body: { currentPassword: current, newPassword: next } });
      setCurrent(""); setNext(""); setConfirm("");
      toast.success("Password changed.");
    } catch (e2) {
      setErr(e2.message);
      toast.error(e2.message);
    } finally {
      setBusy(false);
    }
  }

  if (err && !me) return <p className="error">{err}</p>;
  if (!me) return <CenterLoad text="Loading settings…" />;
  return (
    <div>
      <h2><SettingsIcon size={22} style={{ verticalAlign: "-4px" }} aria-hidden="true" /> Settings</h2>
      <div className="card narrow" style={{ margin: "0 0 16px" }}>
        <h3>Account</h3>
        <p><strong>{me.name}</strong></p>
        <p className="muted">{me.email}</p>
        <p><StatusBadge value={me.role} /> <StatusBadge value={me.status} /></p>
      </div>
      <div className="card narrow" style={{ margin: 0 }}>
        <h3>Change password</h3>
        {err && <p className="error">{err}</p>}
        <form onSubmit={submit} className="form" noValidate>
          <PasswordInput label="Current password" value={current}
            onChange={(e) => setCurrent(e.target.value)} error={errs.current} />
          <PasswordInput label="New password" value={next}
            onChange={(e) => setNext(e.target.value)} placeholder="At least 8 characters"
            error={errs.next} />
          <PasswordInput label="Confirm new password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} error={errs.confirm} />
          <button className="btn primary" disabled={busy}>
            {busy && <Spinner />} {busy ? "Saving…" : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
