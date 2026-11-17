import mongoose from "mongoose";
import Product from "../models/product.js";

// Only these fields can ever be set from the request body
function cleanProduct(body, partial = false) {
  const data = {};

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) return { error: "Name is required" };
    data.name = body.name.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string") return { error: "Invalid description" };
    data.description = body.description.trim();
  }

  if (!partial && body.category === undefined) {
    data.category = "Other";
  } else if (body.category !== undefined) {
    if (typeof body.category !== "string" || body.category.trim().length > 40) {
      return { error: "Category must be a text value up to 40 characters" };
    }
    data.category = body.category.trim() || "Other";
  }

  if (!partial || body.price !== undefined) {
    if (
      typeof body.price !== "number" ||
      !Number.isFinite(body.price) ||
      body.price < 0 ||
      body.price > 10000000 ||
      Math.abs(Math.round(body.price * 100) - body.price * 100) > 1e-8
    ) {
      return { error: "Price must be a number with up to two decimals between 0 and 10,000,000" };
    }
    data.price = Math.round(body.price * 100) / 100;
  }

  if (!partial && body.currency === undefined) {
    data.currency = "USD";
  } else if (body.currency !== undefined) {
    if (body.currency !== "USD" && body.currency !== "KES") {
      return { error: "Currency must be USD or KES" };
    }
    data.currency = body.currency;
  }

  if (body.imageUrl !== undefined) {
    if (typeof body.imageUrl !== "string" || (body.imageUrl && !body.imageUrl.startsWith("https://"))) {
      return { error: "Image link must start with https://" };
    }
    data.imageUrl = body.imageUrl;
  }

  if (body.stock !== undefined) {
    if (body.stock !== null && (!Number.isInteger(body.stock) || body.stock < 0)) {
      return { error: "Stock must be a whole number, or null for unlimited" };
    }
    data.stock = body.stock;
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") return { error: "isActive must be true or false" };
    data.isActive = body.isActive;
  }

  return { data };
}

export async function createProduct(req, res) {
  try {
    const { data, error } = cleanProduct(req.body);
    if (error) return res.status(400).json({ error });

    const product = await Product.create({ ...data, merchant: req.merchant._id });
    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function listMyProducts(req, res) {
  try {
    const products = await Product.find({ merchant: req.merchant._id }).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    console.error("List products error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function updateProduct(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid product id" });

    const { data, error } = cleanProduct(req.body, true);
    if (error) return res.status(400).json({ error });
    if (Object.keys(data).length === 0) return res.status(400).json({ error: "Nothing to update" });

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, merchant: req.merchant._id },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("Update product error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function deleteProduct(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid product id" });

    const product = await Product.findOneAndDelete({ _id: req.params.id, merchant: req.merchant._id });
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ deleted: true });
  } catch (err) {
    console.error("Delete product error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}