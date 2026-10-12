// Latest live point for one delivery (one row per delivery, upserted).
// Deleted when the delivery ends. Coordinates are never logged anywhere.
const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const RiderLocation = sequelize.define(
  "RiderLocation",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    deliveryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "delivery_id",
      references: { model: "deliveries", key: "id" },
    },
    riderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "rider_id",
      references: { model: "users", key: "id" },
    },
    lat: { type: DataTypes.DECIMAL(9, 6), allowNull: false },
    lng: { type: DataTypes.DECIMAL(9, 6), allowNull: false },
    accuracy: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    heading: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    speed: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    recordedAt: { type: DataTypes.DATE, allowNull: false, field: "recorded_at" },
  },
  { tableName: "rider_locations", underscored: true }
);

module.exports = RiderLocation;
