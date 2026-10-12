// Opt-in live sharing for the assigned rider on one active job.
// Permission is asked only when Start is tapped. Updates go out at most
// every 5s; sharing stops on Stop, on delivery end, or on unmount (logout).
import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import Button from "../ui/Button";

const ENDED = ["DELIVERED", "CANCELLED"];
const SEND_EVERY_MS = 5000;

export default function ShareLocation({ deliveryId, status }) {
  const [sharing, setSharing] = useState(false);
  const [err, setErr] = useState("");
  const [lastSent, setLastSent] = useState(null);
  const watchId = useRef(null);
  const lock = useRef(null);
  const lastSentAt = useRef(0);
  const sharingRef = useRef(false);

  function stopWatch() {
    if (watchId.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    watchId.current = null;
    if (lock.current) {
      lock.current.release().catch(() => {});
      lock.current = null;
    }
  }

  function stop() {
    stopWatch();
    sharingRef.current = false;
    setSharing(false);
  }

  async function send(pos) {
    const now = Date.now();
    if (now - lastSentAt.current < SEND_EVERY_MS) return; // at most every 5s
    lastSentAt.current = now;
    const c = pos.coords;
    const body = {
      lat: Number(c.latitude.toFixed(6)),
      lng: Number(c.longitude.toFixed(6)),
    };
    if (Number.isFinite(c.accuracy)) body.accuracy = Math.round(c.accuracy * 100) / 100;
    if (Number.isFinite(c.heading) && c.heading !== null) body.heading = Math.round(c.heading * 100) / 100;
    if (Number.isFinite(c.speed) && c.speed !== null) body.speed = Math.round(c.speed * 100) / 100;
    try {
      await api(`/deliveries/${deliveryId}/location`, { method: "POST", body });
      setLastSent(new Date().toISOString());
    } catch {
      lastSentAt.current = 0; // quiet retry on the next position fix
    }
  }

  function onPositionError(e) {
    if (e.code === 1) {
      setErr("Location permission denied — allow location access in your browser to share.");
      stop();
    } else if (e.code === 2) {
      setErr("Position unavailable — move somewhere with a clearer signal; still trying.");
    } else {
      setErr("Location request timed out — still trying.");
    }
  }

  async function holdWakeLock() {
    try {
      if ("wakeLock" in navigator) lock.current = await navigator.wakeLock.request("screen");
    } catch {
      /* unsupported or refused: sharing works without it */
    }
  }

  function start() {
    if (!("geolocation" in navigator)) {
      setErr("Geolocation isn't supported on this device — you can't share location.");
      return;
    }
    setErr("");
    sharingRef.current = true;
    setSharing(true);
    holdWakeLock();
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (sharingRef.current) send(pos);
      },
      onPositionError,
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );
  }

  // Stop when the delivery ends; always stop on unmount (logout included).
  useEffect(() => {
    if (ENDED.includes(status) && sharingRef.current) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  useEffect(() => () => stopWatch(), []);
  useEffect(() => {
    const reLock = () => {
      if (sharingRef.current && document.visibilityState === "visible") holdWakeLock();
    };
    document.addEventListener("visibilitychange", reLock);
    return () => document.removeEventListener("visibilitychange", reLock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!sharing) {
    return (
      <div className="share-box">
        <h3 className="eyebrow">Live location</h3>
        <p className="muted small">
          Share your live position so your customer can follow this delivery on a map.
          Shared only with this delivery&apos;s customer and admins, and deleted when
          the delivery ends.
        </p>
        {err && <p className="error">{err}</p>}
        <Button variant="primary" onClick={start}>Share my location</Button>
      </div>
    );
  }
  return (
    <div className="share-box sharing" role="status">
      <p className="share-on">
        <span className="live-dot" aria-hidden="true" /> Sharing your location
      </p>
      {err && <p className="error">{err}</p>}
      <p className="muted small">
        Keep this page open while you deliver.
        {lastSent ? ` Last update ${new Date(lastSent).toLocaleTimeString()}.` : " Waiting for the first fix…"}
      </p>
      <Button variant="ghost" onClick={stop}>Stop sharing</Button>
    </div>
  );
}
