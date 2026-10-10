// Table that turns into stacked cards under 768px.
// columns: [{ key, label }], rows: [{ ..., to? }], render(key, row) -> cell.
// Rows with `to` are keyboard accessible: focusable, Enter/Space to open.
import { useNavigate } from "react-router-dom";

export default function DataTable({ columns, rows, render, empty }) {
  const nav = useNavigate();
  if (!rows.length) return empty || null;
  const onKey = (to) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      nav(to);
    }
  };
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className={r.to ? "clickable" : ""}
              onClick={r.to ? () => nav(r.to) : undefined}
              onKeyDown={r.to ? onKey(r.to) : undefined}
              tabIndex={r.to ? 0 : undefined}
              role={r.to ? "link" : undefined}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.label}>{render(c.key, r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
