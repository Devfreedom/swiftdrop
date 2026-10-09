// Loads all models and wires up their associations in one place.
const sequelize = require("../src/config/database");
const User = require("./User");
const Delivery = require("./Delivery");
const Payment = require("./Payment");

// a customer places many deliveries; a rider is assigned many deliveries
User.hasMany(Delivery, { as: "customerDeliveries", foreignKey: "customer_id" });
User.hasMany(Delivery, { as: "riderDeliveries", foreignKey: "rider_id" });
Delivery.belongsTo(User, { as: "customer", foreignKey: "customer_id" });
Delivery.belongsTo(User, { as: "rider", foreignKey: "rider_id" });

// a delivery can have several payment attempts, but only one SUCCESSFUL one
Delivery.hasMany(Payment, { as: "payments", foreignKey: "delivery_id" });
Payment.belongsTo(Delivery, { as: "delivery", foreignKey: "delivery_id" });

module.exports = { sequelize, User, Delivery, Payment };
