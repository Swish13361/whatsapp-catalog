import crypto from "crypto";
import config from "../config/index.js";
import Merchant from "../models/merchant.js";
import Order from "../models/order.js";
import { getCredentials } from "../mpesa/credentials.js";
import { stkQuery } from "../mpesa/client.js";
import { startStkPush } from "../services/payment.js";
import { buildWhatsAppUrl } from "../utils/whatsapp.js";

const MAX_ATTEMPTS = 3;

function secretOk(given) {
  const a = Buffer.from(String(given));
  const b = Buffer.from(String(config.stkCallbackSecret || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const note = (id, text) =>
  Order.updateOne({ _id: id, paymentStatus: "UNPAID" }, { $set: { paymentNote: text.slice(0, 200) } });

async function processCallback(body) {
  const cb = body?.Body?.stkCallback;
  if (!cb || typeof cb.CheckoutRequestID !== "string") return;

  // Only orders we created can be updated. Unknown IDs are ignored.
  const order = await Order.findOne({ checkoutIds: cb.CheckoutRequestID });
  if (!order) {
    console.warn("STK callback for unknown payment:", cb.CheckoutRequestID);
    return;
  }
  if (order.paymentStatus === "PAID") return; // never change a confirmed payment

  // Failed or cancelled: record why, but keep the order open for a retry
  if (cb.ResultCode !== 0) {
    await note(order._id, String(cb.ResultDesc || "Payment failed"));
    return;
  }

  const items = cb.CallbackMetadata?.Item || [];
  const get = (n) => items.find((i) => i.Name === n)?.Value;
  const amount = Number(get("Amount"));
  const receipt = String(get("MpesaReceiptNumber") || "");

  if (amount !== order.total) {
    console.warn("Amount mismatch on", order.orderCode, amount, order.total);
    await note(order._id, `Amount mismatch: paid ${amount}, expected ${order.total}. Check M-Pesa statement.`);
    return;
  }

  // Cancelled order that was paid anyway: money arrived, so flag it for a refund
  if (order.status === "CANCELLED") {
    await note(order._id, `Paid KES ${amount} (${receipt}) after cancellation. Refund needed.`);
    return;
  }

  // Ask Safaricom to confirm, unless we're testing in the sandbox
  if (!config.skipVerify) {
    try {
      const merchant = await Merchant.findById(order.merchant);
      const q = await stkQuery(getCredentials(merchant), cb.CheckoutRequestID);
      if (String(q.ResultCode) !== "0") {
        await note(order._id, "Payment could not be confirmed. Check M-Pesa statement.");
        return;
      }
    } catch (err) {
      console.error("Verify failed:", err.response?.data || err.message);
      await note(order._id, "Payment could not be verified. Check M-Pesa statement.");
      return;
    }
  }

  await Order.updateOne(
    { _id: order._id, paymentStatus: "UNPAID", status: { $ne: "CANCELLED" } },
    { $set: { paymentStatus: "PAID", mpesaReceipt: receipt }, $unset: { paymentNote: "" } }
  );
}

export async function stkCallback(req, res) {
  if (!secretOk(req.params.secret)) return res.sendStatus(404);
  try {
    await processCallback(req.body);
  } catch (err) {
    console.error("STK callback error:", err.message);
  }
  // Always acknowledge so Safaricom doesn't keep retrying
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
}

const findStore = (slug) => Merchant.findOne({ slug: String(slug).toLowerCase(), isActive: true });

function cleanCode(code) {
  const c = String(code).trim().toUpperCase();
  return /^[A-Z0-9-]{4,20}$/.test(c) ? c : null;
}

// Public: the checkout page polls this after sending the prompt
export async function orderStatus(req, res) {
  try {
    const merchant = await findStore(req.params.slug);
    const orderCode = cleanCode(req.params.orderCode);
    if (!merchant || !orderCode) return res.status(404).json({ error: "Order not found" });

    const order = await Order.findOne({ merchant: merchant._id, orderCode }).lean();
    if (!order) return res.status(404).json({ error: "Order not found" });

    const showLink = order.paymentMethod === "PAY_ON_DELIVERY" || order.paymentStatus === "PAID";
    res.json({
      orderCode: order.orderCode,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      total: order.total,
      ...(showLink && { whatsappUrl: buildWhatsAppUrl({ merchant, order }) }),
    });
  } catch (err) {
    console.error("Order status error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

// Public: send the prompt again, to the order's own phone number only
export async function retryPayment(req, res) {
  try {
    const merchant = await findStore(req.params.slug);
    const orderCode = cleanCode(req.params.orderCode);
    if (!merchant || !orderCode) return res.status(404).json({ error: "Order not found" });

    // Reserve an attempt atomically, so rapid clicks can't exceed the cap
    const order = await Order.findOneAndUpdate(
      {
        merchant: merchant._id,
        orderCode,
        paymentMethod: "MPESA",
        paymentStatus: "UNPAID",
        status: { $ne: "CANCELLED" },
        paymentAttempts: { $lt: MAX_ATTEMPTS },
      },
      { $inc: { paymentAttempts: 1 } },
      { new: true }
    );
    if (!order) return res.status(409).json({ error: "This order can't be paid again. Please contact the shop." });

    try {
      await startStkPush(merchant, order);
    } catch (err) {
      console.error("Retry STK failed:", err.response?.data || err.message);
      return res.status(502).json({ paymentStarted: false, error: "Couldn't send the M-Pesa prompt. Try again shortly." });
    }

    res.json({ paymentStarted: true });
  } catch (err) {
    console.error("Retry payment error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}
