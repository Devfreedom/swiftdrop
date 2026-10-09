// A parcel going from a pickup address to a delivery address.
// customerId is always set; riderId is empty until someone is assigned.
const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const Delivery = sequelize.define(
  "Delivery",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "customer_id",
      references: { model: "users", key: "id" },
    },
    riderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "rider_id",
      references: { model: "users", key: "id" },
    },
    pickupAddress: { type: DataTypes.STRING, allowNull: false, field: "pickup_address" },
    pickupContact: { type: DataTypes.STRING, allowNull: false, field: "pickup_contact" },
    pickupPhone: { type: DataTypes.STRING, allowNull: false, field: "pickup_phone" },
    deliveryAddress: { type: DataTypes.STRING, allowNull: false, field: "delivery_address" },
    deliveryContact: { type: DataTypes.STRING, allowNull: false, field: "delivery_contact" },
    deliveryPhone: { type: DataTypes.STRING, allowNull: false, field: "delivery_phone" },
    packageDescription: { type: DataTypes.TEXT, allowNull: false, field: "package_description" },
    packageWeightKg: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: "package_weight_kg" },
    deliveryFee: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "delivery_fee" },
    status: {
      type: DataTypes.ENUM(
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
    cancelReason: { type: DataTypes.TEXT, allowNull: true, field: "cancel_reason" },
    assignedAt: { type: DataTypes.DATE, allowNull: true, field: "assigned_at" },
    pickedUpAt: { type: DataTypes.DATE, allowNull: true, field: "picked_up_at" },
    deliveredAt: { type: DataTypes.DATE, allowNull: true, field: "delivered_at" },
    cancelledAt: { type: DataTypes.DATE, allowNull: true, field: "cancelled_at" },
  },
  { tableName: "deliveries", underscored: true }
);

module.exports = Delivery;
