// Location routes only: POST/GET /deliveries/:id/location.
// Runs against an isolated Postgres (DATABASE_URL overridden below) with
// tables synced fresh. Needs JWT_SECRET from .env (loaded, never printed).
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");

require("dotenv").config();
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || "postgresql://devuser@127.0.0.1:5434/delivery_platform_test";

const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const { sequelize, User, Delivery, RiderLocation } = require("../models");

const sign = (u) =>
  jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

async function makeUser({ role, status = "ACTIVE", availability = "OFFLINE" }) {
  const tag = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return User.create({
    name: `${role} ${tag}`,
    email: `${role.toLowerCase()}-${tag}@test.local`,
    passwordHash: await bcrypt.hash("Password123!", 10),
    role,
    status,
    phone: "0200000000",
    availability,
  });
}

const ADDRESS = {
  pickupAddress: "Ring Road Central",
  pickupContact: "Ama",
  pickupPhone: "0200000005",
  deliveryAddress: "Cantonments",
  deliveryContact: "Kofi",
  deliveryPhone: "0200000006",
  packageDescription: "Test parcel",
};

let admin, rider, otherRider, customer, otherCustomer;
let deliveryId;

before(async () => {
  await sequelize.sync({ force: true });
  [admin, rider, otherRider, customer, otherCustomer] = await Promise.all([
    makeUser({ role: "ADMIN" }),
    makeUser({ role: "RIDER", availability: "AVAILABLE" }),
    makeUser({ role: "RIDER", availability: "AVAILABLE" }),
    makeUser({ role: "CUSTOMER" }),
    makeUser({ role: "CUSTOMER" }),
  ]);

  // customer creates with pins, admin confirms + assigns the rider
  const created = await request(app)
    .post("/api/deliveries")
    .set("Authorization", `Bearer ${sign(customer)}`)
    .send({ ...ADDRESS, pickupLat: 5.6037, pickupLng: -0.187, dropoffLat: 5.61, dropoffLng: -0.17 });
  assert.equal(created.status, 201);
  assert.equal(created.body.delivery.pickupLat, "5.603700");
  deliveryId = created.body.delivery.id;

  const confirmed = await request(app)
    .patch(`/api/admin/deliveries/${deliveryId}/confirm`)
    .set("Authorization", `Bearer ${sign(admin)}`);
  assert.equal(confirmed.status, 200);

  const assigned = await request(app)
    .post(`/api/admin/deliveries/${deliveryId}/assign`)
    .set("Authorization", `Bearer ${sign(admin)}`)
    .send({ riderId: rider.id });
  assert.equal(assigned.status, 200);
});

after(async () => {
  await sequelize.close();
});

describe("POST /api/deliveries/:id/location (rider)", () => {
  it("rider posts a point, upsert keeps one row", async () => {
    const r1 = await request(app)
      .post(`/api/deliveries/${deliveryId}/location`)
      .set("Authorization", `Bearer ${sign(rider)}`)
      .send({ lat: 5.604, lng: -0.186 });
    assert.equal(r1.status, 200);
    assert.equal(r1.body.location.lat, 5.604);
    const count = await RiderLocation.count({ where: { deliveryId } });
    assert.equal(count, 1);
  });

  it("rejects a second update within 3 seconds (429)", async () => {
    const r = await request(app)
      .post(`/api/deliveries/${deliveryId}/location`)
      .set("Authorization", `Bearer ${sign(rider)}`)
      .send({ lat: 5.605, lng: -0.185 });
    assert.equal(r.status, 429);
  });

  it("rejects invalid coordinates (400)", async () => {
    for (const body of [
      { lat: 95, lng: 0 },
      { lat: 0, lng: -181 },
      { lat: "5.6", lng: 0 },
      { lng: 0 },
    ]) {
      const r = await request(app)
        .post(`/api/deliveries/${deliveryId}/location`)
        .set("Authorization", `Bearer ${sign(rider)}`)
        .send(body);
      assert.equal(r.status, 400, JSON.stringify(body));
    }
  });

  it("wrong rider gets 404, customer gets 403, no token gets 401", async () => {
    const wrong = await request(app)
      .post(`/api/deliveries/${deliveryId}/location`)
      .set("Authorization", `Bearer ${sign(otherRider)}`)
      .send({ lat: 5.6, lng: -0.18 });
    assert.equal(wrong.status, 404);

    const cust = await request(app)
      .post(`/api/deliveries/${deliveryId}/location`)
      .set("Authorization", `Bearer ${sign(customer)}`)
      .send({ lat: 5.6, lng: -0.18 });
    assert.equal(cust.status, 403);

    const anon = await request(app)
      .post(`/api/deliveries/${deliveryId}/location`)
      .send({ lat: 5.6, lng: -0.18 });
    assert.equal(anon.status, 401);
  });

  it("suspended rider is blocked (403)", async () => {
    await rider.update({ status: "SUSPENDED" });
    const r = await request(app)
      .post(`/api/deliveries/${deliveryId}/location`)
      .set("Authorization", `Bearer ${sign(rider)}`)
      .send({ lat: 5.6, lng: -0.18 });
    assert.equal(r.status, 403);
    await rider.update({ status: "ACTIVE" });
  });
});

describe("GET /api/deliveries/:id/location", () => {
  it("customer reads the point with a stale flag", async () => {
    const r = await request(app)
      .get(`/api/deliveries/${deliveryId}/location`)
      .set("Authorization", `Bearer ${sign(customer)}`);
    assert.equal(r.status, 200);
    assert.equal(typeof r.body.location.lat, "number");
    assert.equal(typeof r.body.stale, "boolean");
  });

  it("reports stale when older than 60s", async () => {
    await RiderLocation.update(
      { recordedAt: new Date(Date.now() - 120 * 1000) },
      { where: { deliveryId } }
    );
    const r = await request(app)
      .get(`/api/deliveries/${deliveryId}/location`)
      .set("Authorization", `Bearer ${sign(customer)}`);
    assert.equal(r.status, 200);
    assert.equal(r.body.stale, true);
  });

  it("wrong customer and wrong rider get 404", async () => {
    const c = await request(app)
      .get(`/api/deliveries/${deliveryId}/location`)
      .set("Authorization", `Bearer ${sign(otherCustomer)}`);
    assert.equal(c.status, 404);
    const r = await request(app)
      .get(`/api/deliveries/${deliveryId}/location`)
      .set("Authorization", `Bearer ${sign(otherRider)}`);
    assert.equal(r.status, 404);
  });

  it("returns { location: null } once DELIVERED and deletes the row", async () => {
    for (const status of ["PICKED_UP", "IN_TRANSIT", "DELIVERED"]) {
      const adv = await request(app)
        .patch(`/api/rider/deliveries/${deliveryId}/status`)
        .set("Authorization", `Bearer ${sign(rider)}`)
        .send({ status });
      assert.equal(adv.status, 200, status);
    }
    const left = await RiderLocation.count({ where: { deliveryId } });
    assert.equal(left, 0);
    const r = await request(app)
      .get(`/api/deliveries/${deliveryId}/location`)
      .set("Authorization", `Bearer ${sign(customer)}`);
    assert.equal(r.status, 200);
    assert.equal(r.body.location, null);
  });
});
