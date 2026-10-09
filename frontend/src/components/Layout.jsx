// App shell: sidebar for riders/admins, top navbar for customers, slim bar for guests.
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  History, LayoutDashboard, LogOut, Menu, Package,
  PackageSearch, Plus, Truck, User, Users, Wallet, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BRAND } from "../brand";
import StatusBadge from "./StatusBadge";

const LINKS = {
  CUSTOMER: [
    ["/customer", "Dashboard", LayoutDashboard], ["/customer/deliveries", "My deliveries", Package],
    ["/customer/create", "New delivery", Plus], ["/customer/payments", "Payments", Wallet],
    ["/profile", "Profile", User],
  ],
  RIDER: [
    ["/rider", "Dashboard", LayoutDashboard], ["/rider/available", "Open jobs", PackageSearch],
    ["/rider/assigned", "My jobs", Truck], ["/rider/history", "History", History],
    ["/profile", "Profile", User],
  ],
  ADMIN: [
    ["/admin", "Dashboard", LayoutDashboard], ["/admin/deliveries", "Deliveries", Package],
    ["/admin/users", "Users", Users], ["/admin/riders", "Riders", Truck],
    ["/admin/payments", "Payments", Wallet], ["/profile", "Profile", User],
  ],
};

const EXACT = ["/customer", "/rider", "/admin"]; // dashboards match exactly

function initials(name) {
  return (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function Brand({ dark = false }) {
  return (
    <Link to="/" className="brand" style={dark ? { color: "var(--ink)" } : undefined}>
      <span className="logo">🚚</span>
      <span>{BRAND}<small>Delivery Platform</small></span>
    </Link>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const out = () => { logout(); nav("/login"); };

  // Auth pages get the dark gradient screen with no top bar.
  if (!user && (loc.pathname === "/login" || loc.pathname === "/register")) {
    return (
      <div className="auth-screen">
        <Link to="/" className="auth-brand">
          <span className="authx-logo"><Truck size={20} /></span> {BRAND}
        </Link>
        <main>{children}</main>
      </div>
    );
  }

  // Guests get a simple top bar (landing screen).
  if (!user) {
    return (
      <div>
        <header className="topbar">
          <Brand dark />
          <div className="top-right">
            <Link to="/login" className="btn ghost">Login</Link>
            <Link to="/register" className="btn primary">Sign up</Link>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </div>
    );
  }

  const links = LINKS[user.role] || [];
  const first = user.name.split(" ")[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

  // Customers get a top navbar.
  if (user.role === "CUSTOMER") {
    return (
      <div>
        <header className="topbar">
          <Brand dark />
          <nav className={`cust-nav${open ? " open" : ""}`} aria-label="Customer">
            {links.map(([to, label, Icon]) => (
              <NavLink key={to} to={to} end={EXACT.includes(to)} onClick={() => setOpen(false)}
                className={({ isActive }) => `cust-link${isActive ? " active" : ""}`}>
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="top-right">
            <StatusBadge value={user.role} />
            <button className="btn ghost small" onClick={out} aria-label="Logout">
              <LogOut size={16} />
            </button>
            <button className="btn ghost menu-btn" onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </div>
    );
  }

  // Riders and admins get a sidebar.
  return (
    <div className="shell">
      <aside className="sidebar">
        <Brand />
        <nav className="side-nav" aria-label={`${user.role} menu`}>
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={EXACT.includes(to)}
              className={({ isActive }) => `side-link${isActive ? " active" : ""}`}>
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className="user-chip">
            <span className="avatar">{initials(user.name)}</span>
            <span>{user.name}<small>{user.email}</small></span>
          </div>
          <button className="btn ghost" onClick={out} aria-label="Logout">
            <LogOut size={16} /> Logout
          </button>
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
