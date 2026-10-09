// Shared auth fields: label + left icon + input, coral focus, inline errors.
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export function TextField({ label, icon: Icon, error, ...props }) {
  return (
    <div className="field">
      <label>
        <span className="lbl">{label}</span>
        <span className="input-wrap">
          {Icon && <Icon size={18} className="lead" />}
          <input {...props} aria-invalid={!!error} />
        </span>
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function SelectField({ label, icon: Icon, error, children, ...props }) {
  return (
    <div className="field">
      <label>
        <span className="lbl">{label}</span>
        <span className="input-wrap">
          {Icon && <Icon size={18} className="lead" />}
          <select {...props} aria-invalid={!!error}>{children}</select>
        </span>
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function PasswordInput({ value, onChange, label = "Password", error, hint, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label>
        <span className="lbl">{label}</span>
        <span className="input-wrap">
          <Lock size={18} className="lead" />
          <input type={show ? "text" : "password"} value={value} onChange={onChange}
            className="with-eye" aria-invalid={!!error} {...props} />
          <button type="button" className="eye-btn" onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
      </label>
      {hint}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

// Tiny strength meter: length + character variety → 0..4.
export function strengthOf(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
export const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
export const STRENGTH_COLORS = ["", "#DC2626", "#EA580C", "#15803d", "#0F172A"];
