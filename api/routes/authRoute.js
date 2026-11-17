import express from "express";
import rateLimit from "express-rate-limit";
import { customerRegister, customerLogin, me } from "../controllers/authController.js";
import { adminRegister, adminLogin, adminMe } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/customer/register", limiter, customerRegister);
router.post("/customer/login", limiter, customerLogin);
router.get("/me", me);

router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);
router.get("/admin/me", requireAdmin, adminMe);

export default router;