// Login: any role. Redirects to the role home on success.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, roleHome } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import PasswordInput from "../components/PasswordInput";
import { Spinner } from "../components/Feedback";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const v = {};
    if (!email.trim()) v.email = "Email is required.";
    else if (!email.includes("@")) v.email = "Enter a valid email address.";
    if (!password) v.password = "Password is required.";
    setErrs(v);
    if (Object.keys(v).length) return;
    setErr("");
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
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
          <p>Door-to-door delivery, tracked end to end.</p>
          <ul>
            <li>📦 Request a pickup in seconds</li>
            <li>🛵 Live rider assignment & tracking</li>
            <li>💳 Cash, card or transfer</li>
          </ul>
        </div>
        <div className="auth-form">
          <h2>Welcome back</h2>
          <p className="muted small">Log in to manage your deliveries.</p>
          {err && <p className="error">{err}</p>}
          <form onSubmit={submit} className="form" noValidate>
            <label>Email
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" aria-invalid={!!errs.email} />
            </label>
            {errs.email && <p className="field-error">{errs.email}</p>}
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!errs.password} />
            {errs.password && <p className="field-error">{errs.password}</p>}
            <button className="btn primary" disabled={busy}>
              {busy && <Spinner />} {busy ? "Signing in…" : "Login"}
            </button>
          </form>
          <p className="muted small">No account? <Link to="/register">Register as customer</Link></p>
          <p className="muted small">Demo: admin@demo.local · efua@demo.local · ama@demo.local (Password123!)</p>
        </div>
      </div>
    </div>
  );
}
