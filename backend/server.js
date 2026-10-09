// Entry point. Connects to Postgres, then listens.
// Uses process.env.PORT so hosting platforms can set it.
require("dotenv").config();
const app = require("./src/app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Postgres connected");

    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  } catch (err) {
    console.error("Could not start server:", err.message);
    process.exit(1);
  }
})();
