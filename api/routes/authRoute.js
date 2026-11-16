import express from "express";
import rateLimit from "express-rate-limit";
import requireAuth from "../middleware/auth.js";
import { register, login, me, checkSlugAvailability } from "../controllers/authController.js";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const slugAvailabilityLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/slug/:slug/available", slugAvailabilityLimiter, checkSlugAvailability);
router.post("/register", limiter, register);
router.post("/login", limiter, login);
router.get("/me", requireAuth, me);

export default router;