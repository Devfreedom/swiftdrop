const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { listMyPayments } = require("../controllers/deliveryController");

// payments for the customer's own deliveries
router.get("/", auth, requireRole("CUSTOMER"), listMyPayments);

module.exports = router;
