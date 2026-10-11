// Register: CUSTOMER or RIDER via toggle. Riders need admin approval.
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Bike, Car, Mail, Package, Phone, Truck, User } from "lucide-react";
import { useAuth, roleHome } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { BRAND } from "../brand";
import { PasswordInput, SelectField, STRENGTH_COLORS, STRENGTH_LABELS, TextField, strengthOf } from "../components/AuthFields";
import { Spinner } from "../components/Feedback";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const digits = (s) => s.replace(/\D/g, "");

export default function Register() {
  const { register, logout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  // Landing CTAs link here with ?role=rider to preselect the Rider tab.
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get("role") === "rider" ? "RIDER" : "CUSTOMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState("Bike");
  const [plateNumber, setPlateNumber] = useState("");
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);

  const strength = strengthOf(password);

  async function submit(e) {
    e.preventDefault();
    const v = {};
    if (!name.trim()) v.name = "Full name is required.";
    if (!email.trim()) v.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) v.email = "Enter a valid email address.";
    if (!/^0\d{10}$/.test(digits(phone))) v.phone = "Enter a valid 11-digit Nigerian phone number.";
    if (password.length < 8) v.password = "Password needs at least 8 characters.";
    if (role === "RIDER" && !vehicleType) v.vehicleType = "Choose a vehicle type.";
    setErrs(v);
    if (Object.keys(v).length) return;
    setErr("");
    setBusy(true);
    try {
      const user = await register({
        name: name.trim(), email: email.trim(), password,
        phone: digits(phone), role,
        ...(role === "RIDER" && { vehicleType, plateNumber: plateNumber.trim() || undefined }),
      });
      if (user.status !== "ACTIVE") {
        logout(); // pending riders stay logged out until approved
        setPending(true);
      } else {
        toast.success(`Account created — welcome, ${user.name.split(" ")[0]}!`);
        nav(roleHome(user.role), { replace: true });
      }
    } catch (e2) {
      setErr(e2.message);
      toast.error(e2.message);
    } finally {
      setBusy(false);
    }
  }

  // Friendly holding screen for riders awaiting approval.
  if (pending) {
    return (
      <div className="authx-card">
        <Link to="/" className="authx-logo" aria-label={`${BRAND} home`}><Truck size={26} /></Link>
        <h2 className="authx-title">Join {BRAND}</h2>
        <p className="ok text-left mt-4">
          Account created. An admin must approve your account before you can log in.
        </p>
        <Link to="/login" className="btn-auth mt-4">
          Go to Sign in <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className={role === "RIDER" ? "authx-card wide" : "authx-card"}>
      <Link to="/" className="authx-logo" aria-label={`${BRAND} home`}><Truck size={26} /></Link>
      <h2 className="authx-title">Join {BRAND}</h2>
      <p className="authx-sub">Create your account to get started.</p>
      <div className="seg" role="group" aria-label="Account type">
        <button type="button" className="seg-btn" aria-pressed={role === "CUSTOMER"}
          onClick={() => setRole("CUSTOMER")}>
          <Package size={17} /> Customer
        </button>
        <button type="button" className="seg-btn" aria-pressed={role === "RIDER"}
          onClick={() => setRole("RIDER")}>
          <Bike size={17} /> Rider
        </button>
      </div>
      {err && <p className="error text-left mt-4">{err}</p>}
      <form onSubmit={submit} className={role === "RIDER" ? "authx-form grid" : "authx-form"} noValidate>
        <TextField label="Full Name" icon={User} placeholder="Ama Mensah"
          value={name} onChange={(e) => setName(e.target.value)} error={errs.name} />
        <TextField label="Email Address" icon={Mail} placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} error={errs.email} />
        <TextField label="Phone Number" icon={Phone} placeholder="0803 000 0000"
          value={phone} onChange={(e) => setPhone(e.target.value)} error={errs.phone} />
        <PasswordInput label="Create Password" value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters"
          error={errs.password}
          hint={password ? (
            <p className="pw-hint" style={{ color: STRENGTH_COLORS[strength] }}>
              Password strength: {STRENGTH_LABELS[strength]}
            </p>
          ) : null} />
        {role === "RIDER" && (
          <>
            <SelectField label="Vehicle type" icon={Car} value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)} error={errs.vehicleType}>
              <option>Bike</option><option>Car</option><option>Van</option>
            </SelectField>
            <TextField label="Plate number (optional)" icon={Car} placeholder="ABC-123-XY"
              value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
          </>
        )}
        <button className="btn-auth" disabled={busy}>
          {busy ? <><Spinner /> Creating…</> : <>Create {role === "RIDER" ? "Rider" : "Customer"} Account <ArrowRight size={18} /></>}
        </button>
      </form>
      <p className="authx-foot">Already have an account? <Link to="/login">Sign in</Link></p>
    </div>
  );
}
