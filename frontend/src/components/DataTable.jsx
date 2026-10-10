// DataTable: stacked cards under 768px, keyboard-accessible rows.
// Opt-in extras (all off by default, so existing uses keep working):
//   searchable — filter box over row values (or `searchKeys`)
//   sortable   — clickable headers; per-column via column.sortable + column.value(row)
//   pageSize   — paginated with Prev/Next pager
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

const primitives = (row, keys) =>
  (keys || Object.keys(row))
    .map((k) => {
      const v = row[k];
      return v == null || typeof v === "object" ? "" : String(v);
    })
    .join(" ")
    .toLowerCase();

const cellValue = (col, row) =>
  typeof col.value === "function" ? col.value(row) : row[col.key];

function compare(a, b) {
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  const ad = Date.parse(a);
  const bd = Date.parse(b);
  if (!Number.isNaN(ad) && !Number.isNaN(bd) && (typeof a === "string" || typeof b === "string")) return ad - bd;
  return String(a).localeCompare(String(b));
}

export default function DataTable({
  columns, rows, render, empty,
  searchable = false, searchKeys, searchLabel = "Search",
  sortable = false, pageSize = 0,
}) {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const [page, setPage] = useState(1);

  const showSearch = searchable;
  const showPager = pageSize > 0;

  useEffect(() => { setPage(1); }, [query, rows, pageSize]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!showSearch || !q) return rows;
    return rows.filter((r) => primitives(r, searchKeys).includes(q));
  }, [rows, query, showSearch, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => compare(cellValue(col, a), cellValue(col, b)) * sort.dir);
  }, [filtered, sort, columns]);

  const pageCount = showPager ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const safePage = Math.min(page, pageCount);
  const visible = showPager ? sorted.slice((safePage - 1) * pageSize, safePage * pageSize) : sorted;

  const toggleSort = (col) => {
    const enabled = sortable && col.sortable !== false;
    if (!enabled) return;
    setSort((s) =>
      s.key !== col.key ? { key: col.key, dir: 1 } : s.dir === 1 ? { key: col.key, dir: -1 } : { key: null, dir: 1 }
    );
  };

  const onKey = (to) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      nav(to);
    }
  };

  if (!rows.length) return empty || null;

  return (
    <div className="data-table">
      {showSearch && (
        <div className="dt-toolbar">
          <input
            type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={searchLabel} aria-label={searchLabel}
          />
        </div>
      )}
      <table>
        <thead>
          <tr>
            {columns.map((c) => {
              const enabled = sortable && c.sortable !== false;
              const active = sort.key === c.key;
              return (
                <th key={c.key} aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
                  {enabled ? (
                    <button type="button" className="th-sort" onClick={() => toggleSort(c)}
                      aria-label={`Sort by ${c.label}`}>
                      {c.label}
                      {active
                        ? (sort.dir === 1 ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />)
                        : <ArrowUpDown size={13} aria-hidden="true" />}
                    </button>
                  ) : c.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {visible.map((r, i) => (
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
      {showPager && (
        <div className="dt-pager">
          <span role="status">Page {safePage} of {pageCount} · {sorted.length} rows</span>
          <nav aria-label="Table pages">
            <button type="button" className="btn btn-sm" disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)} aria-label="Previous page">
              <ChevronLeft size={15} aria-hidden="true" /> Prev
            </button>
            <button type="button" className="btn btn-sm" disabled={safePage >= pageCount}
              onClick={() => setPage(safePage + 1)} aria-label="Next page">
              Next <ChevronRight size={15} aria-hidden="true" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
