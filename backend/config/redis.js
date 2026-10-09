const { createClient } = require("redis");

const redis = createClient({ url: "redis://127.0.0.1:6379" });
redis.on("error", (e) => console.log("Redis error:", e.message));

module.exports = redis;