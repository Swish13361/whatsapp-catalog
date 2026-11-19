const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const apiUrl = (path) => `${API}${API ? "" : "/api"}${path}`;
 
const FETCH_TIMEOUT_MS = 30000;
 
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      const err = new Error("REQUEST_TIMEOUT");
      err.code = "TIMEOUT";
      err.status = 408;
      throw err;
    }
    const err = new Error("NETWORK_ERROR");
    err.code = "NETWORK";
    err.status = 0;
    throw err;
  }
}
 
async function request(path, options) {
  let res;
  try {
    res = await fetchWithTimeout(apiUrl(path), options);
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
  const res = await fetchWithTimeout(apiUrl(path), {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      window.location.href = "/register";
    }
    const error = new Error(body.error || "Something went wrong");
    error.status = res.status;
    error.code = body.error;
    throw error;
  }
  return body;
}

export const getStore = (slug) => request(`/store${slug ? `/${slug}` : ""}`);

export const createOrder = (orderData) =>
  request("/store/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

export const getOrderStatus = (orderCode) =>
  request(`/store/orders/${encodeURIComponent(orderCode)}/status`);

export const submitUsdtReference = (orderCode, transactionHash) =>
  request(`/store/orders/${encodeURIComponent(orderCode)}/payment-reference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactionHash }),
  });

export const adminLogin = (credentials) =>
  adminRequest("/auth/admin/login", { method: "POST", body: JSON.stringify(credentials) });

export const register = (userData) => request("/auth/customer/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

export const customerLogin = (credentials) =>
  request("/auth/customer/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

export const getAdminMe = () => adminRequest("/auth/admin/me");

export const getAdminProducts = () => adminRequest("/products").then((res) => res.products || []);
 
export const createAdminProduct = (product) =>
  adminRequest("/products", { method: "POST", body: JSON.stringify(product) });
 
export const updateAdminProduct = (id, changes) =>
  adminRequest(`/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
 
export const deleteAdminProduct = (id) =>
  adminRequest(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });
 
export const uploadAdminProductImage = async (file) => {
  return uploadToAppwrite(file);
};
 
export const getAdminOrders = ({ status, paymentStatus, page = 1, limit = 20 } = {}) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) query.set("status", status);
  if (paymentStatus) query.set("paymentStatus", paymentStatus);
  return adminRequest(`/order?${query}`).then((res) => ({
    orders: res.orders || [],
    total: res.total,
    page: res.page,
    pages: res.pages,
    counts: res.counts,
  }));
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
