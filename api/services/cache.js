import redis from "./redis.js";

const VERSION_KEY = "cache:products:version";

async function version() {
  try {
    return (await redis.get(VERSION_KEY)) || "1";
  } catch {
    return "1";
  }
}

async function productsKey(suffix) {
  return `products:${await version()}:${suffix}`;
}

async function bustProducts() {
  try {
    await redis.incr(VERSION_KEY);
  } catch (err) {
    console.error("cache bust failed:", err.message);
  }
}

async function cached(key, ttlSeconds, loader) {
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit);
  } catch (err) {
    console.error("cache read failed:", err.message);
  }

  const data = await loader();

  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch (err) {
    console.error("cache write failed:", err.message);
  }
  return data;
}

export { cached, productsKey, bustProducts };