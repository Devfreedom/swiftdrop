// Partial unique index: at most one SUCCESSFUL payment per delivery.
// Failed attempts are ignored by the index, so retries stay possible.
"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex("payments", ["delivery_id"], {
      name: "payments_one_successful_per_delivery",
      unique: true,
      where: { status: "SUCCESSFUL" },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "payments",
      "payments_one_successful_per_delivery"
    );
  },
};
