const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const apiUrl = (path) => `${API}${API ? "" : "/api"}${path}`;

async function request(path, options) {
  let res;
  try {
    res = await fetch(apiUrl(path), options);
  } catch {
    const error = new Error("NETWORK_ERROR");
    error.code = "NETWORK";
    throw error;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(body.error || "Something went wrong");
    error.status = res.status;
    error.code = body.error;
    throw error;
  }
  return body;
}

async function adminRequest(path, options = {}) {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(body.error || "Something went wrong");
    error.status = res.status;
    throw error;
  }
  return body;
}

export const getStore = (slug) => request(`/store/${encodeURIComponent(slug)}`);

export const createOrder = (slug, orderData) =>
  request(`/store/${encodeURIComponent(slug)}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

export const getOrderStatus = (slug, orderCode) =>
  request(`/store/${encodeURIComponent(slug)}/orders/${orderCode}/status`);

export const retryPayment = (slug, orderCode) =>
  request(`/store/${encodeURIComponent(slug)}/orders/${orderCode}/pay`, {
    method: "POST",
  });

export const adminLogin = (credentials) =>
  adminRequest("/auth/login", { method: "POST", body: JSON.stringify(credentials) });

export const adminRegister = (details) =>
  adminRequest("/auth/register", { method: "POST", body: JSON.stringify(details) });

export const getAdminMe = () => adminRequest("/auth/me");

export const getAdminProducts = () => adminRequest("/products");

export const createAdminProduct = (product) =>
  adminRequest("/products", { method: "POST", body: JSON.stringify(product) });

export const updateAdminProduct = (id, changes) =>
  adminRequest(`/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });

export const deleteAdminProduct = (id) =>
  adminRequest(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });

export const getAdminOrders = ({ status, page = 1, limit = 20 } = {}) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) query.set("status", status);
  return adminRequest(`/order?${query}`);
};

export const getAdminOrder = (id) =>
  adminRequest(`/order/${encodeURIComponent(id)}`);

export const updateAdminOrderStatus = (id, status) =>
  adminRequest(`/order/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const markAdminOrderPaid = (id) =>
  adminRequest(`/order/${encodeURIComponent(id)}/paid`, { method: "PATCH" });