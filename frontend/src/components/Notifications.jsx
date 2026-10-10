// Real notifications built from existing API data (no new table).
// Red dot = updates newer than the last-seen timestamp in localStorage.
import { useEffect, useRef, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { timeAgo, trackingId } from "../constants";

const seenKey = (role) => `swiftdrop_notif_seen_${role}`;

// Customer: status changes, rider assigned, payments verified.
async function customerItems() {
  const [d, p] = await Promise.all([api("/deliveries"), api("/payments")]);
  const verified = {};
  p.payments.forEach((x) => { if (x.status === "SUCCESSFUL") verified[x.deliveryId] = x; });
  const items = [];
  d.deliveries.slice(0, 10).forEach((del) => {
    const code = trackingId(del.id);
    items.push({ id: `s${del.id}`, text: `${code} is now ${del.status.replace(/_/g, " ").toLowerCase()}`, time: del.updatedAt || del.createdAt });
    if (del.rider) items.push({ id: `r${del.id}`, text: `${del.rider.name} was assigned to ${code}`, time: del.assignedAt || del.updatedAt });
    if (verified[del.id]) items.push({ id: `p${del.id}`, text: `Payment for ${code} was verified`, time: verified[del.id].updatedAt || verified[del.id].createdAt });
  });
  return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
}

// Rider: new assignments and status changes on own jobs.
async function riderItems() {
  const [a, h] = await Promise.all([api("/rider/assigned"), api("/rider/history")]);
  const items = [];
  a.deliveries.forEach((del) => {
    const code = trackingId(del.id);
    items.push({ id: `a${del.id}`, text: `New assignment: ${code}`, time: del.assignedAt || del.createdAt });
    if (del.status !== "ASSIGNED") items.push({ id: `s${del.id}`, text: `${code} is now ${del.status.replace(/_/g, " ").toLowerCase()}`, time: del.updatedAt });
  });
  h.deliveries.slice(0, 5).forEach((del) => {
    items.push({ id: `h${del.id}`, text: `${trackingId(del.id)} ${del.status.toLowerCase()}`, time: del.updatedAt || del.createdAt });
  });
  return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
}

// Admin: deliveries needing a rider + pending cash payments.
async function adminItems() {
  const [d, p] = await Promise.all([api("/admin/deliveries"), api("/admin/payments?status=PENDING")]);
  const items = [];
  d.deliveries
    .filter((x) => !x.riderId && ["PENDING", "CONFIRMED"].includes(x.status))
    .slice(0, 5)
    .forEach((x) => items.push({ id: `n${x.id}`, text: `${trackingId(x.id)} needs a rider`, time: x.updatedAt || x.createdAt }));
  p.payments.slice(0, 5).forEach((x) => items.push({
    id: `p${x.id}`, text: `Cash payment for ${trackingId(x.deliveryId)} awaits verification`, time: x.createdAt,
  }));
  return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
}

const loaders = { CUSTOMER: customerItems, RIDER: riderItems, ADMIN: adminItems };

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    let live = true;
    (loaders[user.role] || (async () => []))()
      .then((list) => {
        if (!live) return;
        setItems(list);
        const seen = Number(localStorage.getItem(seenKey(user.role)) || 0);
        setHasNew(list.some((x) => new Date(x.time).getTime() > seen));
      })
      .catch(() => { if (live) setItems([]); });
    return () => { live = false; };
  }, [user.role]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      localStorage.setItem(seenKey(user.role), String(Date.now()));
      setHasNew(false);
    }
  }

  return (
    <div className="bell-wrap" ref={boxRef}>
      <button className="icon-btn" onClick={toggle} aria-label="Notifications" aria-expanded={open} aria-haspopup="true">
        <Bell size={19} aria-hidden="true" />
        {hasNew && <span className="bell-dot" aria-hidden="true" />}
      </button>
      {open && (
        <>
          <div className="bell-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="bell-drop" role="menu" aria-label="Recent updates">
            <p className="bell-title">Recent updates</p>
            {items.length === 0 ? (
              <div className="notif-empty">
                <BellRing size={22} aria-hidden="true" />
                <p>You&apos;re all caught up</p>
              </div>
            ) : items.map((n) => (
              <div key={n.id} className="notif-item" role="menuitem">
                <span>{n.text}</span>
                <small>{timeAgo(n.time)}</small>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
