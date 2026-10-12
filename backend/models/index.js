// Loads all models and wires up their associations in one place.
const sequelize = require("../src/config/database");
const User = require("./User");
const Delivery = require("./Delivery");
const Payment = require("./Payment");
const RiderLocation = require("./RiderLocation");

// a customer places many deliveries; a rider is assigned many deliveries
// (camelCase names here: underscored:true maps them to snake_case columns)
User.hasMany(Delivery, { as: "customerDeliveries", foreignKey: "customerId" });
User.hasMany(Delivery, { as: "riderDeliveries", foreignKey: "riderId" });
Delivery.belongsTo(User, { as: "customer", foreignKey: "customerId" });
Delivery.belongsTo(User, { as: "rider", foreignKey: "riderId" });

// a delivery can have several payment attempts, but only one SUCCESSFUL one
Delivery.hasMany(Payment, { as: "payments", foreignKey: "deliveryId" });
Payment.belongsTo(Delivery, { as: "delivery", foreignKey: "deliveryId" });

// at most one live rider point per delivery (upserted, deleted on completion)
Delivery.hasOne(RiderLocation, { as: "riderLocation", foreignKey: "deliveryId" });
RiderLocation.belongsTo(Delivery, { as: "delivery", foreignKey: "deliveryId" });
RiderLocation.belongsTo(User, { as: "rider", foreignKey: "riderId" });

module.exports = { sequelize, User, Delivery, Payment, RiderLocation };
