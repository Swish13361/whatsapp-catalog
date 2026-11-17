import express from "express";
import rateLimit from "express-rate-limit";
import { getStorefront } from "../controllers/storeFrontController.js";
import { createOrder } from "../controllers/orderController.js";
import { orderStatus, submitUsdtReference, submitAlipayReference, submitBankReference } from "../controllers/paymentController.js";

const router = express.Router();

const viewLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
const orderLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false });
const payLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

router.get("/", viewLimiter, getStorefront);
router.get("/:legacySlug", viewLimiter, getStorefront);
router.post("/orders", orderLimiter, createOrder);
router.post("/:legacySlug/orders", orderLimiter, createOrder);
router.get("/orders/:orderCode/status", viewLimiter, orderStatus);
router.get("/:legacySlug/orders/:orderCode/status", viewLimiter, orderStatus);
router.post("/orders/:orderCode/payment-reference", payLimiter, submitUsdtReference);
router.post("/:legacySlug/orders/:orderCode/payment-reference", payLimiter, submitUsdtReference);
router.post("/orders/:orderCode/alipay-reference", payLimiter, submitAlipayReference);
router.post("/:legacySlug/orders/:orderCode/alipay-reference", payLimiter, submitAlipayReference);
router.post("/orders/:orderCode/bank-reference", payLimiter, submitBankReference);
router.post("/:legacySlug/orders/:orderCode/bank-reference", payLimiter, submitBankReference);

export default router;