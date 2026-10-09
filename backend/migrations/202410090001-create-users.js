// Creates the users table. email is unique: no two accounts share one.
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role: {
        type: Sequelize.ENUM("CUSTOMER", "RIDER", "ADMIN"),
        allowNull: false,
        defaultValue: "CUSTOMER",
      },
      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE", "SUSPENDED"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
      phone: { type: Sequelize.STRING, allowNull: true },
      availability: {
        type: Sequelize.ENUM("AVAILABLE", "BUSY", "OFFLINE"),
        allowNull: false,
        defaultValue: "OFFLINE",
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("users", ["role"]);
    await queryInterface.addIndex("users", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
