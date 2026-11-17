import Merchant from "../models/merchant.js";

export async function findSingleStore(slug) {
  const query = slug ? { slug, isActive: true } : { isActive: true };
  const merchants = await Merchant.find(query)
    .select("businessName slug whatsappNumber")
    .limit(2);

  if (merchants.length === 0) {
    return { merchant: null, status: 404, error: "The store is not configured yet." };
  }
  return { merchant: merchants[0], status: 200, error: "" };
}
