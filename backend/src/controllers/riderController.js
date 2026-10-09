// Rider job flow: toggle availability, see open jobs, accept one,
// then move it one step at a time to DELIVERED.
const { Delivery, User, sequelize } = require("../../models");
const { fail } = require("../utils/errors");
const { ACTIVE_RIDER_STATUSES } = require("../utils/transitions");

// the only step a rider may take from each status
const RIDER_NEXT = {
  ASSIGNED: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
};

async function setAvailability(req, res) {
  const { availability } = req.body; // AVAILABLE or OFFLINE (BUSY is system-managed)

  if (availability === "BUSY") fail(422, "BUSY is set automatically by assignments");

  if (availability === "OFFLINE") {
    const active = await Delivery.count({
      where: { riderId: req.user.id, status: ACTIVE_RIDER_STATUSES },
    });
    if (active > 0) fail(409, "Finish or hand over your active delivery first");
  }

  req.user.availability = availability;
  await req.user.save();
  res.json({ availability: req.user.availability });
}

// open jobs: confirmed, nobody assigned yet. Only AVAILABLE riders see them.
async function listAvailable(req, res) {
  if (req.user.availability !== "AVAILABLE") {
    fail(403, "Go AVAILABLE to see open jobs");
  }
  const deliveries = await Delivery.findAll({
    where: { status: "CONFIRMED", riderId: null },
    order: [["createdAt", "ASC"]], // oldest first: fair queue
  });
  res.json({ deliveries });
}

// my current jobs (still holding the parcel)
async function listAssigned(req, res) {
  const deliveries = await Delivery.findAll({
    where: { riderId: req.user.id, status: ACTIVE_RIDER_STATUSES },
    order: [["createdAt", "ASC"]],
  });
  res.json({ deliveries });
}

// finished jobs
async function history(req, res) {
  const deliveries = await Delivery.findAll({
    where: { riderId: req.user.id, status: ["DELIVERED", "CANCELLED"] },
    order: [["createdAt", "DESC"]],
  });
  res.json({ deliveries });
}

// claim an open job. Rider must be AVAILABLE; becomes BUSY in one transaction.
async function accept(req, res) {
  if (req.user.availability !== "AVAILABLE") {
    fail(409, "You must be AVAILABLE to accept a delivery");
  }

  const result = await sequelize.transaction(async (t) => {
    const delivery = await Delivery.findOne({
      where: { id: req.params.id, status: "CONFIRMED", riderId: null },
      transaction: t,
    });
    if (!delivery) fail(404, "Open delivery not found (taken or no longer open)");

    delivery.riderId = req.user.id;
    delivery.status = "ASSIGNED";
    delivery.assignedAt = new Date();
    await delivery.save({ transaction: t });

    req.user.availability = "BUSY";
    await req.user.save({ transaction: t });

    return delivery;
  });

  res.json({ delivery: result });
}

// move own delivery exactly one step forward, stamping each milestone.
// DELIVERED frees the rider back to AVAILABLE.
async function updateStatus(req, res) {
  const { status } = req.body;

  const delivery = await Delivery.findOne({
    where: { id: req.params.id, riderId: req.user.id },
  });
  if (!delivery) fail(404, "Delivery not found in your jobs");

  const expected = RIDER_NEXT[delivery.status];
  if (!expected) fail(422, `A ${delivery.status} delivery cannot be updated`);
  if (status !== expected) {
    fail(422, `Invalid jump: next step is ${expected}, not ${status}`);
  }

  await sequelize.transaction(async (t) => {
    delivery.status = status;
    if (status === "PICKED_UP") delivery.pickedUpAt = new Date();
    if (status === "DELIVERED") {
      delivery.deliveredAt = new Date();
      req.user.availability = "AVAILABLE"; // job done, free again
      await req.user.save({ transaction: t });
    }
    await delivery.save({ transaction: t });
  });

  res.json({ delivery });
}

module.exports = { setAvailability, listAvailable, listAssigned, history, accept, updateStatus };
