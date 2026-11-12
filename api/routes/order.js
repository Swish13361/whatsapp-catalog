import express from "express";
import requireAuth from "../middleware/auth.js";
import { createOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", requireAuth, createOrder);

export default router;