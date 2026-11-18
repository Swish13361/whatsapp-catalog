import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const client = createClient({ url: redisUrl });

client.on("error", (err) => console.error("Redis client error:", err));

let connected = false;

export async function getRedis() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
}

export async function closeRedis() {
  if (connected) {
    await client.quit();
    connected = false;
  }
}