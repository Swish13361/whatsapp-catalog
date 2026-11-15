import mongoose from "mongoose";
import Order from "../models/order.js";
import Product from "../models/product.js";
import { buildCustomerUrl } from "../utils/whatsapp.js";

const STATUSES = ["NEW", "PREPARING", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"];

// Which moves are allowed from each status
const NEXT = {
  NEW: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function listOrders(req, res) {
  try {
    const { status } = req.query;
    if (status !== undefined && (typeof status !== "string" || !STATUSES.includes(status))) {
      return res.status(400).json({ error: "Invalid status filter" });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const filter = { merchant: req.merchant._id, ...(status && { status }) };

    const [orders, total, grouped] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Order.countDocuments(filter),
      Order.aggregate([
        { $match: { merchant: req.merchant._id } },
        { $group: { _id: "$status", n: { $sum: 1 } } },
      ]),
    ]);

    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    for (const g of grouped) counts[g._id] = g.n;

    res.json({ orders, page, limit, total, pages: Math.ceil(total / limit), counts });
  } catch (err) {
    console.error("List orders error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getOrder(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid order id" });

    const order = await Order.findOne({ _id: req.params.id, merchant: req.merchant._id }).lean();
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ order, customerWhatsappUrl: buildCustomerUrl({ merchant: req.merchant, order }) });
  } catch (err) {
    console.error("Get order error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function updateStatus(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid order id" });

    const { status } = req.body;
    if (typeof status !== "string" || !STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findOne({ _id: req.params.id, merchant: req.merchant._id });
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (!NEXT[order.status].includes(status)) {
      return res.status(409).json({ error: `Cannot move an order from ${order.status} to ${status}` });
    }

    // The update only applies if the status is still what we just read,
    // so two simultaneous clicks cannot both succeed
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, merchant: req.merchant._id, status: order.status },
      { $set: { status } },
      { new: true }
    );
    if (!updated) {
      return res.status(409).json({ error: "This order was just changed. Refresh and try again." });
    }

    // Cancelled: put reserved stock back (unlimited products have no number to restore)
    if (status === "CANCELLED") {
      for (const item of updated.items) {
        try {
          await Product.updateOne(
            { _id: item.product, stock: { $type: "number" } },
            { $inc: { stock: item.quantity } }
          );
        } catch (err) {
          console.error("Restock failed for order", updated.orderCode, err.message);
        }
      }
    }

    res.json({
      order: updated,
      customerWhatsappUrl: buildCustomerUrl({ merchant: req.merchant, order: updated }),
    });
  } catch (err) {
    console.error("Update status error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function markPaid(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid order id" });

    const updated = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        merchant: req.merchant._id,
        status: { $ne: "CANCELLED" },
        paymentStatus: "UNPAID",
      },
      { $set: { paymentStatus: "PAID" } },
      { new: true }
    );

    if (!updated) {
      const exists = await Order.exists({ _id: req.params.id, merchant: req.merchant._id });
      return exists
        ? res.status(409).json({ error: "Order is cancelled or already paid" })
        : res.status(404).json({ error: "Order not found" });
    }

    res.json({ order: updated });
  } catch (err) {
    console.error("Mark paid error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}