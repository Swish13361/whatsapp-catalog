import { create } from "zustand";
import { adminLogin, adminRegister, getAdminMe } from "../api.js";

let initializationPromise;

function saveSession({ token, merchant }) {
  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminMerchant", JSON.stringify(merchant));
}

function clearSession() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminMerchant");
}

export const useAuthStore = create((set, get) => ({
  token: null,
  merchant: null,
  status: "unknown",
  error: "",
  login: async (credentials) => {
    set({ status: "checking", error: "" });
    try {
      const session = await adminLogin(credentials);
      saveSession(session);
      set({
        token: session.token,
        merchant: session.merchant,
        status: "authenticated",
        error: "",
      });
      return session;
    } catch (error) {
      set({ token: null, merchant: null, status: "unauthenticated", error: error.message });
      throw error;
    }
  },
  register: async (details) => {
    set({ status: "checking", error: "" });
    try {
      const session = await adminRegister(details);
      saveSession(session);
      set({
        token: session.token,
        merchant: session.merchant,
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

    const token = localStorage.getItem("adminToken");
    if (!token) {
      set({ token: null, merchant: null, status: "unauthenticated", error: "" });
      return Promise.resolve(null);
    }

    set({ token, status: "checking", error: "" });
    initializationPromise = (async () => {
      try {
        const merchant = await getAdminMe();
        if (localStorage.getItem("adminToken") !== token) return get().merchant;
        localStorage.setItem("adminMerchant", JSON.stringify(merchant));
        set({ token, merchant, status: "authenticated", error: "" });
        return merchant;
      } catch (error) {
        if (localStorage.getItem("adminToken") !== token) return get().merchant;
        if (error.status === 401) {
          clearSession();
          set({ token: null, merchant: null, status: "unauthenticated", error: "" });
        } else {
          set({ token, merchant: null, status: "error", error: error.message });
        }
        return null;
      } finally {
        initializationPromise = null;
      }
    })();

    return initializationPromise;
  },
  logout: () => {
    clearSession();
    set({ token: null, merchant: null, status: "unauthenticated", error: "" });
  },
}));
