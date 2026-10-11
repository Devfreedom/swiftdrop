// Public, read-only platform stats for the landing page.
// No authentication, no personal data — aggregate counts only.
// Results are cached in memory for 60 seconds.
const { Op } = require("sequelize");
const { User, Delivery } = require("../../models");

const CACHE_MS = 60 * 1000;
let cached = null;
let cachedAt = 0;

async function stats(req, res, next) {
  try {
    if (cached && Date.now() - cachedAt < CACHE_MS) return res.json(cached);

    const [totalDeliveries, completedDeliveries, inProgressDeliveries, availableRiders, activeRiders, customers] =
      await Promise.all([
        Delivery.count(),
        Delivery.count({ where: { status: "DELIVERED" } }),
        Delivery.count({ where: { status: { [Op.in]: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"] } } }),
        User.count({ where: { role: "RIDER", status: "ACTIVE", availability: "AVAILABLE" } }),
        User.count({ where: { role: "RIDER", status: "ACTIVE" } }),
        User.count({ where: { role: "CUSTOMER" } }),
      ]);

    cached = {
      totalDeliveries,
      completedDeliveries,
      inProgressDeliveries,
      availableRiders,
      activeRiders,
      customers,
    };
    cachedAt = Date.now();
    res.json(cached);
  } catch (e) {
    next(e);
  }
}

module.exports = { stats };
