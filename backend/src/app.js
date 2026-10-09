// Express app. Routes for auth/deliveries/riders/admin land here in later phases.
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// health check: proves the server and (via db check in server.js) the DB are up
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// unknown route under /api
app.use("/api", (req, res) => {
  res.status(404).json({ error: { message: "Route not found" } });
});

// central error handler goes last
app.use(errorHandler);

module.exports = app;
