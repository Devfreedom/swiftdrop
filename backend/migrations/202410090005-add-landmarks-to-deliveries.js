// Adds optional landmark hints to deliveries (e.g. "opposite the mall gate")
// so riders can find the exact pickup and drop-off spots.
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("deliveries", "pickup_landmark", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("deliveries", "delivery_landmark", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("deliveries", "delivery_landmark");
    await queryInterface.removeColumn("deliveries", "pickup_landmark");
  },
};
