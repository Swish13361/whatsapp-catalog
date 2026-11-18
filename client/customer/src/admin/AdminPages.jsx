import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  getAdminProducts,
  updateAdminProduct,
  uploadAdminProductImage,
} from "../api.js";
import {
  Button,
  Input,
  Card,
  PriceTag,
  StatusBadge,
  Table,
  EmptyState,
  Skeleton,
  Panel,
  Checkbox,
  Select,
} from "../ui/index.js";

const ORDER_STATUSES = ["NEW", "PREPARING", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"];
const DEFAULT_CURRENCY = "USD";

const formatMoney = (value, currency = DEFAULT_CURRENCY) => {
  const amount = Number(value || 0);
  if (currency === "USDT") return `${amount.toFixed(2)} USDT`; // not an ISO code, Intl would throw
  try {
    return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-KE", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};
const formatDate = (value) => new Date(value).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
const formatStatus = (value = "") => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const paymentMethodLabel = (order) => {
  if (order.paymentMethod === "USDT") return `USDT · ${order.paymentNetwork}`;
  if (order.paymentMethod === "ALIPAY") return "Alipay";
  if (order.paymentMethod === "BANK_TRANSFER") return "Bank transfer";
  if (order.paymentMethod === "MPESA") return "M-Pesa";
  return "Pay on delivery";
};

// Use utility classes from index.css
const pageClass = "";
const addProductLink = "flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-bold text-text hover:bg-accent-soft hover:text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const filterChip = (on) => `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors ${on ? "border-accent bg-accent text-accent-on" : "border-line bg-surface text-muted hover:bg-accent-soft hover:text-accent-ink"}`;
const th = "th-base px-4 py-3 text-left";
const td = "td-base px-4 py-3";

function LoadingPage({ label }) {
  return (
    <div className="text-center py-24 animate-in fade-in-0">
      <Skeleton heading className="mx-auto w-64" />
      <p className="mt-4 text-sm text-muted">{label}</p>
    </div>
  );
}

export function AdminDashboard() {
  const [ordersResult, setOrdersResult] = useState(null);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [orderResult, productResult] = await Promise.all([getAdminOrders({ page: 1, limit: 6 }), getAdminProducts()]);
      setOrdersResult(orderResult);
      setProducts(productResult);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([getAdminOrders({ page: 1, limit: 6 }), getAdminProducts()])
      .then(([orderResult, productResult]) => {
        if (active) {
          setOrdersResult(orderResult);
          setProducts(productResult);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <main className={pageClass}>
        <EmptyState title="Couldn’t load your dashboard" description={error} action={<Button onClick={load}>Try again</Button>} />
      </main>
    );
  }
  if (ordersResult === null || products === null) return <LoadingPage label="Loading dashboard…" />;

  // Only the latest orders are loaded here. For exact totals, add a stats endpoint on the API.
  const revenue = ordersResult.orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalOrders = ordersResult.total ?? ordersResult.orders.length;
  const pending = ordersResult.counts?.NEW || 0;
  const lowStock = products.filter((product) => product.stock != null && product.stock <= 5).length;
  const recent = ordersResult.orders.slice(0, 6).map((order) => ({
    key: order._id,
    orderCode: order.orderCode,
    customer: order.customerName,
    date: formatDate(order.createdAt),
    total: formatMoney(order.total, order.currency || DEFAULT_CURRENCY),
    status: order.status,
  }));

  const stats = [
    { label: "Revenue", value: formatMoney(revenue), note: "Latest orders, excluding cancelled", icon: "$", tone: "bg-success-soft text-success" },
    { label: "Orders", value: totalOrders, note: "Orders placed in your shop", icon: "#", tone: "bg-accent-soft text-accent-ink" },
    { label: "Pending", value: pending, note: "Ready for your attention", icon: "!", tone: "bg-warning-soft text-warning" },
    { label: "Low stock", value: lowStock, note: "Products with 5 or fewer in stock", icon: "S", tone: "bg-line text-muted" },
  ];

  return (
    <div className="animate-in fade-in-0">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-accent uppercase">Dashboard</p>
          <h1 className="text-xl font-bold text-text">Overview</h1>
        </div>
        <Link to="/admin/products/new" className={addProductLink}>
          <span>＋</span> Add a product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card padded className="metric-card" key={stat.label}>
            <div className="flex items-center gap-3">
              <div className={`metric-icon ${stat.tone}`}>
                <span className="text-xs font-bold">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase">{stat.label}</p>
                <p className="text-sm font-bold text-text">{stat.value}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">{stat.note}</p>
          </Card>
        ))}
      </div>

      <Panel title="Recent orders" padded>
        <div className="table-container">
          <Table
            columns={[
              { key: "orderCode", label: "Order" },
              { key: "customer", label: "Customer" },
              { key: "date", label: "Date" },
              { key: "total", label: "Total" },
              { key: "status", label: "Status" },
            ]}
            rows={recent}
          />
        </div>
        <div className="mt-4">
          <Link to="/admin/orders" className="text-xs font-bold text-accent hover:text-accent-hover underline underline-offset-2">All orders →</Link>
        </div>
      </Panel>
    </div>
  );
}

export function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResult(await getAdminOrders({ status: statusFilter || undefined, page }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    let active = true;
    getAdminOrders({ status: statusFilter || undefined, page })
      .then((orderResult) => {
        if (active) {
          setResult(orderResult);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [page, statusFilter]);

  const rows = useMemo(() => {
    if (!result?.orders) return [];
    return result.orders.map((order) => ({
      key: order._id,
      orderCode: order.orderCode,
      customer: order.customerName,
      items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      date: formatDate(order.createdAt),
      payment: paymentMethodLabel(order),
      total: formatMoney(order.total, order.currency || DEFAULT_CURRENCY),
      status: order.status,
    }));
  }, [result]);

  if (error) {
    return (
      <main className={pageClass}>
        <EmptyState title="Couldn’t load orders" description={error} action={<Button onClick={load}>Try again</Button>} />
      </main>
    );
  }
  if (loading && !result) return <LoadingPage label="Loading orders…" />;

  const ordersEmpty = Boolean(result && result.orders.length === 0);
  const hasMorePages = (result?.pages || 0) > 1;

  return (
    <main className={pageClass}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-accent uppercase">Orders</p>
          <h1 className="text-xl font-bold text-text">All orders</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter orders by status">
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={statusFilter === status}
            onClick={() => { setPage(1); setStatusFilter(statusFilter === status ? "" : status); }}
            className={filterChip(statusFilter === status)}
          >
            <StatusBadge status={status} /><span>{result?.counts?.[status] ?? "—"}</span>
          </button>
        ))}
      </div>

      <Panel padded>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-text">{statusFilter ? `${formatStatus(statusFilter)} orders` : "All orders"}</h2>
          <span className="text-xs font-bold text-muted">{result?.total ?? 0} {result?.total === 1 ? "order" : "orders"}</span>
        </div>

{ordersEmpty ? (
          <EmptyState
            title={statusFilter ? "No matching orders." : "Your order list is clear."}
            description="When someone places an order, you'll find it here."
            action={statusFilter ? <Button onClick={() => { setStatusFilter(""); setPage(1); }}>Show all orders</Button> : null}
          />
        ) : (
          <div className="table-container">
            <table className="table-base">
              <thead>
                <tr className="bg-surface/50">
                  <th className="th-base">Order</th>
                  <th className="th-base">Customer</th>
                  <th className="th-base">Items</th>
                  <th className="th-base">Date</th>
                  <th className="th-base">Payment</th>
                  <th className="th-base">Total</th>
                  <th className="th-base">Status</th>
                  <th className="th-base"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((order) => (
                  <tr key={order.key} className="hover:bg-accent-soft/30 transition-colors">
                    <td className="td-base text-sm font-bold text-text">{order.orderCode}</td>
                    <td className="td-base text-sm text-text">{order.customer}</td>
                    <td className="td-base text-sm text-muted">{order.items}</td>
                    <td className="td-base text-sm text-muted">{order.date}</td>
                    <td className="td-base text-sm text-muted">{order.payment}</td>
                    <td className="td-base text-sm font-bold text-text">{order.total}</td>
                    <td className="td-base"><StatusBadge status={order.status} /></td>
                    <td className="td-base">
                      <Link to={`/admin/orders/${order.key}`} className="text-xs font-bold text-accent hover:text-accent-hover underline underline-offset-2">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasMorePages && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-muted">Page {result.page} of {result.pages}</span>
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={page >= result.pages} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        )}
      </Panel>
    </main>
  );
}

const blankProduct = { name: "", description: "", category: "", price: "", currency: DEFAULT_CURRENCY, imageUrl: "", stock: "", isActive: true };

export function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProducts(await getAdminProducts());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAdminProducts()
      .then((productList) => { if (active) { setProducts(productList); setError(""); } })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleProducts = useMemo(() => {
    if (!products) return [];
    const searchTerm = query.trim().toLocaleLowerCase();
    return products.filter((product) => {
      const matchesTab = tab === "all" || (tab === "active" ? product.isActive : !product.isActive);
      return matchesTab && `${product.name} ${product.description || ""}`.toLocaleLowerCase().includes(searchTerm);
    });
  }, [products, query, tab]);

  const toggleProduct = async (product) => {
    setActionError("");
    try {
      await updateAdminProduct(product._id, { isActive: !product.isActive });
      setProducts((current) => current.map((entry) => entry._id === product._id ? { ...entry, isActive: !entry.isActive } : entry));
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`Permanently delete "${product.name}"? This can't be undone.`)) return;
    setActionError("");
    try {
      await deleteAdminProduct(product._id);
      setProducts((current) => current.filter((entry) => entry._id !== product._id));
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  if (error) {
    return (
      <main className={pageClass}>
        <EmptyState title="Couldn’t load products" description={error} action={<Button onClick={load}>Try again</Button>} />
      </main>
    );
  }
  if (loading && products === null) return <LoadingPage label="Loading products…" />;

  return (
    <main className={pageClass}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-accent uppercase">Products</p>
          <h1 className="text-xl font-bold text-text">Catalogue</h1>
        </div>
        <Link to="/admin/products/new" className={addProductLink}>
          <span>＋</span> Add a product
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-2 mb-6">
        {[["all", "All"], ["active", "Live"], ["paused", "Hidden"]].map(([value, label]) => (
          <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)} className={filterChip(tab === value)}>
            {label}
          </button>
        ))}
        <div className="flex-grow max-w-[320px]">
          <label htmlFor="product-search" className="block text-xs font-bold text-muted mb-1">Search products</label>
          <Input id="product-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products…" />
        </div>
      </div>

      {actionError && <p className="text-sm text-danger mb-4" role="alert">{actionError}</p>}
      <Panel padded>
        {visibleProducts.length === 0 ? (
          <EmptyState
            title={query ? "No products found." : tab === "paused" ? "Nothing hidden away." : "Your catalogue is ready."}
            description={query ? "Try another search, or clear the search field." : tab === "paused" ? "Products you hide will stay here until you’re ready to show them again." : "Add a product to make your catalogue yours."}
            action={!query && tab !== "paused" ? <Button onClick={() => navigate("/admin/products/new")}>Add your first product</Button> : null}
          />
        ) : (
          <div className="overflow-x-auto border border-line rounded-lg shadow-sm">
            <table className="border-collapse w-full text-left min-w-full">
<thead>
                <tr className="bg-surface/50">
                  <th className={th}>Product</th>
                  <th className={th}>Price</th>
                  <th className={th}>Stock</th>
                  <th className={th}>Sold</th>
                  <th className={th}>Status</th>
                  <th className={th}>Type</th>
                  <th className={th}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => {
                  const soldCount = product.originalStock !== undefined ? product.originalStock - (product.stock || 0) : 0;
                  const showSold = product.originalStock !== undefined && product.originalStock !== null;
                  return (
                    <tr key={product._id}>
                      <td className={`${td} text-sm text-text ${product.isActive ? "" : "opacity-60"}`}>
                        <div className="flex items-center gap-3">
                          <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-line text-muted text-xs">{product.name.slice(0, 1).toUpperCase()}</div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <p className="text-xs text-muted line-clamp-1">{product.description || "No description added yet."}</p>
                      </td>
                      <td className={`${td} text-sm font-bold text-text`}><PriceTag amount={product.price} currency={product.currency || DEFAULT_CURRENCY} /></td>
                      <td className={`${td} text-sm text-muted`}>{product.stock == null ? "Unlimited" : product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}</td>
                      <td className={`${td} text-sm text-muted`}>{showSold ? soldCount : "—"}</td>
                      <td className={td}><StatusBadge status={product.isActive ? "active" : "inactive"} /></td>
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <Link to={`/admin/products/${product._id}`} className="text-xs font-bold text-accent hover:text-accent-hover underline underline-offset-2">Edit</Link>
                          <button type="button" onClick={() => toggleProduct(product)} className="text-xs font-bold text-muted hover:text-accent transition-colors">{product.isActive ? "Hide" : "Show"}</button>
                          <button type="button" onClick={() => removeProduct(product)} className="text-xs font-bold text-danger hover:underline underline-offset-2">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </main>
  );
}

export function ProductForm({ product, onClose, onSaved }) {
const [values, setValues] = useState(() => product ? {
    name: product.name,
    description: product.description || "",
    category: product.category || "",
    price: String(product.price),
    currency: product.currency || DEFAULT_CURRENCY,
    imageUrl: product.imageUrl || "",
    stock: product.stock == null ? "" : String(product.stock),
    isActive: product.isActive,
  } : blankProduct);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || null);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(product?.imageUrl || null);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const name = values.name.trim();
    const price = Number(values.price);
    const stockText = values.stock.trim();
    const stock = stockText === "" ? null : Number(stockText);

    if (!name) return setError("Enter a product name.");
    if (values.price.trim() === "" || !Number.isFinite(price) || price < 0) return setError("Enter a valid price.");
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) return setError("Stock must be a whole number, or blank for unlimited.");

    setBusy(true);
    let imageUrl = values.imageUrl.trim();
    let imageFileId = null;

    try {
      if (selectedFile) {
        const result = await uploadAdminProductImage(selectedFile);
        imageUrl = result.imageUrl;
        imageFileId = result.fileId;
      }

      const payload = {
        name,
        description: values.description.trim(),
        category: values.category.trim(),
        price,
        currency: values.currency,
        imageUrl,
        imageFileId,
        stock,
        isActive: values.isActive,
      };

      if (product) {
        await updateAdminProduct(product._id, payload);
      } else {
        await createAdminProduct(payload);
      }

      setImagePreview(imageUrl);
      await onSaved();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title={product ? "Edit product" : "New product"} padded>
      <form onSubmit={submit} noValidate className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="form-field form-field-wide">
          <label htmlFor="pf-name" className="label-base">Product name</label>
          <Input id="pf-name" className="input-base" name="name" value={values.name} onChange={update} maxLength={100} placeholder="What are you selling?" required />
        </div>
        <div className="form-field form-field-wide">
          <label htmlFor="pf-description" className="label-base">Description <span className="font-normal">Optional · up to 500 characters</span></label>
          <textarea id="pf-description" className="textarea-base" name="description" value={values.description} onChange={update} maxLength={500} rows={3} placeholder="A little about this product…" />
        </div>
        <div className="form-field">
          <label htmlFor="pf-category" className="label-base">Category</label>
          <Input id="pf-category" className="input-base" name="category" value={values.category} onChange={update} maxLength={40} placeholder="e.g. Templates" />
        </div>
        <div className="form-field">
          <label htmlFor="pf-price" className="label-base">Price</label>
          <div className="form-row">
            <Input id="pf-price" className="input-base" name="price" type="number" value={values.price} onChange={update} min="0" max="10000000" step="0.01" placeholder="0.00" required />
            <Select className="select-base" name="currency" value={values.currency} onChange={update} aria-label="Product currency">
              <option value="USD">USD</option>
              <option value="KES">KES</option>
            </Select>
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="pf-stock" className="label-base">Stock <span className="font-normal">Leave blank for unlimited</span></label>
          <Input id="pf-stock" className="input-base" name="stock" type="number" value={values.stock} onChange={update} min="0" step="1" placeholder="Unlimited" />
        </div>
        <div className="form-field form-field-wide">
          <label htmlFor="pf-image" className="label-base">Product image <span className="font-normal">Optional · JPG/PNG up to 5MB</span></label>
          <div className="flex flex-col gap-2">
            <input id="pf-image" type="file" accept="image/*" onChange={handleFileChange} disabled={busy} />
            {imagePreview && (
              <img src={imagePreview} alt="Product preview" className="w-32 h-32 object-cover rounded-lg border border-line" />
            )}
          </div>
        </div>
        <div className="form-field form-field-wide">
          <Checkbox checked={values.isActive} onChange={() => setValues((current) => ({ ...current, isActive: !current.isActive }))} label={<span><strong>Show on storefront</strong> <span className="text-xs font-normal text-muted">Customers can see and order this product.</span></span>} />
        </div>
        {error && <p className="text-sm text-danger lg:col-span-2" role="alert">{error}</p>}
        <div className="lg:col-span-2 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={busy}>{busy ? "Saving…" : product ? "Save changes" : "Add product"}</Button>
        </div>
      </form>
    </Panel>
  );
}

// Route target for /admin/products/new and /admin/products/:id.
// Delete this if you already have an editor page elsewhere.
export function AdminProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const [product, setProduct] = useState(undefined); // undefined = loading, null = not found
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return undefined;
    let active = true;
    getAdminProducts()
      .then((list) => { if (active) setProduct(list.find((entry) => entry._id === id) || null); })
      .catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, [id, isNew]);

  const back = () => navigate("/admin/products");

  if (error) {
    return (
      <main className={pageClass}>
        <EmptyState title="Couldn’t load this product" description={error} action={<Button onClick={back}>Back to products</Button>} />
      </main>
    );
  }
  if (!isNew && product === undefined) return <LoadingPage label="Loading product…" />;
if (!isNew && product === null) {
    return (
      <main className={pageClass}>
        <EmptyState title="Product not found" description="It may have been deleted." action={<Button onClick={back}>Back to products</Button>} />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <ProductForm key={id || "new"} product={isNew ? null : product} onClose={back} onSaved={back} />
    </main>
  );
}
