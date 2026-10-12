const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const validate = require("../middleware/validate");
const c = require("../controllers/deliveryController");
const loc = require("../controllers/locationController");

const customerOnly = [auth, requireRole("CUSTOMER")];
const riderOnly = [auth, requireRole("RIDER")];

const COORD_RULES = (latField, lngField) => ({
  [latField]: { type: "number", min: -90, max: 90 },
  [lngField]: { type: "number", min: -180, max: 180 },
});

const ADDRESS_RULES = {
  pickupAddress: { required: true, type: "string" },
  pickupContact: { required: true, type: "string" },
  pickupPhone: { required: true, type: "string" },
  pickupLandmark: { type: "string" },
  ...COORD_RULES("pickupLat", "pickupLng"),
  deliveryAddress: { required: true, type: "string" },
  deliveryContact: { required: true, type: "string" },
  deliveryPhone: { required: true, type: "string" },
  deliveryLandmark: { type: "string" },
  ...COORD_RULES("dropoffLat", "dropoffLng"),
  packageDescription: { required: true, type: "string" },
  packageWeightKg: { type: "number", min: 0 },
  // Optional + ignored: the fee is calculated server-side (see utils/pricing).
  // Kept in the schema so older clients that still send it don't 400.
  deliveryFee: { type: "number", min: 0 },
};

const LOCATION_RULES = {
  lat: { required: true, type: "number", min: -90, max: 90 },
  lng: { required: true, type: "number", min: -180, max: 180 },
  accuracy: { type: "number", min: 0 },
  heading: { type: "number", min: 0, max: 360 },
  speed: { type: "number", min: 0 },
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
// Live rider point: rider pushes on their own active job; the delivery's
// customer, rider and admins read.
router.post("/:id/location", ...riderOnly, validate(LOCATION_RULES), loc.postLocation);
router.get("/:id/location", auth, loc.getLocation);

module.exports = router;
