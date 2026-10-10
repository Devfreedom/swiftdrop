// Kit PageHeader: page title + optional subtitle + action slot.
export default function PageHeader({ title, sub, actions }) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
