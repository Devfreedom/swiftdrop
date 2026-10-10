// Shared shell for every role: white sidebar + 60px header with bell,
// name/role/avatar. Under 768px the sidebar becomes a hamburger drawer.
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard, History, LayoutGrid, LifeBuoy, LogOut, Menu,
  Package, PackageSearch, Plus, Settings, Truck, User, Users, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BRAND, SUPPORT_EMAIL } from "../brand";
import Notifications from "./Notifications";

const MENUS = {
  CUSTOMER: [
    ["/customer", "Dashboard", LayoutGrid], ["/customer/deliveries", "My Deliveries", Package],
    ["/customer/create", "New Delivery", Plus], ["/customer/payments", "Payments", CreditCard],
    ["/profile", "Profile", User], ["/settings", "Settings", Settings],
  ],
  RIDER: [
    ["/rider", "Dashboard", LayoutGrid], ["/rider/available", "Available Jobs", PackageSearch],
    ["/rider/assigned", "My Deliveries", Truck], ["/rider/history", "History", History],
    ["/profile", "Profile", User], ["/settings", "Settings", Settings],
  ],
  ADMIN: [
    ["/admin", "Dashboard", LayoutGrid], ["/admin/deliveries", "Deliveries", Package],
    ["/admin/riders", "Riders", Truck], ["/admin/users", "Users", Users],
    ["/admin/payments", "Payments", CreditCard], ["/settings", "Settings", Settings],
  ],
};

// Exact page titles; anything deeper falls back to the dashboard title.
const TITLES = {
  "/customer": "Customer Dashboard", "/customer/deliveries": "My Deliveries",
  "/customer/create": "New Delivery", "/customer/payments": "Payments",
  "/rider": "Rider Dashboard", "/rider/available": "Available Jobs",
  "/rider/assigned": "My Deliveries", "/rider/history": "History",
  "/admin": "Admin Dashboard", "/admin/deliveries": "Deliveries",
  "/admin/riders": "Riders", "/admin/users": "Users",
  "/admin/payments": "Payments", "/profile": "Profile", "/settings": "Settings",
};

const EXACT = ["/customer", "/rider", "/admin"]; // dashboards match exactly

function initials(name) {
  return (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function Logo() {
  return (
    <Link to="/" className="brand">
      <span className="brand-ico"><Truck size={20} aria-hidden="true" /></span>
      <span className="brand-name">{BRAND}</span>
    </Link>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [drawer, setDrawer] = useState(false);
  const out = () => { logout(); nav("/login"); };

  // Auth pages get the dark gradient screen with no chrome.
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
  // "/" renders full-bleed: Landing owns its own sticky navbar.
  if (!user) {
    if (loc.pathname === "/") return <main>{children}</main>;
    return (
      <div>
        <header className="app-header">
          <Logo />
          <div className="header-right">
            <Link to="/login" className="btn ghost">Login</Link>
            <Link to="/register" className="btn primary">Sign up</Link>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </div>
    );
  }

  const links = MENUS[user.role] || [];
  const title = TITLES[loc.pathname] || TITLES[`/${user.role.toLowerCase()}`] || "Dashboard";
  const menu = (
    <>
      <nav className="side-nav" aria-label={`${user.role} menu`}>
        {links.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end={EXACT.includes(to)} onClick={() => setDrawer(false)}
            className={({ isActive }) => `side-link${isActive ? " active" : ""}`}>
            <Icon size={18} aria-hidden="true" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="support-card">
        <p><strong>Need help?</strong></p>
        <p>Contact our support team for assistance.</p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>Contact Support</a>
      </div>
    </>
  );

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Sidebar">
        <Logo />
        {menu}
      </aside>
      {drawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(false)} aria-hidden="true" />
          <aside className="sidebar drawer" aria-label="Menu">
            <div className="drawer-head">
              <Logo />
              <button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close menu">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            {menu}
          </aside>
        </>
      )}
      <div className="main">
        <header className="app-header">
          <button className="icon-btn menu-btn" onClick={() => setDrawer(true)} aria-label="Open menu">
            <Menu size={20} aria-hidden="true" />
          </button>
          <h1 className="page-title">{title}</h1>
          <div className="header-right">
            <Notifications />
            <span className="divider-v" aria-hidden="true" />
            <span className="header-user">
              <strong>{user.name}</strong>
              <small>{user.role.charAt(0) + user.role.slice(1).toLowerCase()}</small>
            </span>
            <span className="avatar" aria-hidden="true">{initials(user.name)}</span>
            <button className="icon-btn" onClick={out} aria-label="Log out">
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </div>
    </div>
  );
}
