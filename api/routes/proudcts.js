import express from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/auth.js";
import {
  createProduct,
  listMyProducts,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "../controllers/productController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(requireAdmin);

router.post("/", createProduct);
router.get("/", listMyProducts);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/image", upload.single("image"), uploadProductImage);

export default router;