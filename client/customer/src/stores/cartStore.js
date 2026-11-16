import { create } from "zustand";
import { persist } from "zustand/middleware";

const normalizeSlug = (slug) => String(slug || "").toLowerCase();

export const useCartStore = create(
  persist(
    (set) => ({
      slug: null,
      items: [],
      addItem: (slug, product) => set((state) => {
        const storeSlug = normalizeSlug(slug);
        if (product.inStock === false) return state;

        const items = state.slug === storeSlug ? state.items : [];
        const existing = items.find((item) => item.productId === product._id);
        if (existing?.qty >= 10) return state;

        if (existing) {
          return {
            slug: storeSlug,
            items: items.map((item) =>
              item.productId === product._id ? { ...item, qty: item.qty + 1 } : item,
            ),
          };
        }

        return {
          slug: storeSlug,
          items: [...items, {
            productId: product._id,
            name: product.name,
            price: product.price,
            qty: 1,
          }],
        };
      }),
      changeQuantity: (slug, product, amount) => set((state) => {
        const storeSlug = normalizeSlug(slug);
        const items = state.slug === storeSlug ? state.items : [];
        const existing = items.find((item) => item.productId === product._id);
        const nextQuantity = (existing?.qty || 0) + amount;

        if (nextQuantity < 0 || nextQuantity > 10) return state;
        if (nextQuantity === 0) {
          return {
            slug: storeSlug,
            items: items.filter((item) => item.productId !== product._id),
          };
        }
        if (existing) {
          return {
            slug: storeSlug,
            items: items.map((item) =>
              item.productId === product._id ? { ...item, qty: nextQuantity } : item,
            ),
          };
        }
        if (amount < 1 || product.inStock === false) return state;

        return {
          slug: storeSlug,
          items: [...items, {
            productId: product._id,
            name: product.name,
            price: product.price,
            qty: nextQuantity,
          }],
        };
      }),
      clearCart: (slug) => set((state) =>
        state.slug === normalizeSlug(slug) ? { slug: null, items: [] } : state,
      ),
    }),
    {
      name: "customer-cart",
      partialize: ({ slug, items }) => ({ slug, items }),
    },
  ),
);
