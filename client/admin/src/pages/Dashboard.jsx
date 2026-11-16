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
import "./Dashboard.css";

function Dashboard() {
  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const data = await adminProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to fetch products");
    }
  }, []);

  const fetchOrders = useCallback(async (filter = statusFilter) => {
    try {
      const data = await adminOrders(filter ? { status: filter } : {});
      setOrders(data.orders);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
    }
  }, [statusFilter]);

  useEffect(() => {
    let active = true;
    Promise.all([
      adminMe(),
      adminProducts(),
      adminOrders(statusFilter ? { status: statusFilter } : {}),
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
  }, [statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminCreateProduct({
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        imageUrl: newProduct.imageUrl || undefined,
      });
      setNewProduct({ name: "", description: "", price: "", imageUrl: "" });
      setShowCreate(false);
      fetchProducts();
    } catch (err) {
      setError(err.message || "Failed to create product");
    }
  };

  const handleEdit = async (product) => {
    setEditingProduct({ ...product });
    setShowCreate(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await adminUpdateProduct(editingProduct._id, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        imageUrl: editingProduct.imageUrl || undefined,
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
    try {
      await adminMarkPaid(id);
      fetchOrders();
    } catch (err) {
      setError(err.message || "Failed to update payment status");
    }
  };

  return (
    <div className="dashboard">
      {error && <p className="dashboard-error" role="alert">{error}</p>}

      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">MERCHANT DASHBOARD</p>
          <h1>{merchant ? `Welcome, ${merchant.businessName}` : "Your shop"}</h1>
          <p className="dashboard-intro">A clear view of your products and customer orders.</p>
        </div>
      </header>

      {merchant && <StoreLinkCard slug={merchant.slug} compact />}
      {products.length === 0 && (
        <aside className="dashboard-product-warning" role="status">
          <div>
            <strong>Your store is empty.</strong>
            <span>Add a product so customers have something to buy.</span>
          </div>
          <a href="#products">Go to Products <span aria-hidden="true">→</span></a>
        </aside>
      )}

      <section className="dashboard-summary" aria-label="Shop summary">
        <article className="summary-card">
          <span className="summary-icon summary-icon-products" aria-hidden="true">▤</span>
          <div><strong>{products.length}</strong><span>Products</span></div>
          <small>In your catalogue</small>
        </article>
        <article className="summary-card">
          <span className="summary-icon summary-icon-orders" aria-hidden="true">◷</span>
          <div><strong>{orders.length}</strong><span>Orders</span></div>
          <small>Matching the current filter</small>
        </article>
        <article className="summary-card">
          <span className="summary-icon summary-icon-new" aria-hidden="true">✳</span>
          <div><strong>{orders.filter((order) => order.status === "NEW").length}</strong><span>New orders</span></div>
          <small>Ready for your attention</small>
        </article>
      </section>

      <section className="products" id="products">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-eyebrow">YOUR CATALOGUE</p>
            <h2>Products <span className="section-count">{products.length}</span></h2>
            <p className="section-description">Keep the items in your shop up to date.</p>
          </div>
          <button className="dashboard-button dashboard-button-primary" onClick={() => { setEditingProduct(null); setShowCreate(true); }}>
            <span aria-hidden="true">＋</span> Add product
          </button>
        </div>

        <div className="product-form">
          {showCreate && !editingProduct && (
            <form className="product-editor" onSubmit={handleCreate}>
              <input
                placeholder="Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
              <input
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
              <input
                placeholder="Image URL (https://...)"
                value={newProduct.imageUrl}
                onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
              />
              <div className="editor-actions">
                <button className="dashboard-button dashboard-button-primary" type="submit">Save product</button>
                <button className="dashboard-button dashboard-button-muted" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          )}
          {showCreate && editingProduct && (
            <form className="product-editor" onSubmit={handleUpdate}>
              <input
                placeholder="Name"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                required
              />
              <input
                placeholder="Description"
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                required
              />
              <input
                placeholder="Image URL"
                value={editingProduct.imageUrl}
                onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
              />
              <div className="editor-actions">
                <button className="dashboard-button dashboard-button-primary" type="submit">Save changes</button>
                <button className="dashboard-button dashboard-button-muted" type="button" onClick={() => { setEditingProduct(null); setShowCreate(false); }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {products.length === 0 ? (
          <div className="dashboard-empty">
            <span aria-hidden="true">◇</span>
            <h3>Your catalogue is ready for its first product</h3>
            <p>Add an item so customers can start browsing your shop.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image-wrap">
                  {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                  />
                  ) : <span className="product-image-placeholder" aria-hidden="true">◇</span>}
                </div>
                <div className="product-card-info">
                  <span className="product-name">{product.name}</span>
                  <span className="product-price">KES {Number(product.price).toLocaleString("en-KE")}</span>
                </div>
                <div className="product-card-actions">
                  <button className="dashboard-button dashboard-button-muted" onClick={() => handleEdit(product)}>Edit</button>
                  <button className="dashboard-button dashboard-button-danger" onClick={() => handleDelete(product._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="orders">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-eyebrow">CUSTOMER ACTIVITY</p>
            <h2>Orders <span className="section-count">{orders.length}</span></h2>
            <p className="section-description">Follow each order from new to delivered.</p>
          </div>
        </div>

        <div className="orders-filter">
          <button onClick={() => setStatusFilter("")} className={statusFilter === "" && "active"}>
            All Orders
          </button>
          <button onClick={() => setStatusFilter("NEW")} className={statusFilter === "NEW" && "active"}>
            NEW
          </button>
          <button onClick={() => setStatusFilter("PREPARING")} className={statusFilter === "PREPARING" && "active"}>
            PREPARING
          </button>
          <button onClick={() => setStatusFilter("OUT_FOR_DELIVERY")} className={statusFilter === "OUT_FOR_DELIVERY" && "active"}>
            OUT_FOR_DELIVERY
          </button>
          <button onClick={() => setStatusFilter("COMPLETED")} className={statusFilter === "COMPLETED" && "active"}>
            COMPLETED
          </button>
          <button onClick={() => setStatusFilter("CANCELLED")} className={statusFilter === "CANCELLED" && "active"}>
            CANCELLED
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="dashboard-empty dashboard-empty-compact">
            <span aria-hidden="true">◷</span>
            <h3>No orders here yet</h3>
            <p>New customer orders will show up here.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-item">
                <div className="order-customer">
                  <span className="order-code">#{order.orderCode}</span>
                  <span>{order.customerName}</span>
                </div>
                <div className="order-facts">
                  <strong className="order-total">KES {Number(order.total).toLocaleString("en-KE")}</strong>
                  <span className={`order-status order-status-${String(order.status).toLowerCase().replaceAll("_", "-")}`}>{order.status.replaceAll("_", " ")}</span>
                  <span className={`payment-status${order.paymentStatus === "PAID" ? " is-paid" : ""}`}>{order.paymentStatus}</span>
                </div>
                <div className="order-actions">
                  {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                    <button onClick={() => handleOrderStatus(order._id, "PREPARING")}>
                      Prepare
                    </button>
                  )}
                  {order.status === "PREPARING" && (
                    <>
                      <button onClick={() => handleOrderStatus(order._id, "OUT_FOR_DELIVERY")}>
                        Ship
                      </button>
                      <button onClick={() => handleOrderStatus(order._id, "CANCELLED")}>
                        Cancel
                      </button>
                    </>
                  )}
                  {order.status === "OUT_FOR_DELIVERY" && (
                    <button onClick={() => handleOrderStatus(order._id, "COMPLETED")}>
                      Complete
                    </button>
                  )}
                  {order.paymentStatus === "UNPAID" && (
                    <button onClick={() => handleMarkPaid(order._id)}>Mark Paid</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;