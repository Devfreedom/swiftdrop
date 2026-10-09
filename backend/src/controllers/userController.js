// "Me" routes: any logged-in user reads/edits their own profile.
// Email, role and status can only change via admin routes.
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

module.exports = { getMe, updateMe };
