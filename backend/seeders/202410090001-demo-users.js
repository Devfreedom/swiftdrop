// Demo accounts only. Every password is "Password123!" hashed with bcrypt.
// 1 admin, 3 riders (mixed availability), 3 customers (one suspended to
// demo the login block).
"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("Password123!", 10);
    const now = new Date();

    await queryInterface.bulkInsert("users", [
      { name: "Site Admin", email: "admin@demo.local", password_hash: passwordHash, role: "ADMIN", status: "ACTIVE", phone: "0200000001", availability: "OFFLINE", created_at: now, updated_at: now },
      { name: "Kwame Rider", email: "kwame@demo.local", password_hash: passwordHash, role: "RIDER", status: "ACTIVE", phone: "0200000002", availability: "BUSY", created_at: now, updated_at: now },
      { name: "Yaw Rider", email: "yaw@demo.local", password_hash: passwordHash, role: "RIDER", status: "ACTIVE", phone: "0200000003", availability: "BUSY", created_at: now, updated_at: now },
      { name: "Efua Rider", email: "efua@demo.local", password_hash: passwordHash, role: "RIDER", status: "ACTIVE", phone: "0200000004", availability: "AVAILABLE", created_at: now, updated_at: now },
      { name: "Ama Customer", email: "ama@demo.local", password_hash: passwordHash, role: "CUSTOMER", status: "ACTIVE", phone: "0200000005", availability: "OFFLINE", created_at: now, updated_at: now },
      { name: "Kofi Customer", email: "bob@demo.local", password_hash: passwordHash, role: "CUSTOMER", status: "ACTIVE", phone: "0200000006", availability: "OFFLINE", created_at: now, updated_at: now },
      { name: "Blocked Customer", email: "blocked@demo.local", password_hash: passwordHash, role: "CUSTOMER", status: "SUSPENDED", phone: "0200000007", availability: "OFFLINE", created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: [
        "admin@demo.local",
        "kwame@demo.local",
        "yaw@demo.local",
        "efua@demo.local",
        "ama@demo.local",
        "bob@demo.local",
        "blocked@demo.local",
      ],
    });
  },
};
