import Product from "../models/product.js";
import config, { isUsdtWalletConfigured } from "../config/index.js";
import { findSingleStore } from "../services/singleStore.js";

export async function getStorefront(req, res) {
  try {
    const { merchant, status, error } = await findSingleStore(req.params.legacySlug || undefined);
    if (!merchant) return res.status(status).json({ error });

    const products = await Product.find({ merchant: merchant._id, isActive: true })
      .select("_id name description category price currency imageUrl stock")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      store: {
        businessName: merchant.businessName,
        slug: merchant.slug,
        whatsappNumber: merchant.whatsappNumber,
      },
      paymentOptions: {
        supportedUsdtNetworks: ["TRC20", "BEP20", "BINANCE"],
        usdtNetworks: Object.keys(config.usdtWallets).filter(isUsdtWalletConfigured),
        alipayEnabled: true,
        alipayAccount: config.alipay.accountId,
        bankTransferEnabled: true,
        bankDetails: config.bankTransfer,
      },
      products: products.map(({ stock, ...p }) => ({
        ...p,
        category: p.category || "Other",
        currency: p.currency || "KES",
        inStock: stock === null || stock > 0,
      })),
    });
  } catch (err) {
    console.error("Storefront error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}