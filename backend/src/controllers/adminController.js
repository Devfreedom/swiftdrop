// Admin: platform totals, user management, all deliveries, payments + refunds.
const bcrypt = require("bcryptjs");
const { User, Delivery, Payment, sequelize } = require("../../models");
const { fail } = require("../utils/errors");

const CANCELLABLE = ["PENDING", "CONFIRMED", "ASSIGNED"];

async function stats(req, res) {
  const [usersByRole, deliveriesByStatus, availability, money] = await Promise.all([
    User.findAll({ attributes: ["role", [sequelize.fn("COUNT", sequelize.col("id")), "count"]], group: ["role"] }),
    Delivery.findAll({ attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]], group: ["status"] }),
    User.findAll({ where: { role: "RIDER" }, attributes: ["availability", [sequelize.fn("COUNT", sequelize.col("id")), "count"]], group: ["availability"] }),
    Payment.findAll({ where: { status: "SUCCESSFUL" }, attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "revenue"], [sequelize.fn("COUNT", sequelize.col("id")), "count"]] }),
  ]);
  res.json({ usersByRole, deliveriesByStatus, ridersByAvailability: availability, successfulPayments: money[0] });
}

async function listUsers(req, res) {
  const where = {};
  if (req.query.role) {
    if (!["CUSTOMER", "RIDER", "ADMIN"].includes(req.query.role)) fail(400, "Unknown role filter");
    where.role = req.query.role;
  }
  if (req.query.status) {
    if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(req.query.status)) fail(400, "Unknown status filter");
    where.status = req.query.status;
  }
  const users = await User.findAll({
    where,
    attributes: { exclude: ["passwordHash"] },
    order: [["createdAt", "DESC"]],
  });
  res.json({ users });
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body; // RIDER or ADMIN (validated in route)

  const exists = await User.findOne({ where: { email } });
  if (exists) fail(409, "Email already registered");

  const user = await User.create({
    name, email, role,
    passwordHash: await bcrypt.hash(password, 10),
    status: "ACTIVE",
    availability: "OFFLINE",
  });
  const { passwordHash, ...safe } = user.toJSON();
  res.status(201).json({ user: safe });
}

async function setUserStatus(req, res) {
  const user = await User.findByPk(req.params.id);
  if (!user) fail(404, "User not found");
  if (user.id === req.user.id) fail(422, "You cannot change your own status");

  user.status = req.body.status; // ACTIVE, INACTIVE or SUSPENDED (validated in route)
  await user.save();
  const { passwordHash, ...safe } = user.toJSON();
  res.json({ user: safe });
}

async function listDeliveries(req, res) {
  const where = {};
  if (req.query.status) {
    const ok = ["PENDING", "CONFIRMED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"];
    if (!ok.includes(req.query.status)) fail(400, "Unknown status filter");
    where.status = req.query.status;
  }
  if (req.query.riderId) where.riderId = req.query.riderId;
  if (req.query.customerId) where.customerId = req.query.customerId;

  const deliveries = await Delivery.findAll({
    where,
    order: [["createdAt", "DESC"]],
    include: [
      { association: "customer", attributes: ["id", "name", "email"] },
      { association: "rider", attributes: ["id", "name", "phone"] },
    ],
  });
  res.json({ deliveries });
}

async function confirmDelivery(req, res) {
  const delivery = await Delivery.findByPk(req.params.id);
  if (!delivery) fail(404, "Delivery not found");
  if (delivery.status !== "PENDING") {
    fail(422, `Only PENDING deliveries can be confirmed (is ${delivery.status})`);
  }
  delivery.status = "CONFIRMED";
  await delivery.save();
  res.json({ delivery });
}

// Assign one AVAILABLE rider. Both writes happen in one transaction.
async function assignDelivery(req, res) {
  const result = await sequelize.transaction(async (t) => {
    const delivery = await Delivery.findByPk(req.params.id, { transaction: t });
    if (!delivery) fail(404, "Delivery not found");
    if (delivery.status !== "CONFIRMED" || delivery.riderId) {
      fail(422, "Only unassigned CONFIRMED deliveries can be assigned");
    }

    const rider = await User.findByPk(req.body.riderId, { transaction: t });
    if (!rider || rider.role !== "RIDER") fail(404, "Rider not found");
    if (rider.status !== "ACTIVE") fail(422, `Rider account is ${rider.status}`);
    if (rider.availability !== "AVAILABLE") {
      fail(409, `Rider is ${rider.availability}, only AVAILABLE riders can be assigned`);
    }

    delivery.riderId = rider.id;
    delivery.status = "ASSIGNED";
    delivery.assignedAt = new Date();
    await delivery.save({ transaction: t });

    rider.availability = "BUSY";
    await rider.save({ transaction: t });

    return delivery;
  });
  res.json({ delivery: result });
}

async function cancelDelivery(req, res) {
  const delivery = await Delivery.findByPk(req.params.id);
  if (!delivery) fail(404, "Delivery not found");
  if (!CANCELLABLE.includes(delivery.status)) {
    fail(422, `Cannot cancel a ${delivery.status} delivery`);
  }

  await sequelize.transaction(async (t) => {
    delivery.status = "CANCELLED";
    delivery.cancelReason = req.body.reason || "Cancelled by admin";
    delivery.cancelledAt = new Date();
    await delivery.save({ transaction: t });

    if (delivery.riderId) {
      const rider = await User.findByPk(delivery.riderId, { transaction: t });
      rider.availability = "AVAILABLE";
      await rider.save({ transaction: t });
    }
  });
  res.json({ delivery });
}

async function listPayments(req, res) {
  const where = {};
  if (req.query.status) {
    const ok = ["PENDING", "SUCCESSFUL", "FAILED", "REFUNDED"];
    if (!ok.includes(req.query.status)) fail(400, "Unknown status filter");
    where.status = req.query.status;
  }
  const payments = await Payment.findAll({
    where,
    order: [["createdAt", "DESC"]],
    include: [{ association: "delivery", attributes: ["id", "status", "customerId"] }],
  });
  res.json({ payments });
}

// Refund only a SUCCESSFUL payment (usually after a cancellation).
async function refundPayment(req, res) {
  const payment = await Payment.findByPk(req.params.id);
  if (!payment) fail(404, "Payment not found");
  if (payment.status !== "SUCCESSFUL") {
    fail(422, `Only SUCCESSFUL payments can be refunded (is ${payment.status})`);
  }
  payment.status = "REFUNDED";
  await payment.save();
  res.json({ payment });
}

module.exports = {
  stats, listUsers, createUser, setUserStatus,
  listDeliveries, confirmDelivery, assignDelivery, cancelDelivery,
  listPayments, refundPayment,
};
