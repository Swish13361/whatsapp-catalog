
import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import { listOrders, getOrder, updateStatus, markPaid } from "../controllers/orderAdminController.js";

const router = express.Router();

router.use(requireAdmin);

router.get("/", listOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", updateStatus);
router.patch("/:id/paid", markPaid);

export default router;