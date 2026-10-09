// Landing page for logged-out visitors: what the platform is + how to join.
import { Link } from "react-router-dom";
import { Bike, Package, ShieldCheck, Wallet } from "lucide-react";
import { BRAND } from "../brand";
import StatusBadge from "../components/StatusBadge";

const STEPS = [
  ["1", "Request", "Send a pickup in under a minute."],
  ["2", "Pay", "Cash, card or transfer — your choice."],
  ["3", "Track", "Watch it move pickup → doorstep."],
  ["4", "Receive", "Signed, sealed, delivered."],
];

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <div>
          <StatusBadge value="DELIVERY PLATFORM" />
          <h1>Door-to-door delivery, <em>tracked end to end.</em></h1>
          <p>
            {BRAND} connects customers, riders and admins in one system:
            request a pickup, pay your way, and follow every parcel from
            counter to doorstep.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn primary">Get started</Link>
            <Link to="/login" className="btn">Login</Link>
          </div>
        </div>
        <div className="hero-card" aria-hidden="true">
          <div className="row"><span>#1042 → Osu Oxford St</span><StatusBadge value="IN_TRANSIT" /></div>
          <div className="row"><span>#1041 → Accra Mall</span><StatusBadge value="DELIVERED" /></div>
          <div className="row"><span>#1043 → East Legon</span><StatusBadge value="PENDING" /></div>
        </div>
      </section>
      <section className="pillars">
        <div className="pillar">
          <span className="stat-ico"><Package size={22} /></span>
          <h4>Customers</h4>
          <p>Create deliveries, pay cash/card/transfer and track progress live.</p>
        </div>
        <div className="pillar">
          <span className="stat-ico"><Bike size={22} /></span>
          <h4>Riders</h4>
          <p>Go available, claim open jobs and step them to delivered.</p>
        </div>
        <div className="pillar">
          <span className="stat-ico"><ShieldCheck size={22} /></span>
          <h4>Admins</h4>
          <p>Confirm requests, assign riders, confirm cash and refund.</p>
        </div>
        <div className="pillar">
          <span className="stat-ico"><Wallet size={22} /></span>
          <h4>How it flows</h4>
          <p>{STEPS.map(([n, t]) => `${n}. ${t}`).join(" ")}</p>
        </div>
      </section>
    </div>
  );
}
