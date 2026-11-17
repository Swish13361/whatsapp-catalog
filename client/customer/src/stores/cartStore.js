import { create } from "zustand";
import { persist } from "zustand/middleware";

const normalizeSlug = (slug) => String(slug || "").toLowerCase();

export const useCartStore = create(
  persist(
    (set, get) => ({
      slug: null,
      items: [],
      addItem: (slug, product) => set((state) => {
        console.log('[cartStore] addItem called:', { slug, productId: product._id, currentSlug: state.slug, currentItems: state.items.length });
        const storeSlug = normalizeSlug(slug);
        if (product.inStock === false) return state;

        const items = state.slug === storeSlug ? state.items : [];
        const currency = product.currency || "KES";
        if (items.some((item) => (item.currency || "KES") !== currency)) {
          console.log('[cartStore] mixed currency blocked');
          return state;
        }
        const existing = items.find((item) => item.productId === product._id);
        if (existing?.qty >= 10) return state;

        let newState;
        if (existing) {
          newState = {
            slug: storeSlug,
            items: items.map((item) =>
              item.productId === product._id ? { ...item, currency, qty: item.qty + 1 } : item,
            ),
          };
        } else {
          newState = {
            slug: storeSlug,
            items: [...items, {
              productId: product._id,
              name: product.name,
              price: product.price,
              currency,
              qty: 1,
            }],
          };
        }
        console.log('[cartStore] new state:', newState);
        return newState;
      }),
      changeQuantity: (slug, product, amount) => set((state) => {
        console.log('[cartStore] changeQuantity called:', { slug, productId: product._id, amount, currentSlug: state.slug });
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
              item.productId === product._id ? { ...item, currency: product.currency || "KES", qty: nextQuantity } : item,
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
            currency: product.currency || "KES",
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

