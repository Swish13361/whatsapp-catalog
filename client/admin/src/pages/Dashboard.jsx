import { useState, useEffect, useCallback } from "react";
import {
  adminMe,
  adminProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminOrders,
  adminUpdateOrderStatus,
  adminMarkPaid,
} from "../api.js";
import StoreLinkCard from "../components/StoreLinkCard.jsx";
import { useLanguage } from "../useLanguage.js";
import {
  Button,
  Input,
  Select,
  Card,
  PriceTag,
  Icon,
  StatusBadge,
  EmptyState,
  Skeleton,
  Panel,
  Table,
} from "../ui/index.js";

const formatOrderAmount = (order) => new Intl.NumberFormat(
  order.currency === "USD" ? "en-US" : "en-KE",
  {
    style: "currency",
    currency: order.currency || "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
).format(Number(order.total || 0));

function getTransactionExplorerUrl(order) {
  if (!/^[a-fA-F0-9]{64}$/.test(order.paymentReference || "")) return "";
  const hash = encodeURIComponent(order.paymentReference);
  if (order.paymentNetwork === "TRC20") return `https://tronscan.org/#/transaction/${hash}`;
  if (order.paymentNetwork === "BEP20") return `https://bscscan.com/tx/${hash}`;
  return "";
}

function getCustomerEmailUrl(order) {
  return `mailto:${order.customerEmail}?subject=${encodeURIComponent(`Digital order ${order.orderCode}`)}`;
}

function formatStatus(value = "") {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Dashboard() {
  const { t } = useLanguage();
  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    currency: "USD",
    imageUrl: "",
    stock: "",
  });
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [markingPaidId, setMarkingPaidId] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const data = await adminProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to fetch products");
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await adminOrders({
        ...(statusFilter && { status: statusFilter }),
        ...(paymentFilter && { paymentStatus: paymentStatus }),
      });
      setOrders(data.orders);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
    }
  }, [paymentFilter, statusFilter]);

  useEffect(() => {
    let active = true;
    Promise.all([
      adminMe(),
      adminProducts(),
      adminOrders({
        ...(statusFilter && { status: statusFilter }),
        ...(paymentFilter && { paymentStatus: paymentStatus }),
      }),
    ])
      .then(([merchantData, productData, orderData]) => {
        if (!active) return;
        setMerchant(merchantData);
        setProducts(productData);
        setOrders(orderData.orders);
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to load dashboard");
      });
    return () => {
      active = false;
    };
  }, [paymentFilter, statusFilter]);

const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminCreateProduct({
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        price: Number(newProduct.price),
        currency: newProduct.currency,
        imageUrl: newProduct.imageUrl || undefined,
        stock: newProduct.stock === "" ? null : Number(newProduct.stock),
      });
      setNewProduct({ name: "", description: "", category: "", price: "", currency: "USD", imageUrl: "" });
      setShowCreate(false);
      fetchProducts();
    } catch (err) {
      setError(err.message || "Failed to create product");
    }
  };

const handleEdit = (product) => {
    setEditingProduct({ ...product, stock: product.stock ?? "" });
    setShowCreate(true);
  };

const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await adminUpdateProduct(editingProduct._id, {
        name: editingProduct.name,
        description: editingProduct.description,
        category: editingProduct.category || "Other",
        price: Number(editingProduct.price),
        currency: editingProduct.currency || "KES",
        imageUrl: editingProduct.imageUrl || undefined,
        stock: editingProduct.stock === "" || editingProduct.stock === undefined ? null : Number(editingProduct.stock),
      });
      setEditingProduct(null);
      setShowCreate(false);
      fetchProducts();
    } catch (err) {
      setError(err.message || "Failed to update product");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await adminDeleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError(err.message || "Failed to delete product");
    }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      await adminUpdateOrderStatus(id, status);
      fetchOrders();
    } catch (err) {
      setError(err.message || "Failed to update order status");
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm("Only confirm after checking the transaction hash, network, recipient address, and amount. Mark this order paid?")) return;
    setMarkingPaidId(id);
    setError("");
    try {
      await adminMarkPaid(id);
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Failed to update payment status");
    } finally {
      setMarkingPaidId("");
    }
  };

  const summaryRows = [
    { label: "Products", value: products.length, note: "In your catalogue", icon: "package" },
    { label: "Orders", value: orders.length, note: "Matching the current filter", icon: "list" },
    { label: "New orders", value: orders.filter((order) => order.status === "NEW").length, note: "Ready for your attention", icon: "alertCircle" },
  ];

  if (merchant === null && products.length === 0 && orders.length === 0 && !error) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-24 text-center">
        <Skeleton heading className="mx-auto w-64" />
        <p className="mt-4 text-sm text-muted">Loading your dashboard…</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {error && <p className="text-sm text-danger mb-4" role="alert">{error}</p>}

<header className="mb-6">
        <div className="flex flex-column gap-2">
          <p className="text-xs font-bold text-accent uppercase">Merchant dashboard</p>
          <h1 className="text-xl font-bold text-ink">{merchant?.businessName}</h1>
        </div>
      </header>

      {merchant && <StoreLinkCard slug={merchant.slug} compact />}

      {products.length === 0 && merchant && (
        <Panel padded>
          <div className="flex items-center gap-3">
            <span className="text-muted">Your store is empty.</span>
            <span className="text-sm text-muted">Add a product so customers have something to buy.</span>
          </div>
          <Button variant="primary" onClick={() => { setEditingProduct(null); setShowCreate(true); }}>
            Add your first product
          </Button>
        </Panel>
      )}

      <section aria-label="Shop summary">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {summaryRows.map((row) => (
            <Card key={row.label} padded>
              <div className="flex items-center gap-3">
                <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg bg-accent-soft text-accent-ink">
                  <Icon size={16} name={row.icon} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase">{row.label}</p>
                  <p className="text-sm font-bold text-ink">{row.value}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">{row.note}</p>
            </Card>
          ))}
        </div>
      </section>

<section id="products">
        <div className="flex flex-column lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div className="flex flex-column gap-1">
            <h2 className="text-lg font-bold text-ink">Products <span className="text-muted">{products.length}</span></h2>
          </div>
          <Button variant="primary" onClick={() => { setEditingProduct(null); setShowCreate(true); }}>
            <span>＋</span> Add product
          </Button>
        </div>

        <Panel padded>
          {showCreate && !editingProduct && (
            <Card padded className="mb-6">
              <form onSubmit={handleCreate} noValidate className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-column gap-1 lg:col-span-2">
                  <label className="text-xs font-bold text-muted">Name</label>
                  <Input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                </div>
                <div className="flex flex-column gap-1 lg:col-span-2">
                  <label className="text-xs font-bold text-muted">Description</label>
                  <Input placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                </div>
                <div className="flex flex-column gap-1">
                  <label className="text-xs font-bold text-muted">Category</label>
<Input placeholder="Category (e.g. Templates)" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} maxLength={40} />
                </div>
                <div className="flex flex-column gap-1">
                  <label className="text-xs font-bold text-muted">Stock Quantity</label>
                  <Input type="number" placeholder="Leave empty for unlimited" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} min="0" step="1" />
                  <p className="text-xs text-muted">Empty = unlimited stock</p>
                </div>
                <div className="flex flex-column gap-1">
                  <label className="text-xs font-bold text-muted">Price in USD</label>
                  <Input type="number" placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} min="0" step="0.01" required />
                </div>
                <div className="flex flex-column gap-1">
                  <label className="text-xs font-bold text-muted">Currency</label>
                  <Select value={newProduct.currency} onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value })} aria-label="Product currency">
                    <option value="USD">USD</option>
                    <option value="KES">KES</option>
                  </Select>
                </div>
                <div className="flex flex-column gap-1 lg:col-span-2">
                  <label className="text-xs font-bold text-muted">Image URL</label>
                  <Input placeholder="https://..." value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} />
                </div>
                <div className="lg:col-span-3 flex gap-2">
                  <Button variant="primary" type="submit">Save product</Button>
                  <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}
          {showCreate && editingProduct && (
            <Card padded className="mb-6">
              <form onSubmit={handleUpdate} noValidate className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-column gap-1 lg:col-span-2">
                  <label className="text-xs font-bold text-muted">Name</label>
                  <Input placeholder="Name" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} required />
                </div>
                <div className="flex flex-column gap-1 lg:col-span-2">
                  <label className="text-xs font-bold text-muted">Description</label>
                  <Input placeholder="Description" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                </div>
                <div className="flex flex-column gap-1">
                  <label className="text-xs font-bold text-muted">Category</label>
<Input placeholder="Category" value={editingProduct.category || ""} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} maxLength={40} />
                </div>
                <div className="flex flex-column gap-1">
                  <label className="text-xs font-bold text-muted">Stock Quantity</label>
                  <Input type="number" placeholder="Leave empty for unlimited" value={editingProduct.stock ?? ""} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} min="0" step="1" />
                  <p className="text-xs text-muted">Empty = unlimited stock</p>
                </div>
                <div className="flex flex-column gap-1">
                  <label className="text-xs font-bold text-muted">Price</label>
                  <Input type="number" placeholder={`Price in ${editingProduct.currency || "KES"}`} value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} min="0" step="0.01" required />
                </div>
                <div className="flex flex-column gap-1">
                  <label className="text-xs font-bold text-muted">Currency</label>
                  <Select value={editingProduct.currency || "KES"} onChange={(e) => setEditingProduct({ ...editingProduct, currency: e.target.value })} aria-label="Product currency">
                    <option value="USD">USD</option>
                    <option value="KES">KES</option>
                  </Select>
                </div>
                <div className="flex flex-column gap-1 lg:col-span-2">
                  <label className="text-xs font-bold text-muted">Image URL</label>
                  <Input placeholder="https://..." value={editingProduct.imageUrl} onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} />
                </div>
                <div className="lg:col-span-3 flex gap-2">
                  <Button variant="primary" type="submit">Save changes</Button>
                  <Button variant="secondary" type="button" onClick={() => { setEditingProduct(null); setShowCreate(false); }}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}
          {products.length === 0 ? (
            <EmptyState title="Your catalogue is ready for its first product" description="Add an item so customers can start browsing your shop." />
          ) : (
            <div className="overflow-x-auto border border-line rounded-lg shadow-sm">
<Table
                columns={[
                  { key: "image", label: "Product" },
                  { key: "stock", label: "Stock" },
                  { key: "price", label: "Price" },
                  { key: "actions", label: "" },
                ]}
                rows={products.map((product) => ({
                  key: product._id,
                  image: (
                    <div className="flex items-center gap-3">
                      <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-line text-muted text-[10px]">{product.name.slice(0, 1).toUpperCase()}</div>
                      <span className="font-medium text-ink truncate">{product.name}</span>
                    </div>
                  ),
                  stock: <span className="text-sm text-text">{product.stock == null ? "∞ Unlimited" : product.stock}</span>,
                  price: <PriceTag amount={product.price} currency={product.currency || "USDT"} />,
                  actions: (
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleEdit(product)} className="text-xs font-bold text-accent hover:text-accent-hover underline underline-offset-2">Edit</button>
                      <button type="button" onClick={() => handleDelete(product._id)} className="text-xs font-bold text-danger hover:text-danger hover:underline underline-offset-2">Delete</button>
                    </div>
                  ),
                }))}
              />
            </div>
          )}
        </Panel>
      </section>

<section>
        <div className="flex flex-column lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div className="flex flex-column gap-1">
            <h2 className="text-lg font-bold text-ink">Orders <span className="text-muted">{orders.length}</span></h2>
          </div>
        </div>

        <Panel padded>
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => setStatusFilter("")}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${statusFilter === "" ? "border-accent bg-accent text-accent-on" : "border-line bg-surface text-muted hover:bg-accent-soft hover:text-accent-ink"}`}
            >
              All Orders
            </button>
            {["NEW", "PREPARING", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${statusFilter === status ? "border-accent bg-accent text-accent-on" : "border-line bg-surface text-muted hover:bg-accent-soft hover:text-accent-ink"}`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs font-bold text-muted self-center">Payment status</span>
            <div className="flex gap-2" role="group" aria-label="Filter orders by payment status">
              <button
                type="button"
                onClick={() => setPaymentFilter("")}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${paymentFilter === "" ? "border-accent bg-accent text-accent-on" : "border-line bg-surface text-muted hover:bg-accent-soft hover:text-accent-ink"}`}
              >
                All Payments
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter("PAID")}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${paymentFilter === "PAID" ? "border-accent bg-accent text-accent-on" : "border-line bg-surface text-muted hover:bg-accent-soft hover:text-accent-ink"}`}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter("UNPAID")}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${paymentFilter === "UNPAID" ? "border-accent bg-accent text-accent-on" : "border-line bg-surface text-muted hover:bg-accent-soft hover:text-accent-ink"}`}
              >
                Unpaid
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <EmptyState title="No orders here yet" description="New customer orders will show up here." />
          ) : (
            <div className="border border-line rounded-lg shadow-sm overflow-hidden">
              <Table
                columns={[
                  { key: "code", label: "Order" },
                  { key: "customer", label: "Customer" },
                  { key: "total", label: "Total" },
                  { key: "status", label: "Status" },
                  { key: "payment", label: "Payment" },
                  { key: "actions", label: "" },
                ]}
                rows={orders.map((order) => {
                  const statusKey = String(order.status).toLowerCase().replaceAll("_", "-");
                  return {
                    key: order._id,
                    code: <span className="font-bold text-ink">#{order.orderCode}</span>,
                    customer: (
                      <div className="flex flex-column gap-0.5">
                        <span className="text-sm text-ink">{order.customerName}</span>
                        {order.customerEmail ? (
                          <a href={getCustomerEmailUrl(order)} className="text-xs text-accent hover:text-accent-hover underline underline-offset-2">{order.customerEmail}</a>
                        ) : order.customerPhone ? <span className="text-xs text-muted">{order.customerPhone}</span> : null}
                      </div>
                    ),
                    total: formatOrderAmount(order),
                    status: <StatusBadge status={order.status} />,
                    payment: order.paymentMethod === "USDT" ? `USDT · ${order.paymentNetwork}` : order.paymentStatus,
                    actions: (
                      <div className="flex flex-column gap-1.5 sm:flex-row sm:gap-2">
                        {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                          <Button variant="secondary" size="sm" onClick={() => handleOrderStatus(order._id, "PREPARING")}>Prepare</Button>
                        )}
                        {order.status === "PREPARING" && (
                          <>
                            <Button variant="secondary" size="sm" onClick={() => handleOrderStatus(order._id, "OUT_FOR_DELIVERY")}>Ship</Button>
                            <Button variant="danger" size="sm" onClick={() => handleOrderStatus(order._id, "CANCELLED")}>Cancel</Button>
                          </>
                        )}
                        {order.status === "OUT_FOR_DELIVERY" && (
                          <Button variant="primary" size="sm" onClick={() => handleOrderStatus(order._id, "COMPLETED")}>Complete</Button>
                        )}
{order.paymentStatus === "UNPAID" && order.status !== "CANCELLED" && (order.paymentMethod !== "USDT" || order.paymentReference) && (
                          <Button variant="danger" size="sm" disabled={markingPaidId === order._id} onClick={() => handleMarkPaid(order._id)}>
                            {markingPaidId === order._id ? "Saving…" : "Mark as paid"}
                          </Button>
                        )}
                        {order.paymentMethod === "USDT" && order.paymentReference && (
                          <a
                            href={getTransactionExplorerUrl(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-accent hover:text-accent-hover underline underline-offset-2"
                          >
                            View on block explorer
                          </a>
                        )}
                      </div>
                    ),
                  };
                })}
              />
            </div>
          )}
        </Panel>
      </section>
    </main>
  );
}

export default Dashboard;


