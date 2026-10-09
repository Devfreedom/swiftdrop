require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const redis = require("./config/redis");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const rateLimiter = require("./middleware/rateLimiter");

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "API is running" }));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  await redis.connect();
  console.log("Redis connected");

  app.use(rateLimiter);

  const subscriber = redis.duplicate(); // a subscriber needs its own connection
  await subscriber.connect();
  await subscriber.subscribe("new-post", (message) => {
    console.log("New post event received:", JSON.parse(message));
  });

  app.use(
    session({
      store: new RedisStore({ client: redis }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 30, httpOnly: true }, // 30 minutes
    })
  );

  app.use("/auth", require("./routes/auth"));
  app.use("/posts", require("./routes/posts.js"));
  app.use("/stats", require("./routes/stats"));

  app.listen(3000, () => console.log("Running on 3000"));
})();