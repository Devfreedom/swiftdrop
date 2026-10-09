const router = require("express").Router();
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { getMe, updateMe, changePassword } = require("../controllers/userController");

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe); // body: { name?, phone? }
router.patch(
  "/me/password",
  auth,
  validate({
    currentPassword: { required: true, type: "string" },
    newPassword: { required: true, type: "string", min: 8 },
  }),
  changePassword
); // body: { currentPassword, newPassword }

module.exports = router;
