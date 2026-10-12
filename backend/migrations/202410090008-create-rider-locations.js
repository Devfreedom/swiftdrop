// Latest live point per delivery only (delivery_id is unique): every new
// ping upserts the same row, so there is no location history to clean up.
// The row is deleted when the delivery ends (DELIVERED or CANCELLED).
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rider_locations", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      delivery_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: "deliveries", key: "id" },
        onDelete: "CASCADE",
      },
      rider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      lat: { type: Sequelize.DECIMAL(9, 6), allowNull: false },
      lng: { type: Sequelize.DECIMAL(9, 6), allowNull: false },
      accuracy: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      heading: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
      speed: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      recorded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("rider_locations", ["rider_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("rider_locations");
  },
};
