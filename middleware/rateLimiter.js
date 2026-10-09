const redis = require("../config/redis");

const LIMIT = 5;          // TEMP lowered for testing
const WINDOW = 15 * 60;     // 15 minutes, in seconds

module.exports = async (req, res, next) => {
  const key = `rate:${req.ip}`;

  const count = await redis.incr(key);          // add 1 (creates key at 1 if new)
  if (count === 1) await redis.expire(key, WINDOW); // start the 15-min timer

  if (count > LIMIT) {
    return res.status(429).json({ error: "Too Many Requests" });
  }
  next();
};