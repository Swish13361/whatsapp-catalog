import { create } from "zustand";
import { getStore } from "../api.js";
import { getActiveStaticProducts } from "../data/staticProducts.js";

const STORE_CACHE_MS = 30_000;
export const SINGLE_STORE_KEY = "shop";

function mergeProducts(apiProducts, staticProducts) {
  const merged = [...apiProducts];
  for (const staticProduct of staticProducts) {
    if (!merged.some(p => p._id === staticProduct._id)) {
      merged.push(staticProduct);
    }
  }
  return merged;
}

export const useStoreDataStore = create((set, get) => ({
  stores: {},
  fetchStore: async ({ slug, force = false } = {}) => {
    const storeKey = slug || SINGLE_STORE_KEY;
    const cached = get().stores[storeKey];
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
          updatedAt: cached?.updatedAt || 0,
        },
      },
    }));

    try {
      const data = await getStore(slug);
      if (!data.store) throw new Error("Store data was missing from the response.");
      const apiProducts = data.products || [];
      const staticProducts = getActiveStaticProducts();
      const allProducts = mergeProducts(apiProducts, staticProducts);
      set((state) => ({
        stores: {
          ...state.stores,
          [storeKey]: {
            slug: storeKey,
            merchant: data.store,
            products: allProducts,
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
      const staticProducts = getActiveStaticProducts();
      set((state) => ({
        stores: {
          ...state.stores,
          [storeKey]: {
            slug: storeKey,
            merchant: null,
            products: staticProducts,
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
