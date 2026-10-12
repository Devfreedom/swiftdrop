// Live rider points: the assigned rider pushes (upsert, latest point only),
// the delivery's customer, rider and admins read. The row is deleted when
// the delivery ends. Coordinates are never logged.
const { Delivery, RiderLocation } = require("../../models");
const { fail } = require("../utils/errors");

// Sharing is only possible while the rider is holding (or about to hold)
// the parcel.
const SHARING_STATUSES = ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"];
const ENDED_STATUSES = ["DELIVERED", "CANCELLED"];
const RATE_LIMIT_MS = 3000;
const STALE_MS = 60 * 1000;

function publicPoint(row) {
  return {
    id: row.id,
    deliveryId: row.deliveryId,
    riderId: row.riderId,
    lat: Number(row.lat),
    lng: Number(row.lng),
    accuracy: row.accuracy === null || row.accuracy === undefined ? null : Number(row.accuracy),
    heading: row.heading === null || row.heading === undefined ? null : Number(row.heading),
    speed: row.speed === null || row.speed === undefined ? null : Number(row.speed),
    recordedAt: row.recordedAt,
  };
}

// POST /deliveries/:id/location (rider only, own active job).
async function postLocation(req, res) {
  const { lat, lng, accuracy, heading, speed } = req.body; // ranges checked in route

  const delivery = await Delivery.findOne({
    where: { id: req.params.id, riderId: req.user.id },
  });
  if (!delivery) fail(404, "Delivery not found in your jobs");
  if (!SHARING_STATUSES.includes(delivery.status)) {
    fail(422, `Location sharing is only available while a delivery is active (is ${delivery.status})`);
  }

  const prev = await RiderLocation.findOne({ where: { deliveryId: delivery.id } });
  if (prev && Date.now() - new Date(prev.recordedAt).getTime() < RATE_LIMIT_MS) {
    fail(429, "Location update arrived too soon — slow down");
  }

  const row = prev || RiderLocation.build({ deliveryId: delivery.id, riderId: req.user.id });
  row.lat = lat;
  row.lng = lng;
  row.accuracy = accuracy ?? null;
  row.heading = heading ?? null;
  row.speed = speed ?? null;
  row.recordedAt = new Date();
  await row.save();

  res.json({ location: publicPoint(row) });
}

// GET /deliveries/:id/location (that customer, that rider, admins).
async function getLocation(req, res) {
  const delivery = await Delivery.findByPk(req.params.id);
  if (!delivery) fail(404, "Delivery not found");
  const mine =
    req.user.role === "ADMIN" ||
    delivery.customerId === req.user.id ||
    delivery.riderId === req.user.id;
  if (!mine) fail(404, "Delivery not found");
  if (ENDED_STATUSES.includes(delivery.status)) return res.json({ location: null });

  const row = await RiderLocation.findOne({ where: { deliveryId: delivery.id } });
  if (!row) return res.json({ location: null });

  const stale = Date.now() - new Date(row.recordedAt).getTime() > STALE_MS;
  res.json({ location: publicPoint(row), stale });
}

module.exports = { postLocation, getLocation, SHARING_STATUSES };
