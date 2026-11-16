import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminOrder,
  getAdminOrders,
  getAdminProducts,
  markAdminOrderPaid,
  updateAdminOrderStatus,
  updateAdminProduct,
} from "../api.js";
import "./admin.css";

const ORDER_STATUSES = ["NEW", "PREPARING", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"];
const STATUS_NEXT = {
  NEW: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};
const formatMoney = (value) => `KES ${Number(value || 0).toLocaleString("en-KE")}`;
const formatDate = (value) => new Date(value).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
const formatStatus = (value = "") => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="admin-page-heading">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="admin-page-description">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`admin-status-badge admin-status-${String(status).toLowerCase()}`}>{formatStatus(status)}</span>;
}

function LoadState({ error, onRetry }) {
  if (error) {
    return (
      <div className="admin-empty-state admin-error-state">
        <span className="admin-empty-icon">!</span>
        <h2>Couldn’t load this right now</h2>
        <p>{error}</p>
        <button className="admin-button admin-button-secondary" type="button" onClick={onRetry}>Try again</button>
      </div>
    );
  }
  return <div className="admin-loading-inline"><span className="admin-spinner" /> Loading your shop...</div>;
}

export function AdminDashboard() {
  const merchant = useOutletContext();
  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [orderResult, productResult] = await Promise.all([
        getAdminOrders({ page: 1, limit: 5 }),
        getAdminProducts(),
      ]);
      setOrders(orderResult);
      setProducts(productResult);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([getAdminOrders({ page: 1, limit: 5 }), getAdminProducts()])
      .then(([orderResult, productResult]) => {
        if (active) {
          setOrders(orderResult);
          setProducts(productResult);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error && !orders) return <LoadState error={error} onRetry={load} />;
  if (!orders || !products) return <LoadState />;

  const activeOrders = (orders.counts.PREPARING || 0) + (orders.counts.OUT_FOR_DELIVERY || 0);
  const liveProducts = products.filter((product) => product.isActive).length;

  return (
    <div className="admin-page">
      <PageHeading
        eyebrow="YOUR BUSINESS, AT A GLANCE"
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${merchant.businessName}`}
        description="Here’s what’s happening with your shop today."
        action={<Link className="admin-button admin-button-primary" to="/admin/products">＋ Add a product</Link>}
      />

      <div className="admin-welcome-banner">
        <div><span className="admin-welcome-star">✳</span><p>Your shop is open for business.</p><small>Share your storefront link and let the good things find their people.</small></div>
        <a href={`/${encodeURIComponent(merchant.slug)}`} target="_blank" rel="noopener noreferrer">Visit storefront <span>↗</span></a>
        <div className="admin-banner-orbit" aria-hidden="true" />
      </div>

      <section className="admin-metrics" aria-label="Store summary">
        <article className="admin-metric-card">
          <div className="admin-metric-top"><span className="admin-metric-icon admin-metric-icon-green">▤</span><span className="admin-metric-caption">ALL TIME</span></div>
          <strong>{Object.values(orders.counts).reduce((sum, count) => sum + count, 0)}</strong>
          <span>Total orders</span>
          <small>Orders placed with your shop</small>
        </article>
        <article className="admin-metric-card">
          <div className="admin-metric-top"><span className="admin-metric-icon admin-metric-icon-peach">◷</span><span className="admin-metric-caption">ACTION NEEDED</span></div>
          <strong>{orders.counts.NEW || 0}</strong>
          <span>New orders</span>
          <small>Ready for you to review</small>
        </article>
        <article className="admin-metric-card">
          <div className="admin-metric-top"><span className="admin-metric-icon admin-metric-icon-lilac">↗</span><span className="admin-metric-caption">IN MOTION</span></div>
          <strong>{activeOrders}</strong>
          <span>Being fulfilled</span>
          <small>Preparing or out for delivery</small>
        </article>
        <article className="admin-metric-card">
          <div className="admin-metric-top"><span className="admin-metric-icon admin-metric-icon-yellow">◇</span><span className="admin-metric-caption">ON DISPLAY</span></div>
          <strong>{liveProducts}</strong>
          <span>Live products</span>
          <small>{products.length} total in your catalogue</small>
        </article>
      </section>

      <section className="admin-panel admin-recent-panel">
        <div className="admin-panel-heading">
          <div><p className="admin-eyebrow">THE LATEST</p><h2>Recent orders</h2></div>
          <Link className="admin-text-link" to="/admin/orders">All orders <span>→</span></Link>
        </div>
        {orders.orders.length === 0 ? (
          <div className="admin-inline-empty"><span>✳</span><p>No orders just yet. Your first one could be right around the corner.</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>TOTAL</th><th>STATUS</th></tr></thead>
              <tbody>
                {orders.orders.map((order) => (
                  <tr key={order._id}>
                    <td><Link className="admin-order-code" to="/admin/orders">{order.orderCode}</Link></td>
                    <td>{order.customerName}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td className="admin-table-amount">{formatMoney(order.total)}</td>
                    <td><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="admin-dashboard-bottom">
        <section className="admin-panel admin-quick-panel">
          <p className="admin-eyebrow">A GOOD PLACE TO START</p>
          <h2>Keep your shop feeling fresh.</h2>
          <p>Add a new favorite or update what’s already on the shelf.</p>
          <Link className="admin-button admin-button-secondary" to="/admin/products">Manage products <span>→</span></Link>
        </section>
        <section className="admin-tip-panel">
          <span className="admin-tip-icon">✳</span>
          <p className="admin-eyebrow">A LITTLE REMINDER</p>
          <h2>Every order is someone choosing your shop.</h2>
          <p>Update order statuses as you prepare and deliver. Your customers can follow along.</p>
        </section>
      </div>
    </div>
  );
}

export function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

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
    return () => {
      active = false;
    };
  }, [page, statusFilter]);

  const openOrder = async (id) => {
    setSelected({ loading: true, id });
    try {
      setSelected(await getAdminOrder(id));
    } catch (requestError) {
      setSelected({ error: requestError.message, id });
    }
  };

  const refreshSelected = async () => {
    await load();
    if (selected?.order?._id) await openOrder(selected.order._id);
  };

  return (
    <div className="admin-page">
      <PageHeading
        eyebrow="THE HEART OF YOUR SHOP"
        title="Orders"
        description="Keep every order moving, from the first hello to the doorstep."
      />

      <div className="admin-order-counts">
        {ORDER_STATUSES.map((status) => (
          <button key={status} className={`admin-count-chip${statusFilter === status ? " is-selected" : ""}`} type="button" onClick={() => { const nextFilter = statusFilter === status ? "" : status; if (nextFilter !== statusFilter || page !== 1) setLoading(true); setPage(1); setStatusFilter(nextFilter); }}>
            <StatusBadge status={status} /><span>{result?.counts?.[status] ?? "—"}</span>
          </button>
        ))}
      </div>

      <section className="admin-panel admin-orders-panel">
        <div className="admin-panel-heading admin-orders-heading">
          <div><p className="admin-eyebrow">{statusFilter ? formatStatus(statusFilter).toUpperCase() : "EVERY HELLO, IN ONE PLACE"}</p><h2>{statusFilter ? `${formatStatus(statusFilter)} orders` : "All orders"}</h2></div>
          <span className="admin-results-count">{result?.total ?? 0} {result?.total === 1 ? "order" : "orders"}</span>
        </div>
        {loading && !result ? <LoadState /> : error ? <LoadState error={error} onRetry={load} /> : result?.orders.length === 0 ? (
          <div className="admin-empty-state">
            <span className="admin-empty-icon">▤</span>
            <h2>{statusFilter ? `No ${formatStatus(statusFilter).toLowerCase()} orders.` : "Your order list is clear."}</h2>
            <p>When someone places an order, you’ll find it here.</p>
            {statusFilter && <button className="admin-text-link" type="button" onClick={() => setStatusFilter("")}>Show all orders →</button>}
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table admin-orders-table">
                <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>DATE</th><th>PAYMENT</th><th>TOTAL</th><th>STATUS</th><th /></tr></thead>
                <tbody>
                  {result?.orders.map((order) => (
                    <tr key={order._id}>
                      <td><span className="admin-order-code">{order.orderCode}</span></td>
                      <td><strong className="admin-customer-name">{order.customerName}</strong><small className="admin-table-subtext">{order.customerPhone}</small></td>
                      <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td><span className={`admin-payment ${order.paymentStatus === "PAID" ? "is-paid" : ""}`}>{order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}</span><small className="admin-table-subtext">{order.paymentMethod === "MPESA" ? "M-Pesa" : "On delivery"}</small></td>
                      <td className="admin-table-amount">{formatMoney(order.total)}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td><button className="admin-row-action" type="button" onClick={() => openOrder(order._id)} aria-label={`View order ${order.orderCode}`}>→</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result && result.pages > 1 && (
              <div className="admin-pagination">
                <span>Page {result.page} of {result.pages}</span>
                <div>
                  <button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setPage((current) => current - 1); }}>← Previous</button>
                  <button type="button" disabled={page >= result.pages} onClick={() => { setLoading(true); setPage((current) => current + 1); }}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {selected && <OrderDetail record={selected} onClose={() => setSelected(null)} onRetry={() => openOrder(selected.id || selected.order?._id)} onUpdated={refreshSelected} />}
    </div>
  );
}

function OrderDetail({ record, onClose, onRetry, onUpdated }) {
  const [nextStatus, setNextStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(record.error || "");
  const order = record.order;

  const updateStatus = async () => {
    setBusy(true);
    setError("");
    try {
      await updateAdminOrderStatus(order._id, nextStatus);
      await onUpdated();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const markPaid = async () => {
    setBusy(true);
    setError("");
    try {
      await markAdminOrderPaid(order._id);
      await onUpdated();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="admin-order-drawer" role="dialog" aria-modal="true" aria-labelledby="order-drawer-title">
        <header className="admin-drawer-header">
          <div><p className="admin-eyebrow">ORDER DETAILS</p><h2 id="order-drawer-title">{order?.orderCode || "Order"}</h2></div>
          <button className="admin-modal-close" type="button" onClick={onClose} aria-label="Close order details">×</button>
        </header>
        {record.loading ? <LoadState /> : record.error ? <LoadState error={record.error} onRetry={onRetry} /> : order && (
          <>
            <div className="admin-drawer-status"><StatusBadge status={order.status} /><span>{formatDate(order.createdAt)}</span></div>
            <section className="admin-detail-section">
              <h3>Customer</h3>
              <strong>{order.customerName}</strong>
              <span>{order.customerPhone}</span>
              {order.deliveryAddress && <span>{order.deliveryAddress}</span>}
              {record.customerWhatsappUrl && <a className="admin-text-link" href={record.customerWhatsappUrl} target="_blank" rel="noopener noreferrer">Message customer on WhatsApp ↗</a>}
            </section>
            <section className="admin-detail-section">
              <h3>Items</h3>
              <ul className="admin-detail-items">
                {order.items.map((item, index) => (
                  <li key={`${item.name}-${index}`}><span>{item.name} <small>× {item.quantity}</small></span><strong>{formatMoney(item.price * item.quantity)}</strong></li>
                ))}
              </ul>
              <div className="admin-detail-total"><span>Order total</span><strong>{formatMoney(order.total)}</strong></div>
            </section>
            <section className="admin-detail-section admin-payment-details">
              <h3>Payment</h3>
              <span>{order.paymentMethod === "MPESA" ? "M-Pesa" : "Pay on delivery"} · {order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}</span>
              {order.mpesaReceipt && <small>Receipt: {order.mpesaReceipt}</small>}
              {order.paymentNote && <small className="admin-form-error">{order.paymentNote}</small>}
              {order.paymentMethod === "PAY_ON_DELIVERY" && order.paymentStatus === "UNPAID" && order.status !== "CANCELLED" && (
                <button className="admin-button admin-button-secondary" type="button" disabled={busy} onClick={markPaid}>Mark as paid</button>
              )}
            </section>
            {order.notes && <section className="admin-customer-note"><span>NOTE FROM CUSTOMER</span><p>{order.notes}</p></section>}
            {STATUS_NEXT[order.status]?.length > 0 && (
              <section className="admin-status-actions">
                <h3>Move this order along</h3>
                <div className="admin-status-action-row">
                  <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} aria-label="Next order status">
                    <option value="">Choose a status</option>
                    {STATUS_NEXT[order.status].map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                  </select>
                  <button className="admin-button admin-button-primary" type="button" disabled={!nextStatus || busy} onClick={updateStatus}>{busy ? "Saving..." : "Update"}</button>
                </div>
              </section>
            )}
          </>
        )}
        {error && !record.error && <p className="admin-form-error admin-drawer-error" role="alert">{error}</p>}
      </section>
    </div>
  );
}

const blankProduct = { name: "", description: "", price: "", imageUrl: "", stock: "", isActive: true };

export function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [editing, setEditing] = useState(undefined);
  const [actionId, setActionId] = useState("");

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
      .then((productList) => {
        if (active) {
          setProducts(productList);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    if (!products) return [];
    const searchTerm = query.trim().toLocaleLowerCase();
    return products.filter((product) => {
      const matchesTab = tab === "all" || (tab === "active" ? product.isActive : !product.isActive);
      return matchesTab && `${product.name} ${product.description || ""}`.toLocaleLowerCase().includes(searchTerm);
    });
  }, [products, query, tab]);

  const productSaved = async (message) => {
    setEditing(undefined);
    setNotice(message);
    await load();
  };

  const toggleProduct = async (product) => {
    setActionId(product._id);
    setNotice("");
    try {
      await updateAdminProduct(product._id, { isActive: !product.isActive });
      setNotice(product.isActive ? "Product hidden from your storefront." : "Product is live on your storefront.");
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionId("");
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`Permanently delete “${product.name}”? This can’t be undone.`)) return;
    setActionId(product._id);
    setNotice("");
    try {
      await deleteAdminProduct(product._id);
      setNotice("Product deleted.");
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="admin-page">
      <PageHeading
        eyebrow="THE SHELF"
        title="Products"
        description="Add, edit, and keep your storefront looking like you."
        action={<button className="admin-button admin-button-primary" type="button" onClick={() => setEditing(null)}>＋ Add product</button>}
      />

      <section className="admin-panel admin-products-panel">
        <div className="admin-products-toolbar">
          <div className="admin-product-tabs" role="tablist" aria-label="Filter products">
            {[
              ["all", "All", products?.length || 0],
              ["active", "Live", products?.filter((item) => item.isActive).length || 0],
              ["paused", "Hidden", products?.filter((item) => !item.isActive).length || 0],
            ].map(([value, label, count]) => (
              <button key={value} className={`admin-product-tab${tab === value ? " is-selected" : ""}`} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)}>{label}<span>{count}</span></button>
            ))}
          </div>
          <label className="admin-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." aria-label="Search products" />
          </label>
        </div>

        {loading && !products ? <LoadState /> : error && !products ? <LoadState error={error} onRetry={load} /> : (
          <>
            {notice && <p className="admin-notice" role="status">{notice}</p>}
            {error && <p className="admin-form-error admin-inline-error" role="alert">{error}</p>}
            {visibleProducts.length === 0 ? (
              <div className="admin-empty-state">
                <span className="admin-empty-icon">◇</span>
                <h2>{query ? "No products found." : tab === "paused" ? "Nothing hidden away." : "Your shelf is ready."}</h2>
                <p>{query ? "Try another search, or clear the search field." : tab === "paused" ? "Products you hide will stay here until you’re ready to show them again." : "Add a product to make your storefront yours."}</p>
                {!query && tab !== "paused" && <button className="admin-button admin-button-primary" type="button" onClick={() => setEditing(null)}>＋ Add your first product</button>}
              </div>
            ) : (
              <div className="admin-product-grid">
                {visibleProducts.map((product) => (
                  <article className={`admin-product-card${!product.isActive ? " is-hidden" : ""}`} key={product._id}>
                    <div className="admin-product-image">
                      <span className="admin-product-initial" aria-hidden="true">{product.name.slice(0, 1)}</span>
                      {product.imageUrl && <img src={product.imageUrl} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
                      <span className={`admin-product-state${product.isActive ? " is-live" : ""}`}><span />{product.isActive ? "Live" : "Hidden"}</span>
                      <button className="admin-product-edit" type="button" onClick={() => setEditing(product)} aria-label={`Edit ${product.name}`}>Edit</button>
                    </div>
                    <div className="admin-product-info">
                      <div className="admin-product-title"><h2>{product.name}</h2><strong>{formatMoney(product.price)}</strong></div>
                      <p>{product.description || "No description added yet."}</p>
                      <div className="admin-product-meta">
                        <span>{product.stock == null ? "Unlimited stock" : product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}</span>
                        <span className={product.stock === 0 ? "is-out-of-stock" : ""}>{product.stock === 0 ? "Restock needed" : product.isActive ? "Visible in shop" : "Not visible"}</span>
                      </div>
                      <div className="admin-product-actions">
                        <button type="button" onClick={() => toggleProduct(product)} disabled={actionId === product._id}>{actionId === product._id ? "Saving..." : product.isActive ? "Hide product" : "Make live"}</button>
                        <button className="admin-delete-button" type="button" onClick={() => removeProduct(product)} disabled={actionId === product._id}>Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {editing !== undefined && (
        <ProductForm
          product={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => productSaved(editing ? "Product updated." : "Product added to your shelf.")}
        />
      )}
    </div>
  );
}

function ProductForm({ product, onClose, onSaved }) {
  const [values, setValues] = useState(() => product ? {
    name: product.name,
    description: product.description || "",
    price: String(product.price),
    imageUrl: product.imageUrl || "",
    stock: product.stock == null ? "" : String(product.stock),
    isActive: product.isActive,
  } : blankProduct);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      imageUrl: values.imageUrl.trim(),
      stock: values.stock.trim() === "" ? null : Number(values.stock),
      isActive: values.isActive,
    };
    try {
      if (product) await updateAdminProduct(product._id, payload);
      else await createAdminProduct(payload);
      await onSaved();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <section className="admin-product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
        <header className="admin-drawer-header">
          <div><p className="admin-eyebrow">{product ? "MAKE IT JUST RIGHT" : "ADD TO YOUR SHELF"}</p><h2 id="product-dialog-title">{product ? "Edit product" : "New product"}</h2></div>
          <button className="admin-modal-close" type="button" onClick={onClose} disabled={busy} aria-label="Close product form">×</button>
        </header>
        <form className="admin-product-form" onSubmit={submit}>
          <label className="admin-field"><span>Product name</span><input name="name" value={values.name} onChange={update} maxLength={100} placeholder="What are you selling?" required /></label>
          <label className="admin-field"><span>Description <small>Optional · up to 500 characters</small></span><textarea name="description" value={values.description} onChange={update} maxLength={500} rows={3} placeholder="A little about this product..." /></label>
          <div className="admin-form-row">
            <label className="admin-field"><span>Price <small>KES</small></span><input name="price" type="number" value={values.price} onChange={update} min="0" max="10000000" step="1" placeholder="0" required /></label>
            <label className="admin-field"><span>Stock <small>Leave blank for unlimited</small></span><input name="stock" type="number" value={values.stock} onChange={update} min="0" step="1" placeholder="Unlimited" /></label>
          </div>
          <label className="admin-field"><span>Image URL <small>Optional · HTTPS link</small></span><input name="imageUrl" type="url" value={values.imageUrl} onChange={update} placeholder="https://..." /></label>
          <label className="admin-checkbox-field"><input name="isActive" type="checkbox" checked={values.isActive} onChange={update} /><span><strong>Show on storefront</strong><small>Customers can see and order this product.</small></span></label>
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <div className="admin-dialog-actions">
            <button className="admin-button admin-button-secondary" type="button" onClick={onClose} disabled={busy}>Cancel</button>
            <button className="admin-button admin-button-primary" type="submit" disabled={busy}>{busy ? "Saving..." : product ? "Save changes" : "Add product"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
