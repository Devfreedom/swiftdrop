// Dashboard stat card with an icon. Pass `to` to make it a link.
import { Link } from "react-router-dom";

export default function StatCard({ icon: Icon, value, label, to }) {
  const body = (
    <>
      <span className="stat-ico">{Icon && <Icon size={22} />}</span>
      <span><b>{value}</b><span>{label}</span></span>
    </>
  );
  return to ? <Link className="stat" to={to}>{body}</Link> : <div className="stat">{body}</div>;
}
