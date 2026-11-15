import crypto from "crypto";
import mongoose from "mongoose";
import Merchant from "../models/merchant.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import { formatPhone } from "../utils/phone.js";
import { buildWhatsAppUrl } from "../utils/whatsapp.js";
import config from "../config/index.js";
import { startStkPush } from "../services/payment.js";

const CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O or 1/I confusion

function makeOrderCode(slug) {
  const prefix = slug.replace(/[^a-z0-9]/g, "").slice(0, 3).toUpperCase() || "ORD";
  let tail = "";
  for (let i = 0; i < 5; i++) tail += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
  return `${prefix}-${tail}`;
}

const isText = (v, max) => typeof v === "string" && v.trim().length > 0 && v.trim().length <= max;
const isOptText = (v, max) =>
  v === undefined || v === null || v === "" || (typeof v === "string" && v.trim().length <= max);

async function releaseStock(reserved) {
  while (reserved.length > 0) {
    const r = reserved[reserved.length - 1];
    await Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } });
    reserved.pop();
  }
}

export async function createOrder(req, res) {
  const reserved = [];
  let order;
  try {
    const { customerName, customerPhone, deliveryAddress, notes, items } = req.body;

    if (!isText(customerName, 80)) return res.status(400).json({ error: "Your name is required" });
    if (!isOptText(deliveryAddress, 200) || !isOptText(notes, 300)) {
      return res.status(400).json({ error: "Address or notes too long" });
    }

    let phone;
    try {
      phone = formatPhone(customerPhone);
    } catch {
      return res.status(400).json({ error: "Please enter a valid Kenyan phone number" });
    }

    if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
      return res.status(400).json({ error: "Your cart must have 1 to 30 items" });
    }

    const method = req.body.paymentMethod ?? "PAY_ON_DELIVERY";
    if (method !== "PAY_ON_DELIVERY" && method !== "MPESA") {
      return res.status(400).json({ error: "Invalid payment method" });
    }
    if (method === "MPESA" && !config.mpesaReady) {
      return res.status(400).json({ error: "M-Pesa payment is not available for this store yet" });
    }

    // Merge duplicates and validate every item. Prices from the client are ignored.
    const wanted = new Map();
    for (const it of items) {
      if (
        !it ||
        typeof it.productId !== "string" ||
        !mongoose.isValidObjectId(it.productId) ||
        !Number.isInteger(it.quantity) ||
        it.quantity < 1 ||
        it.quantity > 100
      ) {
        return res.status(400).json({ error: "Invalid item in cart" });
      }
      const total = (wanted.get(it.productId) || 0) + it.quantity;
      if (total > 100) return res.status(400).json({ error: "Quantity too large" });
      wanted.set(it.productId, total);
    }

    const merchant = await Merchant.findOne({ slug: req.params.slug.toLowerCase(), isActive: true });
    if (!merchant) return res.status(404).json({ error: "Store not found" });

    // Only this merchant's active products count
    const products = await Product.find({
      _id: { $in: [...wanted.keys()] },
      merchant: merchant._id,
      isActive: true,
    });
    if (products.length !== wanted.size) {
      return res.status(400).json({ error: "One or more items are no longer available" });
    }
    const preTotal = products.reduce((s, p) => s + p.price * wanted.get(String(p._id)), 0);
    if (method === "MPESA" && preTotal < 1) {
      return res.status(400).json({ error: "This order total cannot be paid with M-Pesa" });
    }

    // Reserve stock atomically: the update only succeeds if enough is left
    for (const p of products) {
      const qty = wanted.get(String(p._id));
      if (p.stock === null || p.stock === undefined) continue; // unlimited
      const result = await Product.updateOne(
        { _id: p._id, stock: { $gte: qty } },
        { $inc: { stock: -qty } }
      );
      if (result.modifiedCount !== 1) {
        await releaseStock(reserved);
        return res.status(409).json({ error: `Not enough stock for ${p.name}` });
      }
      reserved.push({ id: p._id, qty });
    }

    const lines = products.map((p) => ({
      product: p._id,
      name: p.name,
      price: p.price,
      quantity: wanted.get(String(p._id)),
    }));
    const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        order = await Order.create({
          merchant: merchant._id,
          orderCode: makeOrderCode(merchant.slug),
          customerName,
          customerPhone: phone,
          deliveryAddress: deliveryAddress || undefined,
          notes: notes || undefined,
          items: lines,
          total,
          paymentMethod: method,
          paymentAttempts: method === "MPESA" ? 1 : 0,
        });
        break;
      } catch (err) {
        if (err.code === 11000 && attempt < 4) continue; // order code collision, retry
        throw err;
      }
    }

    let paymentStarted = false;
    if (method === "MPESA") {
      try {
        await startStkPush(merchant, order);
        paymentStarted = true;
      } catch (err) {
        console.error("STK push failed:", err.response?.data || err.message);
      }
    }

    res.status(201).json({
      orderCode: order.orderCode,
      total: order.total,
      items: order.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      paymentMethod: method,
      paymentStarted,
      // For M-Pesa orders the WhatsApp link comes from the status endpoint once paid
      ...(method === "PAY_ON_DELIVERY" && { whatsappUrl: buildWhatsAppUrl({ merchant, order }) }),
    });
  } catch (err) {
    if (!order) {
      try {
        await releaseStock(reserved);
      } catch (rollbackError) {
        console.error("Stock rollback failed:", rollbackError.message);
      }
    }
    console.error("Create order error:", err.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
