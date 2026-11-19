import crypto from "crypto";
import mongoose from "mongoose";
import Product from "../models/product.js";
import Order from "../models/order.js";
import config, { isUsdtWalletConfigured } from "../config/index.js";
import { findSingleStore } from "../services/singleStore.js";

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
  await Promise.all(
    reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } }))
  );
}

export async function createOrder(req, res) {
  const reserved = [];
  let order;
  try {
    const { customerName, customerEmail, deliveryAddress, notes, items } = req.body;

    if (!isText(customerName, 80)) return res.status(400).json({ error: "Your name is required" });
    if (
      !isText(customerEmail, 254) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
    ) {
      return res.status(400).json({ error: "Enter a valid email address for delivery" });
    }
    if (!isOptText(deliveryAddress, 200) || !isOptText(notes, 300)) {
      return res.status(400).json({ error: "Address or notes too long" });
    }

    if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
      return res.status(400).json({ error: "Your cart must have 1 to 30 items" });
    }

    const method = req.body.paymentMethod;
    if (method !== "USDT") {
      return res.status(400).json({ error: "Invalid payment method" });
    }
    const paymentNetwork = req.body.paymentNetwork;
    if (method === "USDT" && paymentNetwork !== "TRC20" && paymentNetwork !== "BEP20" && paymentNetwork !== "BINANCE") {
      return res.status(400).json({ error: "Choose a supported USDT network" });
    }
    if (method === "USDT" && !isUsdtWalletConfigured(paymentNetwork)) {
      return res.status(503).json({ error: `USDT payments on ${paymentNetwork} do not have a valid wallet address configured yet` });
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

    const { merchant, status, error } = await findSingleStore();
    if (!merchant) return res.status(status).json({ error });

    // Only this merchant's active products count
    const products = await Product.find({
      _id: { $in: [...wanted.keys()] },
      merchant: merchant._id,
      isActive: true,
    });
    if (products.length !== wanted.size) {
      return res.status(400).json({ error: "One or more items are no longer available" });
    }
    if (products.some((product) => (product.currency || "KES") !== "USD")) {
      return res.status(409).json({ error: "This cart contains products still priced in KES. The shop must update those prices to USD before checkout." });
    }
    // Reserve stock atomically in parallel: the update only succeeds if enough is left
    const reserveResults = await Promise.all(
      products.map(async (p) => {
        const qty = wanted.get(String(p._id));
        if (p.stock === null || p.stock === undefined) return { success: true, id: p._id, qty: 0 }; // unlimited
        const result = await Product.updateOne(
          { _id: p._id, stock: { $gte: qty } },
          { $inc: { stock: -qty } }
        );
        if (result.modifiedCount !== 1) {
          return { success: false, id: p._id, qty, name: p.name };
        }
        return { success: true, id: p._id, qty };
      })
    );
 
    const failed = reserveResults.find((r) => !r.success);
    if (failed) {
      // Rollback successful reservations
      await Promise.all(
        reserveResults
          .filter((r) => r.success && r.qty > 0)
          .map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } }))
      );
      return res.status(409).json({ error: `Not enough stock for ${failed.name}` });
    }
 
    reserved.push(...reserveResults.filter((r) => r.qty > 0).map((r) => ({ id: r.id, qty: r.qty })));

    const lines = products.map((p) => ({
      product: p._id,
      name: p.name,
      price: p.price,
      quantity: wanted.get(String(p._id)),
    }));
    const totalCents = lines.reduce((sum, line) => sum + Math.round(line.price * 100) * line.quantity, 0);
    const total = totalCents / 100;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        order = await Order.create({
          merchant: merchant._id,
          orderCode: makeOrderCode(merchant.slug),
          customerName,
          customerEmail: customerEmail.trim().toLowerCase(),
          deliveryAddress: deliveryAddress || undefined,
          notes: notes || undefined,
          items: lines,
          total,
          currency: "USD",
          paymentMethod: method,
          ...(method === "USDT" && {
            paymentNetwork,
            paymentAddress: config.usdtWallets[paymentNetwork],
          }),
        });
        break;
      } catch (err) {
        if (err.code === 11000 && attempt < 4) continue; // order code collision, retry
        throw err;
      }
    }

    res.status(201).json({
      orderCode: order.orderCode,
      total: order.total,
      currency: order.currency,
      items: order.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      paymentMethod: method,
      ...(method === "USDT" && {
        paymentNetwork: order.paymentNetwork,
        paymentAddress: order.paymentAddress,
        cryptoAmount: order.total,
      }),
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
