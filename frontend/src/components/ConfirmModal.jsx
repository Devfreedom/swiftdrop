// Confirmation modal for destructive actions (cancel, refund, suspend).
import { useEffect, useRef } from "react";

export default function ConfirmModal({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel, danger = true }) {
  const btnRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    btnRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>Keep it</button>
          <button ref={btnRef} className={`btn ${danger ? "danger" : "primary"}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
