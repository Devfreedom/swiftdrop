// Kit Dropdown: button-anchored menu. Escape closes, outside click closes,
// arrow keys move between items. Items: [{ id, label, icon?, disabled?, onSelect? }].
import { useEffect, useRef, useState } from "react";

export default function Dropdown({ label, children: trigger, items, align = "right" }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  function onMenuKey(e) {
    const idx = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      const next = (idx + dir + items.length) % items.length;
      itemRefs.current[next]?.focus();
    }
  }

  return (
    <div className="dropdown" ref={boxRef}>
      <span onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        {trigger}
      </span>
      {open && (
        <>
          <div className="dropdown-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="dropdown-menu" role="menu" aria-label={label}
            style={align === "left" ? { right: "auto", left: 0 } : undefined}
            onKeyDown={onMenuKey}
          >
            {items.map((item, i) => (
              <button
                key={item.id}
                ref={(el) => { itemRefs.current[i] = el; }}
                role="menuitem"
                className="dropdown-item"
                disabled={item.disabled}
                onClick={() => { setOpen(false); item.onSelect?.(item.id); }}
              >
                {item.icon && <item.icon size={16} aria-hidden="true" />}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
