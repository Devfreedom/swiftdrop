// Kit Modal: focus trap, Escape to close, initial focus, focus restore,
// backdrop click to close (unless persistent). role="dialog" aria-modal.
import { useEffect, useRef } from "react";

export default function Modal({
  open, title, onClose, children, actions, wide = false, persistent = false,
}) {
  const dialogRef = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement;
    const dialog = dialogRef.current;
    // Initial focus: first focusable element.
    dialog?.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus();

    const onKey = (e) => {
      if (e.key === "Escape" && !persistent) { onClose(); return; }
      if (e.key !== "Tab" || !dialog) return;
      const focusables = [...dialog.querySelectorAll(
        "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])"
      )];
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prevFocus.current?.focus?.();
    };
  }, [open, onClose, persistent]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={persistent ? undefined : onClose}>
      <div
        ref={dialogRef}
        className={`modal${wide ? " modal-lg" : ""}`}
        role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        {children}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
