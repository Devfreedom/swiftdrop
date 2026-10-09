// Tiny hand-rolled body validator. Keeps bad input out of every endpoint.
// Rule shape: { field: { required, type: "string"|"number"|"integer", enum: [...], email: true, min: n } }
const { fail } = require("../utils/errors");

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function validate(rules) {
  return (req, res, next) => {
    const body = req.body || {};
    const details = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = body[field];

      if (value === undefined || value === null || value === "") {
        if (rule.required) details.push(`${field} is required`);
        continue;
      }
      if (rule.type === "string" && typeof value !== "string") {
        details.push(`${field} must be text`);
      }
      if (rule.type === "number" && (typeof value !== "number" || Number.isNaN(value))) {
        details.push(`${field} must be a number`);
      }
      if (rule.type === "integer" && !Number.isInteger(value)) {
        details.push(`${field} must be a whole number`);
      }
      if (rule.email && !EMAIL_RE.test(value)) details.push(`${field} must be a valid email`);
      if (rule.min !== undefined && value < rule.min) details.push(`${field} must be at least ${rule.min}`);
      if (rule.enum && !rule.enum.includes(value)) {
        details.push(`${field} must be one of: ${rule.enum.join(", ")}`);
      }
    }

    if (details.length) {
      const err = new Error("Invalid input");
      err.status = 400;
      err.details = details;
      throw err;
    }
    next();
  };
}

module.exports = validate;
