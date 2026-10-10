// Kit fields: implicit-label wrapper + helper + inline error + leading icon.
// Invalid state wires aria-invalid + aria-describedby automatically.
import { useId } from "react";

export function Field({ label, hint, error, children }) {
  const hintId = useId();
  const errId = useId();
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      {children(hint ? hintId : undefined, error ? errId : undefined)}
      {hint && !error && <span className="field-hint" id={hintId}>{hint}</span>}
      {error && <span className="field-error" id={errId} role="alert">{error}</span>}
    </label>
  );
}

function described(hintId, errId) {
  const ids = [errId, hintId].filter(Boolean).join(" ");
  return ids ? { "aria-describedby": ids } : {};
}

export function TextInput({ label, hint, error, icon: Icon, ...props }) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(hintId, errId) => (
        <span className="control">
          {Icon && <Icon size={18} className="lead-icon" aria-hidden="true" />}
          <input aria-invalid={!!error} {...described(hintId, errId)} {...props} />
        </span>
      )}
    </Field>
  );
}

export function SelectInput({ label, hint, error, icon: Icon, children, ...props }) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(hintId, errId) => (
        <span className="control">
          {Icon && <Icon size={18} className="lead-icon" aria-hidden="true" />}
          <select aria-invalid={!!error} {...described(hintId, errId)} {...props}>{children}</select>
        </span>
      )}
    </Field>
  );
}

export function TextareaInput({ label, hint, error, ...props }) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(hintId, errId) => (
        <textarea aria-invalid={!!error} {...described(hintId, errId)} {...props} />
      )}
    </Field>
  );
}
