import express from "express";
import rateLimit from "express-rate-limit";
import requireAuth from "../middleware/auth.js";
import { register, login, me } from "../controllers/authController.js";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", limiter, register);
router.post("/login", limiter, login);
router.get("/me", requireAuth, me);

export default router;