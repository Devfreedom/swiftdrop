// Top nav: links depend on the logged-in role.
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = {
  CUSTOMER: [
    ["/customer", "Dashboard"], ["/customer/deliveries", "My deliveries"],
    ["/customer/create", "New delivery"], ["/customer/payments", "Payments"],
    ["/profile", "Profile"],
  ],
  RIDER: [
    ["/rider", "Dashboard"], ["/rider/available", "Open jobs"],
    ["/rider/assigned", "My jobs"], ["/rider/history", "History"],
    ["/profile", "Profile"],
  ],
  ADMIN: [
    ["/admin", "Dashboard"], ["/admin/deliveries", "Deliveries"],
    ["/admin/users", "Users"], ["/admin/riders", "Riders"],
    ["/admin/payments", "Payments"], ["/profile", "Profile"],
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const links = (user && LINKS[user.role]) || [];
  return (
    <div>
      <header className="topbar">
        <Link to="/" className="brand">🚚 Delivery Platform</Link>
        <nav className="nav">
          {links.map(([to, label]) => (
            <Link key={to} to={to}>{label}</Link>
          ))}
        </nav>
        <div className="top-right">
          {user ? (
            <>
              <span className="muted small">{user.name} · {user.role}</span>
              <button className="btn ghost" onClick={() => { logout(); nav("/login"); }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn">Login</Link>
          )}
        </div>
      </header>
      <main className="wrap">{children}</main>
    </div>
  );
}
