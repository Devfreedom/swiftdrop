// Login: any role. Redirects to the role home on success.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, roleHome } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      nav(roleHome(user.role), { replace: true });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="card narrow">
      <h2>Login</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={submit} className="form">
        <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn primary" disabled={busy}>{busy ? "Signing in…" : "Login"}</button>
      </form>
      <p className="muted small">No account? <Link to="/register">Register as customer</Link></p>
      <p className="muted small">Demo: admin@demo.local · efua@demo.local · ama@demo.local (Password123!)</p>
    </div>
  );
}
