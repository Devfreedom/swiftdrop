// Public landing page at "/": navbar, hero, how it works, roles, about, contact, footer.
// Logged-in redirect lives in App.jsx IndexRoute — this component is guests only.
import { useEffect, useState } from "react";
import {
  Bike, Check, CreditCard, Mail, MapPin, Menu, Package,
  Phone, ShieldCheck, Truck, UserCheck, X,
} from "lucide-react";
import { BRAND, SUPPORT_EMAIL, SUPPORT_PHONE } from "../brand";
import Button from "../ui/Button";

const NAV_LINKS = [
  ["#how", "How it works"],
  ["#roles", "For everyone"],
  ["#about", "About"],
  ["#contact", "Contact"],
];

const STEPS = [
  {
    icon: Package,
    title: "Request",
    text: "Tell us what to move and where. Pickup and drop-off in under a minute.",
  },
  {
    icon: UserCheck,
    title: "Rider assigned",
    text: "An admin confirms your request and assigns an available rider.",
  },
  {
    icon: Truck,
    title: "Picked up and in transit",
    text: "The rider picks up your parcel and you follow it live to the door.",
  },
  {
    icon: Check,
    title: "Delivered",
    text: "Signed, sealed, delivered at the doorstep.",
  },
];

const ROLES = [
  {
    icon: Package,
    title: "Customers",
    points: ["Create deliveries fast", "Pay cash, card or transfer", "Track progress live"],
  },
  {
    icon: Bike,
    title: "Riders",
    points: ["Accept open jobs", "Update status step by step", "Earn on every drop"],
  },
  {
    icon: ShieldCheck,
    title: "Admins",
    points: ["Assign riders", "Monitor every delivery", "Manage payments"],
  },
];

const YEAR = new Date().getFullYear();

export default function Landing() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = `${BRAND} — Deliveries made simple`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        `${BRAND} — request deliveries, track riders, and manage payments. Simple door-to-door delivery for customers, riders and admins.`
      );
    }
  }, []);

  return (
    <div className="lp">
      {/* 1. Sticky navbar */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <a href="#top" className="brand lp-brand">
            <span className="brand-ico"><Truck size={20} aria-hidden="true" /></span>
            <span className="brand-name">{BRAND}</span>
          </a>
          <nav className="lp-links" aria-label="Landing sections">
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </nav>
          <div className="lp-nav-cta">
            <Button to="/login" variant="ghost">Login</Button>
            <Button to="/register" variant="primary">Sign up</Button>
          </div>
          <button
            className="icon-btn lp-burger"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
        {open && (
          <nav className="lp-mobile" aria-label="Landing sections mobile">
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
            ))}
            <div className="lp-mobile-cta">
              <Button to="/login" variant="ghost" onClick={() => setOpen(false)}>Login</Button>
              <Button to="/register" variant="primary" onClick={() => setOpen(false)}>Sign up</Button>
            </div>
          </nav>
        )}
      </header>

      <main id="top">
        {/* 2. Hero */}
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <span className="badge b-purple">DELIVERY PLATFORM</span>
            <h1>Deliveries made <em>simple.</em></h1>
            <p>
              {BRAND} connects customers, riders and admins in one place —
              request a pickup and follow it to the doorstep.
            </p>
            <div className="hero-cta">
              <Button to="/register" variant="primary" size="lg">Get started</Button>
              <Button to="/login" size="lg">Login</Button>
            </div>
          </div>
          {/* CSS + lucide illustration only: static example tracker preview */}
          <div className="lp-art" aria-hidden="true">
            <div className="lp-art-card">
              <p className="lp-art-tag"><span className="badge b-purple">Example</span></p>
              <div className="lp-art-row">
                <span className="lp-art-ico"><Package size={18} /></span>
                <div>
                  <strong>Parcel picked up</strong>
                  <small>Osu Oxford St</small>
                </div>
                <span className="badge b-green"><Check size={12} /> Done</span>
              </div>
              <div className="lp-art-route">
                <span className="lp-dot" />
                <span className="lp-line" />
                <span className="lp-dot now"><Truck size={14} /></span>
                <span className="lp-line" />
                <span className="lp-dot" />
              </div>
              <div className="lp-art-row">
                <span className="lp-art-ico soft"><MapPin size={18} /></span>
                <div>
                  <strong>On the way</strong>
                  <small>Accra Mall · arriving soon</small>
                </div>
                <span className="badge b-cyan"><Truck size={12} /> Transit</span>
              </div>
              <div className="lp-art-foot">
                <span className="lp-art-ico soft"><CreditCard size={16} /></span>
                <small>Cash, card or transfer</small>
              </div>
            </div>
          </div>
        </section>

        {/* 3. How it works */}
        <section id="how" className="lp-section">
          <h2>How it works</h2>
          <p className="muted">Four steps from pickup to doorstep.</p>
          <div className="lp-grid3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="lp-card">
                <span className="stat-ico"><Icon size={22} aria-hidden="true" /></span>
                <span className="lp-step-n">Step {i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. For everyone */}
        <section id="roles" className="lp-section">
          <h2>For everyone</h2>
          <p className="muted">One system for customers, riders and admins.</p>
          <div className="lp-grid3">
            {ROLES.map(({ icon: Icon, title, points }) => (
              <div key={title} className="lp-card">
                <span className="stat-ico"><Icon size={22} aria-hidden="true" /></span>
                <h3>{title}</h3>
                <ul className="lp-list">
                  {points.map((p) => (
                    <li key={p}><Check size={15} aria-hidden="true" /> {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 5. About */}
        <section id="about" className="lp-section">
          <h2>About {BRAND}</h2>
          <div className="lp-card lp-wide">
            <p>
              {BRAND} is a delivery platform that brings customers, riders and
              admins together in one simple flow. Customers create delivery
              requests and pay their way, riders accept jobs and update each
              step of the journey, and admins assign riders, monitor progress
              and manage payments — so every parcel gets from pickup to
              doorstep without the back-and-forth.
            </p>
          </div>
        </section>

        {/* 6. Contact */}
        <section id="contact" className="lp-section">
          <h2>Contact</h2>
          <p className="muted">Need help? Reach our support team directly.</p>
          <div className="lp-card lp-wide lp-contact">
            <a className="lp-contact-row" href={`mailto:${SUPPORT_EMAIL}`}>
              <span className="stat-ico"><Mail size={20} aria-hidden="true" /></span>
              <span>
                <strong>Contact Support</strong>
                <small>{SUPPORT_EMAIL}</small>
              </span>
            </a>
            <a className="lp-contact-row" href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}>
              <span className="stat-ico"><Phone size={20} aria-hidden="true" /></span>
              <span>
                <strong>{SUPPORT_PHONE}</strong>
                <small>Mon–Sat, 8am–8pm</small>
              </span>
            </a>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="lp-footer">
        <span><strong>{BRAND}</strong> · © {YEAR}</span>
        <nav aria-label="Footer">
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
