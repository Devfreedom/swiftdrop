// Blocks anyone whose role is not listed. Always use AFTER auth.
// Example: requireRole("ADMIN") or requireRole("RIDER", "ADMIN")
const { fail } = require("../utils/errors");

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) fail(403, "You cannot access this");
    next();
  };
}

module.exports = requireRole;
