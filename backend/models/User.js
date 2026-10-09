// One table for every account. The role column decides what they can do.
// availability only matters for riders; everyone else stays OFFLINE.
const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false, field: "password_hash" },
    role: {
      type: DataTypes.ENUM("CUSTOMER", "RIDER", "ADMIN"),
      allowNull: false,
      defaultValue: "CUSTOMER",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "SUSPENDED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    phone: { type: DataTypes.STRING, allowNull: true },
    availability: {
      type: DataTypes.ENUM("AVAILABLE", "BUSY", "OFFLINE"),
      allowNull: false,
      defaultValue: "OFFLINE",
    },
  },
  { tableName: "users", underscored: true }
);

module.exports = User;
