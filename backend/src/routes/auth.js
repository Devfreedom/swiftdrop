const router = require("express").Router();
const validate = require("../middleware/validate");
const { register, login } = require("../controllers/authController");

router.post(
  "/register",
  validate({
    name: { required: true, type: "string" },
    email: { required: true, type: "string", email: true },
    password: { required: true, type: "string", min: 8 },
    phone: { required: true, type: "string" },
    role: { enum: ["CUSTOMER", "RIDER"] },
    vehicleType: { enum: ["Bike", "Car", "Van"] },
    plateNumber: { type: "string" },
  }),
  register
);

router.post(
  "/login",
  validate({
    email: { required: true, type: "string", email: true },
    password: { required: true, type: "string" },
  }),
  login
);

module.exports = router;
