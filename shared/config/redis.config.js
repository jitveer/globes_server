const Redis = require("ioredis");
const logger = require("../utils/logger.util");

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  logger.info("✅ Redis Connected");
});

redis.on("error", (err) => {
  logger.error("❌ Redis Error:", err);
});
module.exports = redis;
