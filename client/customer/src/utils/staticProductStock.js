// Static Product Stock Tracker
// Tracks stock reductions for static products when orders are placed
// Since static products don't exist in the backend, we track sales locally

const STORAGE_KEY = "static-product-sales";

function getSalesData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveSalesData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save static product sales:", error);
  }
}

/**
 * Record a sale for static products
 * @param {Array} items - Array of { productId, quantity } from the order
 */
export function recordStaticProductSales(items) {
  const salesData = getSalesData();
  let hasChanges = false;

  for (const item of items) {
    // Only track static products (IDs starting with "static-")
    if (item.productId && item.productId.startsWith("static-")) {
      const currentSold = salesData[item.productId] || 0;
      salesData[item.productId] = currentSold + item.quantity;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    saveSalesData(salesData);
  }
}

/**
 * Get the number of units sold for a static product
 * @param {string} productId - The static product ID
 * @returns {number} - Number of units sold
 */
export function getStaticProductSold(productId) {
  const salesData = getSalesData();
  return salesData[productId] || 0;
}

/**
 * Get the remaining stock for a static product
 * @param {Object} product - The static product object
 * @returns {number|null} - Remaining stock, or null for unlimited
 */
export function getStaticProductRemainingStock(product) {
  if (product.stock === null || product.stock === undefined) {
    return null; // Unlimited stock
  }
  const sold = getStaticProductSold(product._id);
  return Math.max(0, product.stock - sold);
}

/**
 * Check if a static product is in stock
 * @param {Object} product - The static product object
 * @returns {boolean}
 */
export function isStaticProductInStock(product) {
  const remaining = getStaticProductRemainingStock(product);
  return remaining === null || remaining > 0;
}

/**
 * Reset sales data for a specific static product (admin action)
 * @param {string} productId - The static product ID
 */
export function resetStaticProductSales(productId) {
  const salesData = getSalesData();
  delete salesData[productId];
  saveSalesData(salesData);
}

/**
 * Reset all static product sales (for testing)
 */
export function resetAllStaticProductSales() {
  saveSalesData({});
}

/**
 * Manually adjust stock for a static product (admin action)
 * @param {string} productId - The static product ID
 * @param {number} adjustment - Positive to add stock, negative to reduce
 */
export function adjustStaticProductStock(productId, adjustment) {
  const salesData = getSalesData();
  const currentSold = salesData[productId] || 0;
  const newSold = Math.max(0, currentSold - adjustment); // Subtract adjustment from sold = add stock
  salesData[productId] = newSold;
  saveSalesData(salesData);
}