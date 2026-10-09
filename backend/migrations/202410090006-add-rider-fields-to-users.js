// Rider signup fields: vehicle type + plate number. Nullable so older
// rows (seeded riders, created before signup existed) stay valid.
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "vehicle_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("users", "plate_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "plate_number");
    await queryInterface.removeColumn("users", "vehicle_type");
  },
};
