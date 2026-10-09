// Builds the single Sequelize instance used by the app.
// Prefers DATABASE_URL; falls back to the separate DB_* parts.
// Production (NODE_ENV=production) turns on SSL for hosted Postgres.
const { Sequelize } = require("sequelize");

function buildSequelize() {
  const isProd = process.env.NODE_ENV === "production";

  if (process.env.DATABASE_URL) {
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      ...(isProd && {
        dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
      }),
    });
  }

  return new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS || undefined,
    {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      dialect: "postgres",
      logging: false,
    }
  );
}

const sequelize = buildSequelize();

module.exports = sequelize;
