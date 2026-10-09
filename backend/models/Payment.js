// One row per payment attempt. Failed attempts stay as history;
// the partial unique index (see migrations) guarantees at most one
// SUCCESSFUL payment per delivery.
const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    deliveryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "delivery_id",
      references: { model: "deliveries", key: "id" },
    },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    method: {
      type: DataTypes.ENUM("CASH", "CARD", "TRANSFER"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "SUCCESSFUL", "FAILED", "REFUNDED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    transactionRef: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "transaction_ref",
    },
  },
  { tableName: "payments", underscored: true }
);

module.exports = Payment;
