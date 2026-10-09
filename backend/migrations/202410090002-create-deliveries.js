// Creates the deliveries table. customer_id always set, rider_id empty
// until assignment. RESTRICT keeps history: you cannot delete a user
// who still has deliveries.
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("deliveries", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
      },
      rider_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
      },
      pickup_address: { type: Sequelize.STRING, allowNull: false },
      pickup_contact: { type: Sequelize.STRING, allowNull: false },
      pickup_phone: { type: Sequelize.STRING, allowNull: false },
      delivery_address: { type: Sequelize.STRING, allowNull: false },
      delivery_contact: { type: Sequelize.STRING, allowNull: false },
      delivery_phone: { type: Sequelize.STRING, allowNull: false },
      package_description: { type: Sequelize.TEXT, allowNull: false },
      package_weight_kg: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      delivery_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: {
        type: Sequelize.ENUM(
          "PENDING",
          "CONFIRMED",
          "ASSIGNED",
          "PICKED_UP",
          "IN_TRANSIT",
          "DELIVERED",
          "CANCELLED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },
      cancel_reason: { type: Sequelize.TEXT, allowNull: true },
      assigned_at: { type: Sequelize.DATE, allowNull: true },
      picked_up_at: { type: Sequelize.DATE, allowNull: true },
      delivered_at: { type: Sequelize.DATE, allowNull: true },
      cancelled_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("deliveries", ["customer_id"]);
    await queryInterface.addIndex("deliveries", ["rider_id"]);
    await queryInterface.addIndex("deliveries", ["status"]);
    await queryInterface.addIndex("deliveries", ["created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("deliveries");
  },
};
