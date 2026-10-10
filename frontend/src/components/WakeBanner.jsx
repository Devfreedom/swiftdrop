// Global "API is waking up" banner. The api client dispatches
// `swiftdrop:wake` while any request runs longer than 4 seconds.
import { useEffect, useState } from "react";
import { Spinner } from "./Feedback";

export default function WakeBanner() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const fn = (e) => setOn(!!e.detail?.on);
    window.addEventListener("swiftdrop:wake", fn);
    return () => window.removeEventListener("swiftdrop:wake", fn);
  }, []);
  if (!on) return null;
  return (
    <div className="wake-banner" role="status">
      <Spinner />
      <span>Waking up the server, this can take up to 30 seconds…</span>
    </div>
  );
}
