const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const validate = require("../middleware/validate");
const c = require("../controllers/adminController");

router.use(auth, requireRole("ADMIN")); // everything below is admin-only

router.get("/stats", c.stats);

router.get("/users", c.listUsers);
router.post(
  "/users",
  validate({
    name: { required: true, type: "string" },
    email: { required: true, type: "string", email: true },
    password: { required: true, type: "string", min: 6 },
    role: { required: true, enum: ["RIDER", "ADMIN", "CUSTOMER"] },
  }),
  c.createUser
);
router.patch(
  "/users/:id/status",
  validate({ status: { required: true, enum: ["ACTIVE", "INACTIVE", "SUSPENDED"] } }),
  c.setUserStatus
);

router.get("/deliveries", c.listDeliveries);
router.patch("/deliveries/:id/confirm", c.confirmDelivery);
router.post(
  "/deliveries/:id/assign",
  validate({ riderId: { required: true, type: "integer", min: 1 } }),
  c.assignDelivery
);
router.patch("/deliveries/:id/cancel", c.cancelDelivery);

router.get("/payments", c.listPayments);
router.post("/payments/:id/confirm", c.confirmPayment);
router.post("/payments/:id/refund", c.refundPayment);

module.exports = router;
