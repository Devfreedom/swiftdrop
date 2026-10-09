// App shell: dark sidebar for logged-in users, slim bar for guests.
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "./StatusBadge";

const LINKS = {
  CUSTOMER: [
    ["/customer", "Dashboard", "📊"], ["/customer/deliveries", "My deliveries", "📦"],
    ["/customer/create", "New delivery", "＋"], ["/customer/payments", "Payments", "💳"],
    ["/profile", "Profile", "👤"],
  ],
  RIDER: [
    ["/rider", "Dashboard", "📊"], ["/rider/available", "Open jobs", "🟢"],
    ["/rider/assigned", "My jobs", "🛵"], ["/rider/history", "History", "📜"],
    ["/profile", "Profile", "👤"],
  ],
  ADMIN: [
    ["/admin", "Dashboard", "📊"], ["/admin/deliveries", "Deliveries", "📦"],
    ["/admin/users", "Users", "👥"], ["/admin/riders", "Riders", "🛵"],
    ["/admin/payments", "Payments", "💳"], ["/profile", "Profile", "👤"],
  ],
};

const EXACT = ["/customer", "/rider", "/admin"]; // dashboards match exactly

function initials(name) {
  return (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  // Guests get a simple top bar (login / register screens).
  if (!user) {
    return (
      <div>
        <header className="topbar">
          <Link to="/" className="brand" style={{ color: "var(--ink)" }}>
            <span className="logo">🚚</span> SwiftDrop
          </Link>
          <div className="top-right">
            <Link to="/login" className="btn ghost">Login</Link>
            <Link to="/register" className="btn primary">Sign up</Link>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </div>
    );
  }

  const first = user.name.split(" ")[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="logo">🚚</span>
          <span>SwiftDrop<small>Delivery Platform</small></span>
        </Link>
        <nav className="side-nav">
          {(LINKS[user.role] || []).map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={EXACT.includes(to)}
              className={({ isActive }) => `side-link${isActive ? " active" : ""}`}>
              <span className="ico">{icon}</span> {label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className="user-chip">
            <span className="avatar">{initials(user.name)}</span>
            <span>{user.name}<small>{user.email}</small></span>
          </div>
          <button className="btn ghost" onClick={() => { logout(); nav("/login"); }}>Logout</button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <span className="hello">Hello, {first} 👋</span>
          <span className="muted small">{today}</span>
          <div className="top-right"><StatusBadge value={user.role} /></div>
        </header>
        <main className="wrap">{children}</main>
      </div>
    </div>
  );
}
