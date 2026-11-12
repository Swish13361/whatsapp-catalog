import Merchant from "../models/Merchant.js";
import Product from "../models/Product.js";

export async function getStorefront(req, res) {
  try {
    const merchant = await Merchant.findOne({
      slug: req.params.slug.toLowerCase(),
      isActive: true,
    }).select("businessName slug whatsappNumber");

    if (!merchant) return res.status(404).json({ error: "Store not found" });

    const products = await Product.find({ merchant: merchant._id, isActive: true })
      .select("name description price imageUrl stock")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      store: {
        businessName: merchant.businessName,
        slug: merchant.slug,
        whatsappNumber: merchant.whatsappNumber,
      },
      products: products.map(({ stock, ...p }) => ({
        ...p,
        inStock: stock === null || stock > 0,
      })),
    });
  } catch (err) {
    console.error("Storefront error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}