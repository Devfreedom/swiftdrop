// Kit Button: primary / secondary / ghost / danger × sm / md / lg.
// Icon-only requires aria-label. `loading` shows a spinner and blocks input.
import { Link } from "react-router-dom";

const VARIANTS = { primary: "btn-primary", secondary: "btn-secondary", ghost: "btn-ghost", danger: "btn-danger" };
const SIZES = { sm: "btn-sm", md: "", lg: "btn-lg" };

export default function Button({
  variant = "secondary", size = "md", iconOnly = false,
  loading = false, disabled = false, to, children, className = "", ...props
}) {
  const cls = `btn ${VARIANTS[variant] || ""} ${SIZES[size] || ""}${iconOnly ? " btn-icon" : ""}${loading ? " is-loading" : ""} ${className}`.trim().replace(/\s+/g, " ");
  const body = (
    <>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} aria-disabled={disabled || loading} aria-busy={loading} {...props}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} disabled={disabled || loading} aria-busy={loading} {...props}>
      {body}
    </button>
  );
}
