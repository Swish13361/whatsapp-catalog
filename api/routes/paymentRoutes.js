import express from "express";
import { stkCallback } from "../controllers/paymentController.js";

const router = express.Router();

// No rate limit: Safaricom must always get through
router.post("/stk/:secret", stkCallback);

export default router;