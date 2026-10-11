// Public routes: no authentication. Only aggregate, non-personal data.
const router = require("express").Router();
const c = require("../controllers/publicController");

router.get("/stats", c.stats);

module.exports = router;
