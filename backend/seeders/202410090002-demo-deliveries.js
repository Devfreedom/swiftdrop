// Sample deliveries in six different statuses. Rider availability matches:
// kwame and yaw each hold one active delivery (BUSY), efua finished hers
// (AVAILABLE), d2 is CONFIRMED but unassigned so riders can claim it.
"use strict";

module.exports = {
  async up(queryInterface) {
    const [users] = await queryInterface.sequelize.query(
      "SELECT id, email FROM users"
    );
    const id = Object.fromEntries(users.map((u) => [u.email, u.id]));
    const now = new Date();

    await queryInterface.bulkInsert("deliveries", [
      {
        id: 1, customer_id: id["ama@demo.local"], rider_id: null,
        pickup_address: "12 Oxford Street, Accra", pickup_contact: "Ama", pickup_phone: "0200000005",
        delivery_address: "5 Independence Ave, Accra", delivery_contact: "Kofi", delivery_phone: "0200000006",
        package_description: "Laptop in padded box", package_weight_kg: 2.5, delivery_fee: 25.0,
        status: "PENDING", created_at: now, updated_at: now,
      },
      {
        id: 2, customer_id: id["ama@demo.local"], rider_id: null,
        pickup_address: "Junction Mall, Nungua", pickup_contact: "Ama", pickup_phone: "0200000005",
        pickup_landmark: "Opposite the mall main gate",
        delivery_address: "Cantonments, Accra", delivery_contact: "Efua", delivery_phone: "0200000004",
        delivery_landmark: "Blue house after the embassy",
        package_description: "Documents envelope", package_weight_kg: 0.3, delivery_fee: 18.5,
        status: "CONFIRMED", created_at: now, updated_at: now,
      },
      {
        id: 3, customer_id: id["bob@demo.local"], rider_id: id["kwame@demo.local"],
        pickup_address: "Accra Mall, Tetteh Quarshie", pickup_contact: "Kofi", pickup_phone: "0200000006",
        delivery_address: "East Legon, Accra", delivery_contact: "Yaw", delivery_phone: "0200000003",
        package_description: "Grocery bags x4", package_weight_kg: 8.0, delivery_fee: 32.0,
        status: "ASSIGNED", assigned_at: now, created_at: now, updated_at: now,
      },
      {
        id: 4, customer_id: id["ama@demo.local"], rider_id: id["yaw@demo.local"],
        pickup_address: "Makola Market, Accra", pickup_contact: "Ama", pickup_phone: "0200000005",
        delivery_address: "Osu, Accra", delivery_contact: "Kofi", delivery_phone: "0200000006",
        package_description: "Fabric rolls x2", package_weight_kg: 5.0, delivery_fee: 15.0,
        status: "PICKED_UP", assigned_at: now, picked_up_at: now, created_at: now, updated_at: now,
      },
      {
        id: 5, customer_id: id["bob@demo.local"], rider_id: id["efua@demo.local"],
        pickup_address: "West Hills Mall, Weija", pickup_contact: "Kofi", pickup_phone: "0200000006",
        pickup_landmark: "Car park B, near the fountain",
        delivery_address: "Dansoman, Accra", delivery_contact: "Ama", delivery_phone: "0200000005",
        delivery_landmark: "Yellow storey building",
        package_description: "Phone accessories box", package_weight_kg: 1.2, delivery_fee: 45.0,
        status: "DELIVERED", assigned_at: now, picked_up_at: now, delivered_at: now,
        created_at: now, updated_at: now,
      },
      {
        id: 6, customer_id: id["ama@demo.local"], rider_id: null,
        pickup_address: "Palace Mall, Spintex", pickup_contact: "Ama", pickup_phone: "0200000005",
        delivery_address: "Tema, Community 25", delivery_contact: "Kofi", delivery_phone: "0200000006",
        package_description: "Shoes return parcel", package_weight_kg: 1.0, delivery_fee: 12.0,
        status: "CANCELLED", cancel_reason: "Customer changed mind", cancelled_at: now,
        created_at: now, updated_at: now,
      },
    ]);

    // keep the id sequence in sync after inserting fixed ids
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('deliveries', 'id'), MAX(id)) FROM deliveries"
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("deliveries", { id: [1, 2, 3, 4, 5, 6] });
  },
};
