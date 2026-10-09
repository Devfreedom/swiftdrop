const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const validate = require("../middleware/validate");
const c = require("../controllers/deliveryController");

const customerOnly = [auth, requireRole("CUSTOMER")];

const ADDRESS_RULES = {
  pickupAddress: { required: true, type: "string" },
  pickupContact: { required: true, type: "string" },
  pickupPhone: { required: true, type: "string" },
  pickupLandmark: { type: "string" },
  deliveryAddress: { required: true, type: "string" },
  deliveryContact: { required: true, type: "string" },
  deliveryPhone: { required: true, type: "string" },
  deliveryLandmark: { type: "string" },
  packageDescription: { required: true, type: "string" },
  packageWeightKg: { type: "number", min: 0 },
  deliveryFee: { required: true, type: "number", min: 0 },
};

router.post("/", ...customerOnly, validate(ADDRESS_RULES), c.createDelivery);
router.get("/", ...customerOnly, c.listMine);
router.get("/:id", ...customerOnly, c.getOne);
router.patch("/:id/cancel", ...customerOnly, c.cancelMine);
router.post(
  "/:id/pay",
  ...customerOnly,
  validate({ method: { required: true, enum: ["CASH", "CARD", "TRANSFER"] } }),
  c.pay
);

module.exports = router;
