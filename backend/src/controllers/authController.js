// Public: register (CUSTOMER or RIDER only, never ADMIN) and login.
// Riders start INACTIVE (pending admin approval) and OFFLINE.
// Customers start ACTIVE as before.
const bcrypt = require("bcryptjs");
const { User } = require("../../models");
const { signToken } = require("../utils/tokens");
const { fail } = require("../utils/errors");

// 11-digit Nigerian mobile number, e.g. 08030000000.
const NG_PHONE_RE = /^0\d{10}$/;

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, phone: user.phone };
}

async function register(req, res) {
  const { name, email, password, phone, role, vehicleType, plateNumber } = req.body;

  const exists = await User.findOne({ where: { email } });
  if (exists) fail(409, "Email already registered");

  const digits = String(phone).replace(/\D/g, "");
  if (!NG_PHONE_RE.test(digits)) fail(400, "Enter a valid 11-digit Nigerian phone number.");

  const isRider = role === "RIDER";
  if (isRider && !vehicleType) fail(400, "Vehicle type is required for riders.");

  const user = await User.create({
    name: name.trim(),
    email: email.trim(),
    phone: digits,
    passwordHash: await bcrypt.hash(password, 10),
    role: isRider ? "RIDER" : "CUSTOMER",
    status: isRider ? "INACTIVE" : "ACTIVE",
    availability: "OFFLINE",
    ...(isRider && { vehicleType, plateNumber: plateNumber?.trim() || null }),
  });

  res.status(201).json({ user: publicUser(user), token: signToken(user) });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) fail(401, "Invalid email or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) fail(401, "Invalid email or password");

  if (user.status === "INACTIVE") fail(403, "Your account is pending admin approval");
  if (user.status !== "ACTIVE") fail(403, `Account is ${user.status}`);

  res.json({ user: publicUser(user), token: signToken(user) });
}

module.exports = { register, login };
