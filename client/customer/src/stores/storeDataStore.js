import { create } from "zustand";
import { getStore } from "../api.js";

const STORE_CACHE_MS = 30_000;

export const useStoreDataStore = create((set, get) => ({
  stores: {},
  fetchStore: async (slug, { force = false } = {}) => {
    const storeSlug = String(slug || "").toLowerCase();
    if (!storeSlug) return;

    const cached = get().stores[storeSlug];
    if (cached?.status === "loading") return;
    if (
      !force &&
      cached &&
      (cached.status === "ready" || cached.status === "not-found") &&
      Date.now() - cached.updatedAt < STORE_CACHE_MS
    ) return;

    set((state) => ({
      stores: {
        ...state.stores,
        [storeSlug]: {
          slug: storeSlug,
          merchant: null,
          products: [],
          status: "loading",
          error: "",
          updatedAt: cached?.updatedAt || 0,
        },
      },
    }));

    try {
      const data = await getStore(storeSlug);
      if (!data.store) throw new Error("Store data was missing from the response.");
      set((state) => ({
        stores: {
          ...state.stores,
          [storeSlug]: {
            slug: storeSlug,
            merchant: data.store,
            products: data.products || [],
            status: "ready",
            error: "",
            updatedAt: Date.now(),
          },
        },
      }));
    } catch (error) {
      set((state) => ({
        stores: {
          ...state.stores,
          [storeSlug]: {
            slug: storeSlug,
            merchant: null,
            products: [],
            status: error.status === 404 ? "not-found" : "network-error",
            error: error.message,
            updatedAt: Date.now(),
          },
        },
      }));
    }
  },
}));
