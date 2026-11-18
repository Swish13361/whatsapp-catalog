import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { getRedis } from "../services/redis.js";

let redisClient = null;

export async function initRateLimiters() {
  redisClient = await getRedis();
}

const noUser = (req) => !req.user?.id;

function createLimiter({ name, windowMs, limit, message, keyGenerator, skip, skipSuccessfulRequests }) {
  if (!redisClient) {
    throw new Error("Rate limiters not initialized. Call initRateLimiters() first.");
  }
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    passOnStoreError: true,
    keyGenerator,
    skip,
    skipSuccessfulRequests,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: `rl:${name}:`,
    }),
    handler: (req, res) =>
      res.status(429).json({ message: message || "Too many requests. Please try again in a moment." }),
  });
}

export const globalLimiter = createLimiter({
  name: "global",
  windowMs: 60_000,
  limit: 120,
  skip: (req) => req.path.startsWith("/webhooks"),
});

export const authLimiter = createLimiter({
  name: "auth",
  windowMs: 15 * 60_000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many attempts. Try again in 15 minutes.",
});

export const emailLimiter = createLimiter({
  name: "email",
  windowMs: 15 * 60_000,
  limit: 5,
  skipSuccessfulRequests: true,
  skip: (req) => !req.body?.email,
  keyGenerator: (req) => String(req.body.email).trim().toLowerCase(),
  message: "Too many attempts for this account. Try again in 15 minutes.",
});

export const orderLimiter = createLimiter({
  name: "orders",
  windowMs: 60_000,
  limit: 10,
  skip: noUser,
  keyGenerator: (req) => String(req.user.id),
});

export const paymentStatusLimiter = createLimiter({
  name: "paystatus",
  windowMs: 60_000,
  limit: 30,
  skip: noUser,
  keyGenerator: (req) => String(req.user.id),
});

export const adminLimiter = createLimiter({
  name: "admin",
  windowMs: 60_000,
  limit: 120,
  skip: noUser,
  keyGenerator: (req) => String(req.user.id),
});