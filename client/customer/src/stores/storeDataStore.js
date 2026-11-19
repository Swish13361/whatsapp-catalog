import { create } from "zustand";
import { getStore } from "../api.js";

const STORE_CACHE_MS = 30_000;
export const SINGLE_STORE_KEY = "shop";

export const useStoreDataStore = create((set, get) => ({
  stores: {},
  fetchStore: async ({ slug, force = false } = {}) => {
    const storeKey = slug || SINGLE_STORE_KEY;
    const cached = get().stores[storeKey];
    
    // Return immediately if we have fresh cached data and not forcing refresh
    if (
      !force &&
      cached &&
      (cached.status === "ready" || cached.status === "not-found") &&
      Date.now() - cached.updatedAt < STORE_CACHE_MS
    ) {
      return;
    }

    // If we have stale cached data, keep showing it while fetching fresh data
    const hasStaleCache = cached && (cached.status === "ready" || cached.status === "not-found");
    
    if (!hasStaleCache) {
      // Show loading state on first load
      set((state) => ({
        stores: {
          ...state.stores,
          [storeKey]: {
            slug: storeKey,
            merchant: null,
            products: [],
            paymentOptions: {
              supportedUsdtNetworks: ["TRC20", "BEP20", "BINANCE"],
              usdtNetworks: [],
              alipayEnabled: false,
              alipayAccount: "",
              bankTransferEnabled: false,
              bankDetails: {},
            },
            status: "loading",
            error: "",
            updatedAt: 0,
          },
        },
      }));
    }

    try {
      const data = await getStore(slug);
      if (!data.store) throw new Error("Store data was missing from the response.");
      set((state) => ({
        stores: {
          ...state.stores,
          [storeKey]: {
            slug: storeKey,
            merchant: data.store,
            products: data.products || [],
            paymentOptions: {
              supportedUsdtNetworks: data.paymentOptions?.supportedUsdtNetworks || ["TRC20", "BEP20", "BINANCE"],
              usdtNetworks: data.paymentOptions?.usdtNetworks || [],
              alipayEnabled: !!data.paymentOptions?.alipayEnabled,
              alipayAccount: data.paymentOptions?.alipayAccount || "",
              bankTransferEnabled: !!data.paymentOptions?.bankTransferEnabled,
              bankDetails: data.paymentOptions?.bankDetails || {},
            },
            status: "ready",
            error: "",
            updatedAt: Date.now(),
          },
        },
      }));
    } catch (error) {
      // If we have stale cached data, keep showing it instead of error page
      const staleData = get().stores[storeKey];
      const hasStaleCache = staleData && (staleData.status === "ready" || staleData.status === "not-found");
      
      if (hasStaleCache) {
        // Update timestamp but keep stale data visible
        set((state) => ({
          stores: {
            ...state.stores,
            [storeKey]: {
              ...state.stores[storeKey],
              updatedAt: Date.now(),
            },
          },
        }));
        return;
      }
      
      set((state) => ({
        stores: {
          ...state.stores,
          [storeKey]: {
            slug: storeKey,
            merchant: null,
            products: [],
            paymentOptions: {
              supportedUsdtNetworks: ["TRC20", "BEP20", "BINANCE"],
              usdtNetworks: [],
              alipayEnabled: false,
              alipayAccount: "",
              bankTransferEnabled: false,
              bankDetails: {},
            },
            status: error.status === 404 ? "not-found" : "network-error",
            error: error.message,
            updatedAt: Date.now(),
          },
        },
      }));
    }
  },
}));
