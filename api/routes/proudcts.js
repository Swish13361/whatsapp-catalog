import express from "express";
import requireAuth from "../middleware/auth.js";
import {
  createProduct,
  listMyProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", createProduct);
router.get("/", listMyProducts);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;