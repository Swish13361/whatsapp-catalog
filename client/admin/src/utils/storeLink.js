const storefrontBase = (import.meta.env.VITE_STOREFRONT_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/+$/, "");

export function getStoreLink(slug) {
  return slug ? `${storefrontBase}/${slug}` : storefrontBase;
}
