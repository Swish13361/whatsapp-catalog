const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

import { uploadProductImage as uploadToAppwrite } from "./lib/appwrite.js";

async function request(path, options) {
  const token = localStorage.getItem("adminToken");
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...(options?.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    const error = new Error("NETWORK_ERROR");
    error.code = "NETWORK";
    throw error;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error("AUTH_REQUEST_FAILED");
    error.status = res.status;
    error.code = body.error;
    throw error;
  }
  return body;
}

export const adminLogin = (email, password) => request("/auth/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

export const adminRegister = (businessName, email, password) =>
  request("/auth/admin/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ businessName, email, password }),
});

export const adminMe = () => request("/auth/admin/me");

export const adminProducts = () => request("/products");

export const adminCreateProduct = (productData) =>
  request("/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });

export const adminUpdateProduct = (id, productData) =>
  request(`/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });

export const adminDeleteProduct = (id) =>
  request(`/products/${id}`, {
    method: "DELETE",
  });

export const uploadAdminProductImage = async (file) => {
  return uploadToAppwrite(file);
};

export const adminOrders = (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.paymentStatus) query.set("paymentStatus", filters.paymentStatus);
  const queryString = query.toString();
  const suffix = queryString ? `?${queryString}` : "";
  return request(`/order${suffix}`);
};

export const adminGetOrder = (id) => request(`/order/${id}`);

export const adminUpdateOrderStatus = (id, status) =>
  request(`/order/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

export const adminMarkPaid = (id) =>
  request(`/order/${id}/paid`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

