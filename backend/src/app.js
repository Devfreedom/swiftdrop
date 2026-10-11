// Express app. Routes for auth/deliveries/riders/admin land here in later phases.
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// CORS: production frontend URL from CLIENT_URL, plus localhost for local dev.
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// health check: proves the server and (via db check in server.js) the DB are up
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", require("./routes/public")); // /api/stats (public, no auth)
app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/users")); // /api/me
app.use("/api/deliveries", require("./routes/deliveries"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api", require("./routes/rider")); // /api/rider/...
app.use("/api/admin", require("./routes/admin"));

// unknown route under /api
app.use("/api", (req, res) => {
  res.status(404).json({ error: { message: "Route not found" } });
});

// central error handler goes last
app.use(errorHandler);

module.exports = app;
