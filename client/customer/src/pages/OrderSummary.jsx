import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createOrder, getOrderStatus, retryPayment } from "../api.js";
import { useCartStore } from "../stores/cartStore.js";
import { useStoreDataStore } from "../stores/storeDataStore.js";
import { formatPhone } from "../utils/phone.js";

export default function OrderSummary() {
  const { slug } = useParams();
  const normalizedSlug = slug.toLowerCase();
  const navigate = useNavigate();
  const storeResult = useStoreDataStore((state) => state.stores[normalizedSlug]);
  const fetchStore = useStoreDataStore((state) => state.fetchStore);
  const cartSlug = useCartStore((state) => state.slug);
  const storedCart = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const cart = cartSlug === normalizedSlug ? storedCart : [];
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PAY_ON_DELIVERY");
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState(null);
  const [formError, setFormError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchStore(normalizedSlug);
  }, [fetchStore, normalizedSlug]);

  useEffect(() => {
    if (!order?.orderCode) return undefined;

    let active = true;
    let redirectTimer;
    let interval;
    const poll = async () => {
      try {
        const result = await getOrderStatus(normalizedSlug, order.orderCode);
        if (!active) return;
        setStatus(result);
        setStatusError("");

        if (result.paymentStatus === "PAID" || result.status === "COMPLETED") {
          clearInterval(interval);
          redirectTimer = setTimeout(() => navigate("/", { replace: true }), 3000);
        }
      } catch (error) {
        if (active) setStatusError(error.message);
      }
    };

    interval = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(interval);
      clearTimeout(redirectTimer);
    };
  }, [navigate, order, normalizedSlug]);

  let formattedPhone = "";
  let phoneError = "";
  if (customerPhone) {
    try {
      formattedPhone = formatPhone(customerPhone);
    } catch {
      phoneError = "Enter a valid Kenyan phone number, such as 0712345678.";
    }
  }

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    if (isSubmitting || !customerName.trim() || !formattedPhone || cart.length === 0) return;

    setIsSubmitting(true);
    setFormError("");
    try {
      const result = await createOrder(normalizedSlug, {
        customerName: customerName.trim(),
        customerPhone: formattedPhone,
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim(),
        items: cart.map(({ productId, qty }) => ({
          productId,
          quantity: qty,
        })),
        paymentMethod,
      });
      setOrder(result);
      clearCart(normalizedSlug);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    setStatusError("");
    try {
      const result = await retryPayment(normalizedSlug, order.orderCode);
      setStatus(result);
    } catch (error) {
      setStatusError(error.message);
    }
  };

  if (!storeResult || storeResult.status === "loading") {
    return <p className="page-message">Loading checkout...</p>;
  }
  if (storeResult.status === "network-error") {
    return <p className="page-message error-message">{storeResult.error || "Couldn’t load this shop."}</p>;
  }
  if (storeResult.status === "not-found" || !storeResult.merchant) {
    return <p className="page-message">Store not found.</p>;
  }
  if (cart.length === 0 && !order) {
    return (
      <div className="page-message">
        <p>Your cart is empty.</p>
        <Link to={`/${encodeURIComponent(normalizedSlug)}`}>Return to store</Link>
      </div>
    );
  }

  return (
    <main className="order-summary">
      <header>
        <p className="eyebrow">CHECKOUT</p>
        <h1>Order from {storeResult.merchant.businessName}</h1>
      </header>

      {!order && (
        <form className="order-details" onSubmit={handleCreateOrder}>
          <h2>Customer details</h2>
          <label className="form-field">
            <span>Name</span>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Full name"
              maxLength={80}
              autoComplete="name"
              required
            />
          </label>
          <label className="form-field">
            <span>Phone</span>
            <input
              type="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="0712345678"
              autoComplete="tel"
              required
              aria-invalid={Boolean(phoneError)}
              aria-describedby={phoneError ? "phone-error" : undefined}
            />
            {phoneError && <span className="form-error" id="phone-error">{phoneError}</span>}
          </label>
          <label className="form-field">
            <span>Delivery address (optional)</span>
            <input
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              placeholder="Street, area, town"
              maxLength={200}
              autoComplete="street-address"
            />
          </label>
          <label className="form-field">
            <span>Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Special instructions"
              rows={3}
              maxLength={300}
            />
          </label>

          <h3>Payment method</h3>
          <label className="payment-option">
            <input
              type="radio"
              value="PAY_ON_DELIVERY"
              checked={paymentMethod === "PAY_ON_DELIVERY"}
              onChange={() => setPaymentMethod("PAY_ON_DELIVERY")}
            />
            Pay on delivery
          </label>
          <label className="payment-option">
            <input
              type="radio"
              value="MPESA"
              checked={paymentMethod === "MPESA"}
              onChange={() => setPaymentMethod("MPESA")}
            />
            M-Pesa
          </label>

          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button
            className="submit-button"
            type="submit"
            disabled={isSubmitting || !customerName.trim() || !formattedPhone || Boolean(phoneError)}
          >
            {isSubmitting ? "Placing order..." : "Place order"}
          </button>
        </form>
      )}

      {order && (
        <section className="order-confirmation" aria-live="polite">
          <h2>Order placed</h2>
          <p>Order code: <strong>{order.orderCode}</strong></p>
          <p>Total: <strong>KES {Number(order.total).toLocaleString()}</strong></p>
          <p>Payment method: {order.paymentMethod}</p>

          {paymentMethod === "PAY_ON_DELIVERY" && order.whatsappUrl && (
            <p>
              <a href={order.whatsappUrl} target="_blank" rel="noopener noreferrer">
                Open WhatsApp to confirm your order
              </a>
            </p>
          )}
          {paymentMethod === "MPESA" && order.paymentStarted && (
            <p>Check {formattedPhone} for the M-Pesa payment prompt.</p>
          )}
          {paymentMethod === "MPESA" && !order.paymentStarted && (
            <p className="form-error">The payment prompt could not be started. You can retry below.</p>
          )}
          {status && (
            <div className="order-status">
              <h3>Order status</h3>
              <p>Status: {status.status}</p>
              <p>Payment: {status.paymentStatus}</p>
              {status.whatsappUrl && (
                <a href={status.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              )}
              {status.paymentMethod === "MPESA" && status.paymentStatus === "UNPAID" && (
                <button className="submit-button" type="button" onClick={handleRetryPayment}>
                  Retry M-Pesa payment
                </button>
              )}
            </div>
          )}
          {statusError && <p className="form-error" role="alert">{statusError}</p>}
        </section>
      )}
    </main>
  );
}
