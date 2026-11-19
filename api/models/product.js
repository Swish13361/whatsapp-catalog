import mongoose from "mongoose";
 
const productSchema = new mongoose.Schema(
  {
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    category: { type: String, trim: true, maxlength: 40 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["USD", "KES"] },
    imageUrl: String,
    imageFileId: String,
    stock: { type: Number, default: null, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
 
productSchema.index({ merchant: 1, isActive: 1 });
productSchema.index({ merchant: 1, isActive: 1, createdAt: -1 });
 
export default mongoose.model("Product", productSchema);
