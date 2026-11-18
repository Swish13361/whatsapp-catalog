import express from "express";
import { getStorefront } from "../controllers/storeFrontController.js";
import { createOrder } from "../controllers/orderController.js";
import { orderStatus, submitUsdtReference, submitAlipayReference, submitBankReference } from "../controllers/paymentController.js";
import { globalLimiter, orderLimiter, paymentStatusLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.get("/", globalLimiter, getStorefront);
router.get("/:legacySlug", globalLimiter, getStorefront);
router.post("/orders", orderLimiter, createOrder);
router.post("/:legacySlug/orders", orderLimiter, createOrder);
router.get("/orders/:orderCode/status", paymentStatusLimiter, orderStatus);
router.get("/:legacySlug/orders/:orderCode/status", paymentStatusLimiter, orderStatus);
router.post("/orders/:orderCode/payment-reference", paymentStatusLimiter, submitUsdtReference);
router.post("/:legacySlug/orders/:orderCode/payment-reference", paymentStatusLimiter, submitUsdtReference);
router.post("/orders/:orderCode/alipay-reference", paymentStatusLimiter, submitAlipayReference);
router.post("/:legacySlug/orders/:orderCode/alipay-reference", paymentStatusLimiter, submitAlipayReference);
router.post("/orders/:orderCode/bank-reference", paymentStatusLimiter, submitBankReference);
router.post("/:legacySlug/orders/:orderCode/bank-reference", paymentStatusLimiter, submitBankReference);

export default router;