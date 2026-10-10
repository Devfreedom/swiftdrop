// Table that turns into stacked cards under 768px.
// columns: [{ key, label }], rows: [{ ..., to? }], render(key, row) -> cell.
import { useNavigate } from "react-router-dom";

export default function DataTable({ columns, rows, render, empty }) {
  const nav = useNavigate();
  if (!rows.length) return empty || null;
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className={r.to ? "clickable" : ""}
              onClick={r.to ? () => nav(r.to) : undefined}>
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
