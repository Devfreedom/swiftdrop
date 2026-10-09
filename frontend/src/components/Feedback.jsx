// Loading + empty states used across list and detail pages.
import { Link } from "react-router-dom";

export const Spinner = ({ dark = false, large = false }) => (
  <span className={`spinner${dark ? " dark" : ""}${large ? " lg" : ""}`} aria-hidden="true" />
);

export function CenterLoad({ text = "Loading…" }) {
  return (
    <div className="center-load" role="status">
      <Spinner dark large />
      <span>{text}</span>
    </div>
  );
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 58, margin: "8px 0" }} />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint, actionTo, actionLabel }) {
  return (
    <div className="empty">
      <span className="empty-ico">{Icon && <Icon size={26} />}</span>
      <h4>{title}</h4>
      <p>{hint}</p>
      {actionTo && <Link to={actionTo} className="btn primary">{actionLabel}</Link>}
    </div>
  );
}
