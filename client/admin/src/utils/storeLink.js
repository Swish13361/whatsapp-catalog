const defaultStorefrontUrl = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:5174"
  : "https://shop.jchpro.com";
const storefrontBase = (import.meta.env.VITE_STOREFRONT_URL || defaultStorefrontUrl).replace(/\/+$/, "");

export function getStoreLink() {
  return storefrontBase;
}


