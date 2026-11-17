import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  createProduct,
  listMyProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.use(requireAdmin);

router.post("/", createProduct);
router.get("/", listMyProducts);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;