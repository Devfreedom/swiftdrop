// Live rider view for one delivery. Polls GET /deliveries/:id/location
// every 5s while the tab is visible and the delivery is active, backs off
// on errors (up to 60s), and stops when the delivery ends. Fresh points
// render the map; stale or missing points render a notice, never an old dot.
import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import DeliveryMap from "./DeliveryMap";

function useNow(stepMs, on) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setNow(Date.now()), stepMs);
    return () => clearInterval(id);
  }, [stepMs, on]);
  return now;
}

function haversineKm(a, b) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const num = (v) => (v === null || v === undefined || v === "" ? null : Number(v));
const asPos = (lat, lng) =>
  lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng)
    ? { lat, lng }
    : null;

function agoText(recordedAt, now) {
  const s = Math.max(0, Math.floor((now - new Date(recordedAt).getTime()) / 1000));
  if (s < 5) return "Updated just now";
  if (s < 60) return `Updated ${s} second${s === 1 ? "" : "s"} ago`;
  const m = Math.floor(s / 60);
  return `Updated ${m} minute${m === 1 ? "" : "s"} ago`;
}

export default function LiveDeliveryMap({ deliveryId, pickup, dropoff, active }) {
  const [point, setPoint] = useState(null); // { location, stale }
  const fails = useRef(0);
  const now = useNow(1000, !!point?.location && active);

  useEffect(() => {
    if (!active || !deliveryId) return;
    let stop = false;
    let timer = null;
    const schedule = () => {
      if (!stop) timer = setTimeout(run, Math.min(5000 * 2 ** fails.current, 60000));
    };
    async function run() {
      if (stop) return;
      if (document.visibilityState === "visible") {
        try {
          const r = await api(`/deliveries/${deliveryId}/location`);
          if (stop) return;
          fails.current = 0;
          setPoint({ location: r.location || null, stale: !!r.stale });
        } catch {
          if (stop) return;
          fails.current += 1; // quiet: keep the last state, try later
        }
      }
      schedule();
    }
    run();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [active, deliveryId]);

  if (!active) return null;
  const fresh = point?.location && !point.stale;

  const dest = dropoff || pickup;
  const riderPos = fresh ? { lat: Number(point.location.lat), lng: Number(point.location.lng) } : null;
  const km =
    riderPos && dest && Number.isFinite(Number(dest.lat)) && Number.isFinite(Number(dest.lng))
      ? haversineKm(riderPos, { lat: Number(dest.lat), lng: Number(dest.lng) })
      : null;
  const distText =
    km === null ? null : km < 1
      ? `about ${Math.round(km * 1000)} m away`
      : `about ${(Math.round(km * 10) / 10).toLocaleString()} km away`;

  return (
    <div className="live-map">
      <h3 className="eyebrow">Live tracking</h3>
      {fresh ? (
        <>
          <DeliveryMap pickup={pickup} dropoff={dropoff} rider={riderPos} label="Live delivery map with rider position" />
          <p className="muted small live-status">
            <span className="live-dot" aria-hidden="true" /> {agoText(point.location.recordedAt, now)}
            {distText && (
              <> · Rider is {distText} <span className="muted">(approximate straight-line distance)</span></>
            )}
          </p>
        </>
      ) : (
        <p className="muted" role="status">Rider location unavailable right now</p>
      )}
    </div>
  );
}
