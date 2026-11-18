import express from "express";
import { customerRegister, customerLogin, me } from "../controllers/authController.js";
import { adminRegister, adminLogin, adminMe } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/auth.js";
import { authLimiter, emailLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/customer/register", authLimiter, customerRegister);
router.post("/customer/login", authLimiter, emailLimiter, customerLogin);
router.get("/me", me);

router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);
router.get("/admin/me", requireAdmin, adminMe);

export default router;