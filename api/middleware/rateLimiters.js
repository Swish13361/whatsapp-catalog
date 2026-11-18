import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../services/redis.js";

const redisClient = redis;
const limiters = {};

  const noUser = (req) => !req.user?.id;

  function createLimiter({ name, windowMs, limit, message, keyGenerator, skip, skipSuccessfulRequests }) {
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

  limiters.globalLimiter = createLimiter({
    name: "global",
    windowMs: 60_000,
    limit: 120,
    skip: (req) => req.path.startsWith("/webhooks"),
  });

  limiters.authLimiter = createLimiter({
    name: "auth",
    windowMs: 15 * 60_000,
    limit: 10,
    skipSuccessfulRequests: true,
    message: "Too many attempts. Try again in 15 minutes.",
  });

  limiters.emailLimiter = createLimiter({
    name: "email",
    windowMs: 15 * 60_000,
    limit: 5,
    skipSuccessfulRequests: true,
    skip: (req) => !req.body?.email,
    keyGenerator: (req) => String(req.body.email).trim().toLowerCase(),
    message: "Too many attempts for this account. Try again in 15 minutes.",
  });

  limiters.orderLimiter = createLimiter({
    name: "orders",
    windowMs: 60_000,
    limit: 10,
    skip: noUser,
    keyGenerator: (req) => String(req.user.id),
  });

  limiters.paymentStatusLimiter = createLimiter({
    name: "paystatus",
    windowMs: 60_000,
    limit: 30,
    skip: noUser,
    keyGenerator: (req) => String(req.user.id),
  });

  limiters.adminLimiter = createLimiter({
    name: "admin",
    windowMs: 60_000,
    limit: 120,
    skip: noUser,
    keyGenerator: (req) => String(req.user.id),
  });
}

export function getLimiter(name) {
  if (!limiters[name]) {
    throw new Error(`Rate limiter "${name}" not initialized. Call initRateLimiters() first.`);
  }
  return limiters[name];
}

export const globalLimiter = (req, res, next) => getLimiter("globalLimiter")(req, res, next);
export const authLimiter = (req, res, next) => getLimiter("authLimiter")(req, res, next);
export const emailLimiter = (req, res, next) => getLimiter("emailLimiter")(req, res, next);
export const orderLimiter = (req, res, next) => getLimiter("orderLimiter")(req, res, next);
export const paymentStatusLimiter = (req, res, next) => getLimiter("paymentStatusLimiter")(req, res, next);
export const adminLimiter = (req, res, next) => getLimiter("adminLimiter")(req, res, next);