// One payment row per delivery: two SUCCESSFUL, one FAILED attempt as
// history, one REFUNDED (cancelled order). Delivery 1 has no payment yet.
"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert("payments", [
      { delivery_id: 3, amount: 32.0, method: "CARD", status: "SUCCESSFUL", transaction_ref: "TXN-SEED-0003", created_at: now, updated_at: now },
      { delivery_id: 4, amount: 15.0, method: "TRANSFER", status: "SUCCESSFUL", transaction_ref: "TXN-SEED-0004", created_at: now, updated_at: now },
      { delivery_id: 5, amount: 45.0, method: "CARD", status: "SUCCESSFUL", transaction_ref: "TXN-SEED-0005", created_at: now, updated_at: now },
      { delivery_id: 2, amount: 18.5, method: "CARD", status: "FAILED", transaction_ref: "TXN-SEED-0002", created_at: now, updated_at: now },
      { delivery_id: 6, amount: 12.0, method: "TRANSFER", status: "REFUNDED", transaction_ref: "TXN-SEED-0006", created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("payments", {
      transaction_ref: ["TXN-SEED-0002", "TXN-SEED-0003", "TXN-SEED-0004", "TXN-SEED-0005", "TXN-SEED-0006"],
    });
  },
};
