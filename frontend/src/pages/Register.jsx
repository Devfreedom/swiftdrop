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
    <div className="card narrow">
      <h2>Create customer account</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={submit} className="form">
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <PasswordInput label="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn primary" disabled={busy}>{busy ? "Creating…" : "Register"}</button>
      </form>
      <p className="muted small">Have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
