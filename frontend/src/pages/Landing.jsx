// Public landing page at "/": viewable by everyone (guests + logged-in users).
// Auth-aware via useAuth: logged-out users see Login/Sign up + register CTAs;
// logged-in users see "Go to dashboard" + avatar, and customers get address
// prefill straight into New Delivery. Numbers from GET /api/stats (hidden on
// failure); no invented figures, no stock photos, all copy original.
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Box, Check, CreditCard, FileText, Gift, Lock,
  Mail, MapPin, Menu, Phone, ShieldCheck, Shirt, ShoppingBasket,
  Smartphone, Truck, UserCheck, Wallet, X, Plus,
} from "lucide-react";
import { BRAND, SUPPORT_EMAIL, SUPPORT_PHONE } from "../brand";
import { api } from "../api/client";
import { roleHome, useAuth } from "../context/AuthContext";
import Stepper from "../components/Stepper";
import StatusBadge from "../components/StatusBadge";
import "../landing.css";

const REDUCED =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const NAV_LINKS = [
  ["#how", "How it works"],
  ["#customers", "For customers"],
  ["#riders", "For riders"],
  ["#about", "About"],
  ["#contact", "Contact"],
];

const CATEGORIES = [
  { icon: FileText, tile: "#DBEAFE", ink: "#1D4ED8", title: "Documents", text: "Contracts, certificates and letters, sealed and tracked." },
  { icon: ShoppingBasket, tile: "#DCFCE7", ink: "#15803D", title: "Groceries", text: "Market runs and restocks, from shop shelf to kitchen." },
  { icon: Gift, tile: "#FCE7F3", ink: "#9D174D", title: "Gifts", text: "Birthdays and surprises, delivered with care." },
  { icon: Smartphone, tile: "#FEF3C7", ink: "#92400E", title: "Electronics", text: "Phones, laptops and accessories, handled gently." },
  { icon: Shirt, tile: "#CCFBF1", ink: "#0E7490", title: "Fashion", text: "Clothes, shoes and fabrics, packed to arrive neat." },
  { icon: Box, tile: "#FDECEC", ink: "#9A1717", title: "Fragile items", text: "Glassware and breakables, cushioned every mile." },
];

const STEPS = [
  { title: "Request a delivery", text: "Tell us what to move and where. Pickup and drop-off take under a minute." },
  { title: "A rider is assigned", text: "An admin confirms your request and matches it with an available rider." },
  { title: "Picked up and in transit", text: "The rider collects your parcel and you follow it live to the door." },
  { title: "Delivered and paid", text: "Handed over at the doorstep, with the payment recorded in the app." },
];

const EVERYONE = [
  { icon: MapPin, title: "Stage-by-stage tracking", text: "Follow every delivery from pending to delivered on one clear timeline." },
  { icon: Lock, title: "Secure sign-in", text: "Passwords are hashed and every session is protected with a token." },
  { icon: Wallet, title: "Cash, card and transfer", text: "Pay the way that suits you. Every payment is recorded in the system." },
  { icon: UserCheck, title: "Rider approval and availability", text: "Riders are approved by an admin and choose exactly when to ride." },
];

const FAQS = [
  {
    q: "How does SwiftDrop work?",
    a: "Create an account and request a delivery with pickup and drop-off details. Record your payment in the app, an admin confirms the request and assigns a verified rider, and you track each stage — pending, confirmed, assigned, picked up, in transit, delivered — to the doorstep.",
  },
  {
    q: "What payment methods are supported?",
    a: "Cash, card and bank transfer. Payments are recorded in the system so both sides can see a receipt. Card and transfer payments complete instantly in the app, while cash stays pending until an admin confirms it. There is no live external payment gateway.",
  },
  {
    q: "Can I cancel a delivery?",
    a: "Yes, as long as the rider has not picked it up yet. Open the delivery and choose Cancel. Once it is in transit it can no longer be cancelled — contact support and we will help.",
  },
  {
    q: "How do I become a rider?",
    a: "Sign up and choose the Rider tab, then add your vehicle details. An admin reviews and approves the account. After approval you can log in, set yourself Available, and start accepting open jobs.",
  },
  {
    q: "What are the delivery statuses?",
    a: "Pending, Confirmed, Assigned, Picked up, In transit, Delivered — and Cancelled if a delivery is stopped before pickup. You always see the current stage on a timeline.",
  },
  {
    q: "Is my data secure?",
    a: "Passwords are stored hashed, sign-in uses tokens, and every page is guarded by role — customers, riders and admins each only see what belongs to them.",
  },
];

const YEAR = new Date().getFullYear();

/* Logo click: already on the public home page ("/"), smooth-scroll to top
   instead of reloading. From any other path, fall through to "/" navigation. */
function scrollToTop(e) {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/") {
    e.preventDefault();
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }
}

/* Fade-up reveal wrapper (once). Disabled automatically for reduced motion. */
function Reveal({ className = "", delay = 0, children, id }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (REDUCED) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} id={id} className={`rv ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

/* One-shot "entered the viewport" flag for animated panels. */
function useEnter(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(REDUCED);
  useEffect(() => {
    if (REDUCED) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function CountUp({ value, start }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (REDUCED || !value) {
      setN(value);
      return;
    }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 700);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);
  return <>{n.toLocaleString()}</>;
}

function initialsOf(name) {
  return (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function firstNameOf(name) {
  return (name || "").split(" ")[0] || "there";
}

function DashboardButton({ to, className = "lp-btn lp-btn-red lp-btn-sm" }) {
  return (
    <Link className={className} to={to}>
      Go to dashboard <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}

/* Neutral skeleton for the navbar auth buttons while auth state loads —
   prevents any flash of Login/Sign up vs dashboard. */
function NavAuthSkeleton() {
  return (
    <span className="lp-nav-skel" aria-hidden="true">
      <span className="lp-nav-skel-pill" />
      <span className="lp-nav-skel-pill short" />
    </span>
  );
}

function AddressForm({ id, buttonLabel, variant, to = "/register" }) {
  const nav = useNavigate();
  const [addr, setAddr] = useState("");
  return (
    <form
      className={id === "cta" ? "lp-cta-form" : "lp-hero-form"}
      onSubmit={(e) => {
        e.preventDefault();
        try {
          if (addr.trim()) sessionStorage.setItem("sd-pickup", addr.trim());
        } catch {
          /* private mode: navigation still works, prefill is skipped */
        }
        nav(to);
      }}
    >
      <label htmlFor={`${id}-pickup`} className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        Enter pickup address
      </label>
      <input
        id={`${id}-pickup`}
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
        placeholder="Enter pickup address"
        autoComplete="street-address"
      />
      <button type="submit" className={`lp-btn ${variant}`}>
        {buttonLabel} <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}

export default function Landing() {
  const { user, loading } = useAuth();
  const dashboardTo = user ? roleHome(user.role) : "/";
  const isCustomer = user?.role === "CUSTOMER";
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState(null);
  const [faqOpen, setFaqOpen] = useState(0);
  const [stepsRef, stepsIn] = useEnter(0.3);
  const [statsRef, statsIn] = useEnter(0.3);
  const [pulseRef, pulseIn] = useEnter(0.3);
  const [ctaRef, ctaIn] = useEnter(0.3);

  useEffect(() => {
    document.title = `${BRAND} — Send anything. Delivered fast.`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        `${BRAND} — request a delivery, get matched with a verified rider, and track every stage to the doorstep. Cash, card or transfer.`
      );
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Real platform numbers for the stats bar and dispatch panel. */
  useEffect(() => {
    let live = true;
    api("/stats")
      .then((d) => {
        if (live) setStats(d);
      })
      .catch(() => {
        if (live) setStats(null); // bar hides; never show fake numbers
      });
    return () => {
      live = false;
    };
  }, []);

  const total = stats?.totalDeliveries || 0;
  const share = (v) => (total > 0 ? `${Math.max(4, Math.round((v / total) * 100))}%` : "0%");

  return (
    <div className="lp">
      {/* 1. Sticky navbar */}
      <header className={`lp-nav${scrolled ? " scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <a href="#top" onClick={scrollToTop} className="lp-brand" aria-label={`${BRAND} home`}>
            <span className="brand-ico"><Truck size={20} aria-hidden="true" /></span>
            <span className="brand-name">{BRAND}</span>
          </a>
          <nav className="lp-links" aria-label="Landing sections">
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </nav>
          <div className="lp-nav-cta">
            {loading ? (
              <NavAuthSkeleton />
            ) : user ? (
              <>
                <span className="lp-userchip" aria-label={`Signed in as ${user.name}`}>
                  <span className="lp-avatar" aria-hidden="true">{initialsOf(user.name)}</span>
                  <span className="lp-username">{firstNameOf(user.name)}</span>
                </span>
                <DashboardButton to={dashboardTo} />
              </>
            ) : (
              <>
                <a className="lp-login" href="/login">Login</a>
                <a className="lp-btn lp-btn-red lp-btn-sm" href="/register">
                  Sign up <ArrowRight size={16} aria-hidden="true" />
                </a>
              </>
            )}
          </div>
          <button
            className="icon-btn lp-burger"
            onClick={() => setDrawer((v) => !v)}
            aria-label={drawer ? "Close menu" : "Open menu"}
            aria-expanded={drawer}
          >
            {drawer ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
        {drawer && (
          <nav className="lp-mobile" aria-label="Landing sections mobile">
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setDrawer(false)}>{label}</a>
            ))}
            <div className="lp-mobile-cta">
              <a className="lp-login" href="/login">Login</a>
              <a className="lp-btn lp-btn-red lp-btn-sm" href="/register">Sign up</a>
            </div>
          </nav>
        )}
      </header>

      <main id="top">
        {/* 2. Hero */}
        <section className="lp-hero" aria-labelledby="lp-hero-h">
          <div className="lp-hero-grid">
            <div>
              <span className="lp-hero-label hero-in" style={{ animationDelay: "0ms" }}>Delivery, simplified</span>
              <h1 id="lp-hero-h" className="hero-in" style={{ animationDelay: "80ms" }}>
                Send anything. <em className={REDUCED ? undefined : "sweep"}>Delivered fast.</em>
              </h1>
              <p className="lp-hero-sub hero-in" style={{ animationDelay: "160ms" }}>
                Request a delivery in under a minute, get matched with a verified
                rider, and track every stage to the doorstep.
              </p>
              <div className="hero-in" style={{ animationDelay: "240ms" }}>
                <AddressForm id="hero" buttonLabel="Get started" variant="lp-btn-red" />
              </div>
              <ul className="lp-facts hero-in" style={{ animationDelay: "320ms" }}>
                <li><MapPin size={16} aria-hidden="true" /> Track every stage</li>
                <li><CreditCard size={16} aria-hidden="true" /> Pay by cash, card or transfer</li>
                <li><ShieldCheck size={16} aria-hidden="true" /> Verified riders</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Rider banner */}
        <section className="lp-band-cream" aria-label="Rider signups">
          <div className="lp-inner lp-riderband">
            <span className="lp-new">New</span>
            <Reveal>
              <strong>Riders can now sign up.</strong>
              <p>Create a rider account — an admin approves it before you can ride.</p>
            </Reveal>
            <a className="lp-btn lp-btn-red lp-btn-sm" href="/register?role=rider">
              Become a rider <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* 4. Send almost anything */}
        <section className="lp-sec" id="customers" aria-labelledby="lp-cat-h">
          <div className="lp-inner">
            <Reveal>
              <p className="lp-label">For customers</p>
              <h2 className="lp-h" id="lp-cat-h">Send almost <em>anything.</em></h2>
              <p className="lp-sub">
                If it fits on a bike or in a boot, a rider can move it.
                Pick a category, describe the parcel, and we handle the rest.
              </p>
            </Reveal>
            <div className="lp-cat-grid">
              {CATEGORIES.map(({ icon: Icon, tile, ink, title, text }, i) => (
                <Reveal key={title} delay={(i % 3) * 90}>
                  <article className="lp-cat">
                    <span className="lp-tile" style={{ background: tile, color: ink }}>
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <a className="lp-send" href="/register" aria-label={`Send ${title.toLowerCase()} — create an account`}>
                      Send it <ArrowRight size={15} aria-hidden="true" />
                    </a>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Stats bar (real data only — hidden if the endpoint fails) */}
        {stats && (
          <section className="lp-sec" style={{ paddingTop: 0 }} aria-label="Platform numbers">
            <div className="lp-inner">
              <div ref={statsRef} className="lp-stats">
                <div className="lp-stat"><b><CountUp value={stats.totalDeliveries} start={statsIn} /></b><span>Deliveries created</span></div>
                <div className="lp-stat"><b><CountUp value={stats.completedDeliveries} start={statsIn} /></b><span>Delivered</span></div>
                <div className="lp-stat"><b><CountUp value={stats.activeRiders} start={statsIn} /></b><span>Active riders</span></div>
                <div className="lp-stat"><b><CountUp value={stats.customers} start={statsIn} /></b><span>Customers</span></div>
              </div>
            </div>
          </section>
        )}

        {/* 6. Four steps */}
        <section className="lp-sec" id="how" style={{ paddingTop: stats ? undefined : 100 }} aria-labelledby="lp-how-h">
          <div className="lp-inner">
            <Reveal>
              <p className="lp-label">How it works</p>
              <h2 className="lp-h" id="lp-how-h">Four steps to <em>delivered.</em></h2>
            </Reveal>
            <div ref={stepsRef} className={`lp-steps${stepsIn ? " in" : ""}`}>
              <span className="lp-steps-fill" aria-hidden="true" />
              {STEPS.map((s, i) => (
                <div key={s.title} className="lp-step">
                  <span className="sdot" aria-hidden="true" />
                  <div>
                    <h3>{i + 1}. {s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Built for everyone (dark) */}
        <section className="lp-sec lp-dark on-dark" id="about" aria-labelledby="lp-every-h">
          <div className="lp-inner">
            <Reveal>
              <p className="lp-label">Why {BRAND}</p>
              <h2 className="lp-h" id="lp-every-h">Built for <em>everyone</em> involved.</h2>
              <p className="lp-sub">
                Customers, riders and admins share one flow — no phone tag,
                no lost parcels, no guesswork about who does what.
              </p>
            </Reveal>
            <div className="lp-every-grid">
              <div className="lp-dark-cards">
                {EVERYONE.map(({ icon: Icon, title, text }, i) => (
                  <Reveal key={title} delay={(i % 2) * 90}>
                    <article className="lp-dark-card">
                      <Icon size={24} aria-hidden="true" />
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
              <div ref={pulseRef} className={`lp-pulse${pulseIn ? " in" : ""}`} aria-label="Live dispatch numbers">
                <div className="lp-pulse-head">
                  <span className="lp-pulse-dot" aria-hidden="true" />
                  <strong>Dispatch pulse</strong>
                </div>
                {stats ? (
                  <>
                    <div className="lp-pulse-row">
                      <div className="lp-pulse-top"><span>In progress</span><b>{stats.inProgressDeliveries}</b></div>
                      <div className="lp-pulse-bar"><i style={{ "--w": share(stats.inProgressDeliveries) }} /></div>
                    </div>
                    <div className="lp-pulse-row">
                      <div className="lp-pulse-top"><span>Riders available</span><b>{stats.availableRiders}</b></div>
                      <div className="lp-pulse-bar"><i style={{ "--w": share(stats.availableRiders) }} /></div>
                    </div>
                    <div className="lp-pulse-row">
                      <div className="lp-pulse-top"><span>Completed</span><b>{stats.completedDeliveries}</b></div>
                      <div className="lp-pulse-bar"><i style={{ "--w": share(stats.completedDeliveries) }} /></div>
                    </div>
                  </>
                ) : (
                  <p className="lp-pulse-note">Live numbers are unavailable right now — please check back soon.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 8. Earn band */}
        <section className="lp-sec lp-band-red" id="riders" aria-labelledby="lp-earn-h">
          <div className="lp-inner lp-earn">
            <Reveal>
              <h2 id="lp-earn-h">Earn on <em>your</em> schedule.</h2>
              <p>
                Choose when to ride and accept the jobs you want.
                Rider accounts are approved by an admin before the first trip.
              </p>
            </Reveal>
            <a className="lp-btn lp-btn-black" href="/register?role=rider">
              Ride with us <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* 9. Track every delivery */}
        <section className="lp-sec" aria-labelledby="lp-track-h">
          <div className="lp-inner">
            <div className="lp-track-grid">
              <Reveal>
                <p className="lp-label">Tracking</p>
                <h2 className="lp-h" id="lp-track-h">Track every <em>delivery.</em></h2>
                <ul className="lp-checks">
                  <li><span className="check-dot"><Check size={14} aria-hidden="true" /></span> Live status updates at every stage</li>
                  <li><span className="check-dot"><Check size={14} aria-hidden="true" /></span> A clear timeline from request to doorstep</li>
                  <li><span className="check-dot"><Check size={14} aria-hidden="true" /></span> Rider details once one is assigned</li>
                  <li><span className="check-dot"><Check size={14} aria-hidden="true" /></span> A recorded payment receipt for every trip</li>
                </ul>
                <a className="lp-btn lp-btn-red" href="/register">
                  Create an account <ArrowRight size={18} aria-hidden="true" />
                </a>
              </Reveal>
              <Reveal delay={120}>
                <div className="lp-mock">
                  <div className="lp-mock-tag"><span className="badge b-brand">Example</span></div>
                  <h3>Active delivery · DEL-1042</h3>
                  <p className="route">Ring Road Central → Cantonments, Accra</p>
                  <p className="fee">₦18.50 · rider Efua · cash on delivery</p>
                  <div style={{ margin: "10px 0 2px" }}><StatusBadge value="IN_TRANSIT" /></div>
                  <Stepper status="IN_TRANSIT" />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 10. FAQ */}
        <section className="lp-sec" style={{ paddingTop: 20 }} aria-labelledby="lp-faq-h">
          <div className="lp-inner">
            <Reveal>
              <h2 className="lp-h" id="lp-faq-h" style={{ textAlign: "center" }}>Everything you might be <em>wondering.</em></h2>
            </Reveal>
            <div className="lp-faq">
              {FAQS.map((f, i) => {
                const open = faqOpen === i;
                return (
                  <div key={f.q} className="lp-faq-item">
                    <button
                      type="button"
                      className="lp-faq-q"
                      aria-expanded={open}
                      aria-controls={`lp-faq-a${i}`}
                      id={`lp-faq-q${i}`}
                      onClick={() => setFaqOpen(open ? -1 : i)}
                    >
                      {f.q}
                      <span className="lp-faq-x" aria-hidden="true"><Plus size={20} /></span>
                    </button>
                    <div
                      id={`lp-faq-a${i}`}
                      role="region"
                      aria-labelledby={`lp-faq-q${i}`}
                      className={`lp-faq-a${open ? " open" : ""}`}
                    >
                      <div><p>{f.a}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 11. Final CTA */}
        <section className="lp-sec" style={{ paddingTop: 20 }} aria-labelledby="lp-cta-h">
          <div className="lp-inner">
            <div ref={ctaRef} className={`lp-cta-band${ctaIn ? " in" : ""}`}>
              <svg className="lp-cta-deco" width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
                <circle cx="110" cy="110" r="100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 10" />
                <circle cx="110" cy="110" r="66" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <h2 id="lp-cta-h">Ready to send something? <em>Get started today.</em></h2>
              <p>Type your pickup address — we will carry it into your first delivery.</p>
              <AddressForm id="cta" buttonLabel="Create account" variant="lp-btn-black" />
              <svg className="lp-scoot" width="72" height="40" viewBox="0 0 72 40" aria-hidden="true">
                <circle cx="14" cy="30" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="58" cy="30" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
                <path d="M14 30 L30 30 L38 12 L52 12 M38 12 L34 30 M52 12 L58 30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="24" y="6" width="14" height="10" rx="2" fill="currentColor" />
              </svg>
            </div>
          </div>
        </section>
      </main>

      {/* 12. Footer */}
      <footer className="lp-footer" id="contact">
        <div className="lp-foot-grid">
          <div className="lp-foot-brand">
            <a href="/" onClick={scrollToTop} className="lp-brand" aria-label={`${BRAND} home`}>
              <span className="brand-ico"><Truck size={20} aria-hidden="true" /></span>
              <span className="brand-name">{BRAND}</span>
            </a>
            <p>
              Door-to-door delivery for customers, riders and admins —
              request, track and pay in one simple flow.
            </p>
            <div className="lp-foot-contact">
              <a href={`mailto:${SUPPORT_EMAIL}`}><Mail size={14} aria-hidden="true" /> {SUPPORT_EMAIL}</a>
              <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}><Phone size={14} aria-hidden="true" /> {SUPPORT_PHONE}</a>
            </div>
          </div>
          <nav aria-label="Product">
            <h3>Product</h3>
            <ul>
              <li><a href="#how">How it works</a></li>
              <li><a href="#customers">For customers</a></li>
              <li><a href="#riders">For riders</a></li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h3>Company</h3>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
          <nav aria-label="Account">
            <h3>Account</h3>
            <ul>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Sign up</a></li>
            </ul>
          </nav>
        </div>
        <div className="lp-foot-base">© {YEAR} {BRAND}. All rights reserved.</div>
      </footer>
    </div>
  );
}
