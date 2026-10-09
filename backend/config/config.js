// Config for the Sequelize CLI (migrations and seeders).
// Production uses DATABASE_URL with SSL; dev uses your local Postgres.
require("dotenv").config();

const sslOptions = {
  dialect: "postgres",
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
};

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
  },
  test: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
  },
  production: {
    use_env_variable: "DATABASE_URL",
    ...sslOptions,
  },
};
