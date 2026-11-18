import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2 });

redis.on("error", (err) => console.error("redis error:", err.message));

export default redis;