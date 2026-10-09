// Visual delivery progress: PENDING → … → DELIVERED.
import { Check } from "lucide-react";

const STAGES = ["PENDING", "CONFIRMED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];
const SHORT = {
  PENDING: "Placed", CONFIRMED: "Confirmed", ASSIGNED: "Assigned",
  PICKED_UP: "Picked up", IN_TRANSIT: "In transit", DELIVERED: "Delivered",
};

export default function Stepper({ status }) {
  if (status === "CANCELLED") return <p className="error">This delivery was cancelled.</p>;
  const idx = STAGES.indexOf(status);
  return (
    <div className="stepper" role="list" aria-label="Delivery progress">
      {STAGES.map((s, i) => (
        <div key={s} role="listitem" aria-current={i === idx ? "step" : undefined}
          className={`step${i < idx ? " done" : ""}${i === idx ? " now" : ""}`}>
          <span className="dot">{i < idx ? <Check size={15} /> : i + 1}</span>
          {SHORT[s]}
        </div>
      ))}
    </div>
  );
}
