// Login: shared by all roles, redirects by role. Dropline auth design.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Truck } from "lucide-react";
import { useAuth, roleHome } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { BRAND } from "../brand";
import { PasswordInput, TextField } from "../components/AuthFields";
import { Spinner } from "../components/Feedback";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

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
    else if (!EMAIL_RE.test(email.trim())) v.email = "Enter a valid email address.";
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
    <div className="authx-card">
      <div className="authx-logo"><Truck size={26} /></div>
      <h2 className="authx-title">Welcome back</h2>
      <p className="authx-sub">Sign in to continue.</p>
      {err && <p className="error" style={{ textAlign: "left", marginTop: 16 }}>{err}</p>}
      <form onSubmit={submit} className="authx-form" noValidate>
        <TextField label="Email Address" icon={Mail} placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} error={errs.email} />
        <div>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password" error={errs.password} />
          <div className="forgot-row">
            <button type="button" className="linklike"
              onClick={() => toast.success("Password reset isn't available yet — contact support.")}>
              Forgot password?
            </button>
          </div>
        </div>
        <button className="btn-coral" disabled={busy}>
          {busy ? <><Spinner /> Signing in…</> : <>Sign in <ArrowRight size={18} /></>}
        </button>
      </form>
      <p className="authx-foot">Don&apos;t have an account? <Link to="/register">Sign up</Link></p>
      <p className="authx-foot muted small" style={{ marginTop: 8 }}>{BRAND} delivery platform</p>
    </div>
  );
}
