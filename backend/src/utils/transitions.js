// The single source of truth for which status can follow which.
// Rider progress is always one step: ASSIGNED -> PICKED_UP -> IN_TRANSIT -> DELIVERED.
const NEXT = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

// statuses where a rider is still holding the parcel
const ACTIVE_RIDER_STATUSES = ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"];

function canTransition(from, to) {
  return (NEXT[from] || []).includes(to);
}

module.exports = { NEXT, ACTIVE_RIDER_STATUSES, canTransition };
