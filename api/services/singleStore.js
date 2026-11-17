import Merchant from "../models/merchant.js";

export async function findSingleStore() {
  const merchants = await Merchant.find({ isActive: true })
    .select("businessName slug whatsappNumber")
    .limit(2);

  if (merchants.length === 0) {
    return { merchant: null, status: 404, error: "The store is not configured yet." };
  }
  return { merchant: merchants[0], status: 200, error: "" };
}
