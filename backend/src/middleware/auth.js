// Reads the Bearer token, verifies it, loads the user from the DB.
// Suspended/inactive users are blocked here, on EVERY protected request.
const jwt = require("jsonwebtoken");
const { User } = require("../../models");
const { fail } = require("../utils/errors");

async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) fail(401, "Login required");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    fail(401, "Invalid or expired token");
  }

  const user = await User.findByPk(payload.id);
  if (!user) fail(401, "Account no longer exists");
  if (user.status !== "ACTIVE") fail(403, `Account is ${user.status}`);

  req.user = user; // controllers use req.user.id and req.user.role
  next();
}

module.exports = auth;
