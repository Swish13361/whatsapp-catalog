export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "signup",
  "www",
  "dashboard",
  "store",
  "app",
]);

export function isValidSlug(slug) {
  return typeof slug === "string" && /^[a-z0-9-]{3,30}$/.test(slug);
}
