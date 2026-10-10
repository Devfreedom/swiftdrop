// Kit Tabs: roving focus with arrow keys, aria tab semantics.
// tabs: [{ id, label, disabled? }]. Controlled via value + onChange.
import { useRef } from "react";

export default function Tabs({ tabs, value, onChange, label = "Sections" }) {
  const refs = useRef([]);
  const current = tabs.findIndex((t) => t.id === value);

  function onKey(e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    let i = current;
    for (let n = 0; n < tabs.length; n++) {
      i = (i + dir + tabs.length) % tabs.length;
      if (!tabs[i].disabled) break;
    }
    refs.current[i]?.focus();
    onChange(tabs[i].id);
  }

  return (
    <div className="tabs" role="tablist" aria-label={label} onKeyDown={onKey}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => { refs.current[i] = el; }}
          role="tab"
          aria-selected={t.id === value}
          tabIndex={t.id === value ? 0 : -1}
          disabled={t.disabled}
          className="tab"
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
