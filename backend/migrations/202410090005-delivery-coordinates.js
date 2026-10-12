// Optional pickup/drop-off coordinates on deliveries. All nullable so
// existing and seeded deliveries (address-only) keep working unchanged.
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("deliveries", "pickup_lat", {
      type: Sequelize.DECIMAL(9, 6),
      allowNull: true,
    });
    await queryInterface.addColumn("deliveries", "pickup_lng", {
      type: Sequelize.DECIMAL(9, 6),
      allowNull: true,
    });
    await queryInterface.addColumn("deliveries", "dropoff_lat", {
      type: Sequelize.DECIMAL(9, 6),
      allowNull: true,
    });
    await queryInterface.addColumn("deliveries", "dropoff_lng", {
      type: Sequelize.DECIMAL(9, 6),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("deliveries", "dropoff_lng");
    await queryInterface.removeColumn("deliveries", "dropoff_lat");
    await queryInterface.removeColumn("deliveries", "pickup_lng");
    await queryInterface.removeColumn("deliveries", "pickup_lat");
  },
};
