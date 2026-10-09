// Register: customers only (backend forces role=CUSTOMER).
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, roleHome } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const user = await register(name.trim(), email.trim(), password);
      nav(roleHome(user.role), { replace: true });
    } catch (e2) {
      setErr(e2.message);
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
          <form onSubmit={submit} className="form">
            <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ama Mensah" required /></label>
            <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
            <PasswordInput label="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn primary" disabled={busy}>{busy ? "Creating…" : "Register"}</button>
          </form>
          <p className="muted small">Have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
