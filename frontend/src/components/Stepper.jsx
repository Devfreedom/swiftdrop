// Delivery progress timeline: purple line, check circles, numbered future steps.
// CANCELLED hides the line and shows a red banner instead.
import { Check } from "lucide-react";

const STAGES = ["PENDING", "CONFIRMED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];
const LABELS = {
  PENDING: "Pending", CONFIRMED: "Confirmed", ASSIGNED: "Assigned",
  PICKED_UP: "Picked up", IN_TRANSIT: "In transit", DELIVERED: "Delivered",
};

export default function Stepper({ status }) {
  if (status === "CANCELLED") {
    return <div className="cancelled-banner" role="status">Cancelled</div>;
  }
  const idx = Math.max(STAGES.indexOf(status), 0);
  return (
    <div className="timeline" role="list" aria-label="Delivery progress">
      {STAGES.map((s, i) => (
        <div key={s} role="listitem" aria-current={i === idx ? "step" : undefined}
          className={`tl-step${i < idx ? " done" : ""}${i === idx ? " now" : ""}`}>
          <span className="tl-dot">{i <= idx ? <Check size={14} aria-hidden="true" /> : i + 1}</span>
          <span className="tl-label">{LABELS[s]}</span>
          {i < STAGES.length - 1 && <span className="tl-bar" aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}
