// Register: customers only (backend forces role=CUSTOMER).
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, roleHome } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import PasswordInput from "../components/PasswordInput";
import { Spinner } from "../components/Feedback";

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const v = {};
    if (!name.trim()) v.name = "Name is required.";
    if (!email.trim()) v.email = "Email is required.";
    else if (!email.includes("@")) v.email = "Enter a valid email address.";
    if (password.length < 6) v.password = "Password needs at least 6 characters.";
    setErrs(v);
    if (Object.keys(v).length) return;
    setErr("");
    setBusy(true);
    try {
      const user = await register(name.trim(), email.trim(), password);
      toast.success(`Account created — welcome, ${user.name.split(" ")[0]}!`);
      nav(roleHome(user.role), { replace: true });
    } catch (e2) {
      setErr(e2.message);
      toast.error(e2.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-side">
          <span className="logo lg">🚚</span>
          <h1>SwiftDrop</h1>
          <p>Create an account and send your first parcel today.</p>
          <ul>
            <li>⚡ Delivery requests in under a minute</li>
            <li>📍 Pickup-to-doorstep tracking</li>
            <li>🔒 Secure login & payments</li>
          </ul>
        </div>
        <div className="auth-form">
          <h2>Create account</h2>
          <p className="muted small">Join as a customer — it’s free.</p>
          {err && <p className="error">{err}</p>}
          <form onSubmit={submit} className="form" noValidate>
            <label>Name
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ama Mensah" aria-invalid={!!errs.name} />
            </label>
            {errs.name && <p className="field-error">{errs.name}</p>}
            <label>Email
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" aria-invalid={!!errs.email} />
            </label>
            {errs.email && <p className="field-error">{errs.email}</p>}
            <PasswordInput label="Password (min 6)" value={password}
              onChange={(e) => setPassword(e.target.value)} invalid={!!errs.password} />
            {errs.password && <p className="field-error">{errs.password}</p>}
            <button className="btn primary" disabled={busy}>
              {busy && <Spinner />} {busy ? "Creating…" : "Register"}
            </button>
          </form>
          <p className="muted small">Have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
