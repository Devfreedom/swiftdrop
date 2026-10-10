// Loading, skeleton, empty and error states used across the app.
import { AlertTriangle } from "lucide-react";
import Button from "../ui/Button";

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

export function Skeleton({ variant = "row" }) {
  return <div className={`skeleton skel-${variant}`} aria-hidden="true" />;
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} />
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
      {actionTo && <Button variant="primary" to={actionTo}>{actionLabel}</Button>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", hint = "Please try again.", onRetry, retryLabel = "Retry" }) {
  return (
    <div className="empty error-state" role="alert">
      <span className="empty-ico"><AlertTriangle size={26} aria-hidden="true" /></span>
      <h4>{title}</h4>
      <p>{hint}</p>
      {onRetry && <Button variant="primary" onClick={onRetry}>{retryLabel}</Button>}
    </div>
  );
}
