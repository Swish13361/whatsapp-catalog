const storefrontBase = (import.meta.env.VITE_STOREFRONT_URL || "http://localhost:5174")
  .replace(/\/+$/, "");

export function getStoreLink(slug) {
  return `${storefrontBase}/${encodeURIComponent(slug)}`;
}
