// Password field with a show/hide toggle.
import { useState } from "react";

export default function PasswordInput({ value, onChange, label = "Password", required = true }) {
  const [show, setShow] = useState(false);
  return (
    <label>{label}
      <span className="pw-wrap">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
        />
        <button
          type="button"
          className="btn small ghost"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}
