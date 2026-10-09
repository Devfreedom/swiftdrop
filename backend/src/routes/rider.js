const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const validate = require("../middleware/validate");
const c = require("../controllers/riderController");

const riderOnly = [auth, requireRole("RIDER")];

router.patch(
  "/rider/availability",
  ...riderOnly,
  validate({ availability: { required: true, enum: ["AVAILABLE", "OFFLINE"] } }),
  c.setAvailability
);
router.get("/rider/available", ...riderOnly, c.listAvailable);
router.get("/rider/assigned", ...riderOnly, c.listAssigned);
router.get("/rider/history", ...riderOnly, c.history);
router.post("/rider/deliveries/:id/accept", ...riderOnly, c.accept);
router.patch(
  "/rider/deliveries/:id/status",
  ...riderOnly,
  validate({ status: { required: true, enum: ["PICKED_UP", "IN_TRANSIT", "DELIVERED"] } }),
  c.updateStatus
);

module.exports = router;
