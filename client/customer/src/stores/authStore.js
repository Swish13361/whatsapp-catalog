import { create } from "zustand";
import { adminLogin, getAdminMe } from "../api.js";

let initializationPromise;

function saveSession({ token, merchant, isCustomer }) {
  if (isCustomer) {
    localStorage.setItem("customerToken", token);
  } else {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminMerchant", JSON.stringify(merchant));
  }
}

function clearSession(isCustomer) {
  if (isCustomer) {
    localStorage.removeItem("customerToken");
  } else {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminMerchant");
  }
}

export const useAuthStore = create((set, get) => ({
  token: null,
  merchant: null,
  isCustomer: false,
  status: "unknown",
  error: "",
  login: async (credentials, asCustomer = true) => {
    set({ status: "checking", error: "" });
    try {
      const session = await adminLogin(credentials);
      saveSession(session, asCustomer);
      set({
        token: session.token,
        merchant: session.merchant,
        isCustomer: asCustomer,
        status: "authenticated",
        error: "",
      });
      return session;
    } catch (error) {
      set({ token: null, merchant: null, status: "unauthenticated", error: error.message });
      throw error;
    }
  },
  initialize: () => {
    if (get().status === "authenticated" && get().merchant) {
      return Promise.resolve(get().merchant);
    }
    if (initializationPromise) return initializationPromise;

    const customerToken = localStorage.getItem("customerToken");
    const adminToken = localStorage.getItem("adminToken");
    if (!customerToken && !adminToken) {
      set({ token: null, merchant: null, isCustomer: false, status: "unauthenticated", error: "" });
      return Promise.resolve(null);
    }

    set({ status: "checking", error: "" });
    initializationPromise = (async () => {
      try {
        if (customerToken) {
          // For customer token, set auth state directly without verifying via API
          set({ token: customerToken, merchant: null, isCustomer: true, status: "authenticated", error: "" });
          return null;
        }
        if (adminToken) {
          const merchant = await getAdminMe();
          if (localStorage.getItem("adminToken") !== adminToken) return get().merchant;
          localStorage.setItem("adminMerchant", JSON.stringify(merchant));
          set({ token: adminToken, merchant, isCustomer: false, status: "authenticated", error: "" });
          return merchant;
        }
      } catch (error) {
        if (customerToken) {
          // Fallback: keep customer auth even if API call fails
          set({ token: customerToken, merchant: null, isCustomer: true, status: "authenticated", error: "" });
          initializationPromise = null;
          return null;
        }
        if (localStorage.getItem("adminToken") !== adminToken) return get().merchant;
        if (error.status === 401) {
          clearSession(false);
          clearSession(true);
          set({ token: null, merchant: null, isCustomer: false, status: "unauthenticated", error: "" });
        } else {
          set({ token: null, merchant: null, isCustomer: false, status: "error", error: error.message });
        }
      } finally {
        initializationPromise = null;
      }
    })();

    return initializationPromise;
  },
  logout: () => {
    clearSession(false);
    clearSession(true);
    set({ token: null, merchant: null, isCustomer: false, status: "unauthenticated", error: "" });
  },
}));

