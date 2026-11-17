import express from "express";
import rateLimit from "express-rate-limit";
import {
  orderStatus,
  stkCallback,
  submitAlipayReference,
  submitBankReference,
  submitUsdtReference,
} from "../controllers/paymentController.js";

const router = express.Router();
const viewLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
const payLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

// No rate limit: Safaricom must always get through
router.post("/stk/:secret", stkCallback);

// USDT reference submission (works for TRC20, BEP20, BINANCE - all use 64-char hex hash)
router.post("/orders/:orderCode/payment-reference", payLimiter, submitUsdtReference);

// Alipay reference submission
router.post("/orders/:orderCode/alipay-reference", payLimiter, submitAlipayReference);

// Bank transfer reference submission
router.post("/orders/:orderCode/bank-reference", payLimiter, submitBankReference);

// Order status check (includes payment details for all methods)
router.get("/orders/:orderCode/status", viewLimiter, orderStatus);

export default router;