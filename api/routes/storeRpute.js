import express from "express";
import rateLimit from "express-rate-limit";
import { getStorefront } from "../controllers/storeFrontController.js";
import { createOrder } from "../controllers/orderController.js";
import { orderStatus, retryPayment } from "../controllers/paymentController.js";

const router = express.Router();

const viewLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
const orderLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false });
const payLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

router.get("/:slug", viewLimiter, getStorefront);
router.post("/:slug/orders", orderLimiter, createOrder);
router.get("/:slug/orders/:orderCode/status", viewLimiter, orderStatus);
router.post("/:slug/orders/:orderCode/pay", payLimiter, retryPayment);

export default router;