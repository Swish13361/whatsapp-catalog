import express from "express";
import rateLimit from "express-rate-limit";
import { getStorefront } from "../controllers/storeFrontController.js";
import { createOrder } from "../controllers/orderController.js";

const router = express.Router();

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
 const orderLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false })

router.get("/:slug", limiter, getStorefront);
router.post("/:slug/orders", orderLimiter, createOrder);

export default router;