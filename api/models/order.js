import mongoose from "mongoose";
 
const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 100 },
  },
  { _id: false }
);
 
const orderSchema = new mongoose.Schema(
  {
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant", required: true, index: true },
    orderCode: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true, maxlength: 80 },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    customerPhone: { type: String, match: /^254(7|1)\d{8}$/ },
    deliveryAddress: { type: String, trim: true, maxlength: 200 },
    notes: { type: String, trim: true, maxlength: 300 },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["USD", "KES"] },
    status: {
      type: String,
      enum: ["NEW", "PREPARING", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"],
      default: "NEW",
    },
    paymentMethod: { type: String, enum: ["PAY_ON_DELIVERY", "MPESA", "USDT", "ALIPAY", "BANK_TRANSFER"], default: "PAY_ON_DELIVERY" },
    paymentNetwork: { type: String, enum: ["TRC20", "BEP20", "BINANCE", "ALIPAY", "BANK"] },
    paymentAddress: String,
    paymentReference: String,
    paymentStatus: { type: String, enum: ["UNPAID", "PAID"], default: "UNPAID" },
    checkoutIds: { type: [String], index: true },
    paymentAttempts: { type: Number, default: 0 },
    paymentNote: String,
    mpesaReceipt: String,
  },
  { timestamps: true }
);
 
orderSchema.index({ merchant: 1, status: 1, createdAt: -1 });
orderSchema.index({ merchant: 1, paymentStatus: 1, createdAt: -1 });
 
export default mongoose.model("Order", orderSchema);