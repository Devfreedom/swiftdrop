// "Me" routes: any logged-in user reads/edits their own profile.
// Email, role and status can only change via admin routes.
const bcrypt = require("bcryptjs");
const { fail } = require("../utils/errors");

function shape(user) {
  return {
    id: user.id, name: user.name, email: user.email, role: user.role,
    status: user.status, phone: user.phone, availability: user.availability,
  };
}

async function getMe(req, res) {
  res.json({ user: shape(req.user) });
}

async function updateMe(req, res) {
  const { name, phone } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  await req.user.save();
  res.json({ user: shape(req.user) });
}

// Change own password: must prove the current one first.
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  const ok = await bcrypt.compare(currentPassword, req.user.passwordHash);
  if (!ok) fail(401, "Current password is incorrect");

  req.user.passwordHash = await bcrypt.hash(newPassword, 10);
  await req.user.save();
  res.json({ message: "Password changed" });
}

module.exports = { getMe, updateMe, changePassword };
