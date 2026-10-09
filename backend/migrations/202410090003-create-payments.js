// Creates the payments table. One row per attempt, so failed tries
// stay visible as history. transaction_ref is unique per payment.
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      delivery_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "deliveries", key: "id" },
        onDelete: "RESTRICT",
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      method: {
        type: Sequelize.ENUM("CASH", "CARD", "TRANSFER"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "SUCCESSFUL", "FAILED", "REFUNDED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      transaction_ref: { type: Sequelize.STRING, allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("payments", ["delivery_id"]);
    await queryInterface.addIndex("payments", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("payments");
  },
};
