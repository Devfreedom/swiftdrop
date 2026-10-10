// Customer deliveries: create, list own, read own, cancel own (pre-pickup),
// pay (simulated), and list payments for own deliveries.
const { Delivery, Payment, User, sequelize } = require("../../models");
const { fail } = require("../utils/errors");
const { calculateDeliveryFee, resolveWeightKg } = require("../utils/pricing");

const DELIVERY_STATUSES = ["PENDING", "CONFIRMED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"];

// customers can cancel only before the rider picks the parcel up
const CANCELLABLE = ["PENDING", "CONFIRMED", "ASSIGNED"];

async function createDelivery(req, res) {
  // Price integrity: any fee sent by the client is ignored. The fee is always
  // calculated server-side from the package weight (defaults to 1 kg).
  const { deliveryFee, ...body } = req.body;
  const weightKg = resolveWeightKg(body.packageWeightKg);
  const delivery = await Delivery.create({
    ...body,
    packageWeightKg: weightKg,
    deliveryFee: calculateDeliveryFee(weightKg),
    customerId: req.user.id,
  });
  res.status(201).json({ delivery });
}

async function listMine(req, res) {
  const where = { customerId: req.user.id };
  if (req.query.status) {
    if (!DELIVERY_STATUSES.includes(req.query.status)) fail(400, "Unknown status filter");
    where.status = req.query.status;
  }
  const deliveries = await Delivery.findAll({
    where,
    order: [["createdAt", "DESC"]],
    include: [{ association: "rider", attributes: ["id", "name", "phone"] }],
  });
  res.json({ deliveries });
}

async function getOne(req, res) {
  const delivery = await Delivery.findOne({
    where: { id: req.params.id, customerId: req.user.id },
    include: [
      { association: "rider", attributes: ["id", "name", "phone"] },
      { association: "payments" },
    ],
  });
  if (!delivery) fail(404, "Delivery not found");
  res.json({ delivery });
}

async function cancelMine(req, res) {
  const delivery = await Delivery.findOne({
    where: { id: req.params.id, customerId: req.user.id },
  });
  if (!delivery) fail(404, "Delivery not found");
  if (!CANCELLABLE.includes(delivery.status)) {
    fail(422, `Cannot cancel a ${delivery.status} delivery`);
  }

  await sequelize.transaction(async (t) => {
    delivery.status = "CANCELLED";
    delivery.cancelReason = req.body.reason || "Cancelled by customer";
    delivery.cancelledAt = new Date();
    await delivery.save({ transaction: t });

    if (delivery.riderId) {
      const rider = await User.findByPk(delivery.riderId, { transaction: t });
      rider.availability = "AVAILABLE"; // freed: never picked up
      await rider.save({ transaction: t });
    }
  });

  res.json({ delivery });
}

// Payment recording: CARD/TRANSFER are instant (SUCCESSFUL), CASH stays
// PENDING until an admin confirms collection. The DB index blocks a second
// SUCCESSFUL payment for the same delivery.
async function pay(req, res) {
  const delivery = await Delivery.findOne({
    where: { id: req.params.id, customerId: req.user.id },
  });
  if (!delivery) fail(404, "Delivery not found");
  if (delivery.status === "CANCELLED") fail(422, "Cannot pay for a cancelled delivery");
  if (delivery.status === "DELIVERED") fail(422, "Delivery already completed");

  const existing = await Payment.findOne({
    where: { deliveryId: delivery.id, status: ["SUCCESSFUL", "PENDING"] },
  });
  if (existing) {
    fail(409, existing.status === "SUCCESSFUL"
      ? "This delivery is already paid"
      : "A payment for this delivery is already pending");
  }

  const ref = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const payment = await Payment.create({
    deliveryId: delivery.id,
    amount: delivery.deliveryFee,
    method: req.body.method,
    status: req.body.method === "CASH" ? "PENDING" : "SUCCESSFUL",
    transactionRef: ref,
  });

  res.status(201).json({ payment });
}

async function listMyPayments(req, res) {
  const mine = await Delivery.findAll({
    where: { customerId: req.user.id },
    attributes: ["id"],
  });
  const payments = await Payment.findAll({
    where: { deliveryId: mine.map((d) => d.id) },
    order: [["createdAt", "DESC"]],
    include: [{ association: "delivery", attributes: ["id", "status", "deliveryFee"] }],
  });
  res.json({ payments });
}

module.exports = { createDelivery, listMine, getOne, cancelMine, pay, listMyPayments };
