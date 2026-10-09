// Public: register (customers only) and login. Riders/admins are
// created by an admin, so register never accepts a role.
const bcrypt = require("bcryptjs");
const { User } = require("../../models");
const { signToken } = require("../utils/tokens");
const { fail } = require("../utils/errors");

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status };
}

async function register(req, res) {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ where: { email } });
  if (exists) fail(409, "Email already registered");

  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: "CUSTOMER",
    status: "ACTIVE",
  });

  res.status(201).json({ user: publicUser(user), token: signToken(user) });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) fail(401, "Invalid email or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) fail(401, "Invalid email or password");

  if (user.status !== "ACTIVE") fail(403, `Account is ${user.status}`);

  res.json({ user: publicUser(user), token: signToken(user) });
}

module.exports = { register, login };
