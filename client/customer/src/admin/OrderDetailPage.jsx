import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getAdminOrder, updateAdminOrderStatus, markAdminOrderPaid } from "../api.js";
import { useLanguage } from "../useLanguage.js";
import { Button, PriceTag, StatusBadge, EmptyState, Skeleton, Panel } from "../ui/index.js";
import { TopBar } from "../layout/TopBar.jsx";
import { Footer } from "../layout/Footer.jsx";
import { ToastProvider } from "../ui/index.js";

const STATUS_NEXT = {
  NEW: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const formatStatus = (value = "") => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value) => new Date(value).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

export default function OrderDetailPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setOrder(await getAdminOrder(id));
      } catch (requestError) {
        setError(requestError.message || "Could not load this order.");
      }
    };
    void load();
  }, [id]);

  const updateStatus = async () => {
    if (!order) return;
    setBusy(true);
    setError("");
    try {
      await updateAdminOrderStatus(order._id, nextStatus);
      setOrder((current) => ({ ...current, status: nextStatus }));
      setNextStatus("");
    } catch (requestError) {
      setError(requestError.message || "Could not update the order status.");
    } finally {
      setBusy(false);
    }
  };

  const markPaid = async () => {
    if (!order) return;
    if (!window.confirm("Only mark paid after verifying the transaction hash, network, receiving address, and amount. Mark this order paid?")) return;
    setBusyId(order._id);
    setError("");
    try {
      await markAdminOrderPaid(order._id);
      setOrder((current) => ({ ...current, paymentStatus: "PAID" }));
    } catch (requestError) {
      setError(requestError.message || "Could not mark the order as paid.");
    } finally {
      setBusyId("");
    }
  };

  const paymentMethodLabel = (order) => {
    if (order.paymentMethod === "USDT") return `USDT · ${order.paymentNetwork}`;
    if (order.paymentMethod === "ALIPAY") return "Alipay";
    if (order.paymentMethod === "BANK_TRANSFER") return "Bank transfer";
    if (order.paymentMethod === "MPESA") return "M-Pesa";
    return "Pay on delivery";
  };

  if (order === null && !error) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-24 text-center">
        <Skeleton heading className="mx-auto w-64" />
        <p className="mt-4 text-sm text-muted">{t("loadingCheckout")}</p>
      </main>
    );
  }
  if (!order) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-24">
        <EmptyState title="Order not found" description={error} action={<Button onClick={() => navigate("/admin/orders")}>Back to orders</Button>} />
      </main>
    );
  }

  return (
    <ToastProvider>
      <TopBar brand="Aether" />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link to="/admin/orders" className="text-xs font-bold text-accent hover:text-accent-hover underline underline-offset-2">Back to orders</Link>
          <h1 className="text-xl font-bold text-text">Order #{order.orderCode}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          <div className="flex flex-column gap-6 min-w-0">
            <Panel title="Order summary" padded>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Order number</span>
                  <span className="font-bold text-text">{order.orderCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Date</span>
                  <span className="text-muted">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Customer</span>
                  <span className="font-bold text-text">{order.customerName}</span>
                </div>
                {order.customerEmail && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Delivery email</span>
                    <a href={`mailto:${order.customerEmail}`} className="text-accent hover:text-accent-hover underline underline-offset-2">{order.customerEmail}</a>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Phone</span>
                    <span className="text-muted">{order.customerPhone}</span>
                  </div>
                )}
                {order.deliveryAddress && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Address</span>
                    <span className="text-muted">{order.deliveryAddress}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-line pt-3">
                  <span className="text-muted">Total</span>
                  <span className="font-bold text-text"><PriceTag amount={order.total} currency={order.currency || "USDT"} /></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Order status</span>
                  <span className="font-bold text-text">{formatStatus(order.status)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Payment status</span>
                  <StatusBadge status={order.paymentStatus} />
                </div>
                {order.notes && (
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="text-xs font-bold text-muted uppercase">Note from customer</p>
                    <p className="text-sm text-text">{order.notes}</p>
                  </div>
                )}
              </div>
            </Panel>

            {order.items && order.items.length > 0 && (
              <Panel title="Items" padded>
                <ul className="divide-y divide-line">
                  {order.items.map((item, index) => (
                    <li key={index} className="py-3 flex justify-between">
                      <div>
                        <p className="text-sm text-text">{item.name}</p>
                        <p className="text-xs text-muted">Quantity {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-text"><PriceTag amount={item.price * item.quantity} currency={order.currency || "USDT"} /></span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-line pt-3 flex justify-between">
                  <span className="text-xs font-bold text-muted">Order total</span>
                  <span className="text-sm font-bold text-text"><PriceTag amount={order.total} currency={order.currency || "USDT"} /></span>
                </div>
              </Panel>
            )}
          </div>

          <aside className="lg:sticky lg:top-4 flex flex-column gap-4 w-[420px] shrink-0">
            <Panel title="Payment" padded>
              <p className="text-sm text-muted">{paymentMethodLabel(order)}</p>
              {order.paymentAddress && (
                <div className="mt-3">
                  <p className="text-xs font-bold text-muted">Receiving address</p>
                  <code className="text-xs text-text break-all">{order.paymentAddress}</code>
                </div>
              )}
              {order.paymentReference && (
                <div className="mt-3">
                  <p className="text-xs font-bold text-muted">Transaction hash</p>
                  <code className="text-xs text-text break-all">{order.paymentReference}</code>
                </div>
              )}
              {order.mpesaReceipt && (
                <div className="mt-3">
                  <p className="text-xs font-bold text-muted">M-Pesa receipt</p>
                  <span className="text-xs text-text">{order.mpesaReceipt}</span>
                </div>
              )}
              {order.paymentNote && (
                <div className="mt-3 p-3 rounded-lg border border-line bg-danger-soft text-danger">
                  <p className="text-xs text-danger">{order.paymentNote}</p>
                </div>
              )}
              {(order.paymentMethod === "PAY_ON_DELIVERY" || (order.paymentMethod === "USDT" && order.paymentReference)) && order.paymentStatus === "UNPAID" && order.status !== "CANCELLED" && (
                <div className="mt-4">
                  <Button variant="danger" className="w-full" disabled={busyId === order._id} onClick={markPaid}>
                    {busyId === order._id ? "Saving…" : "Mark as paid"}
                  </Button>
                </div>
              )}
            </Panel>

            <Panel title="Move this order along" padded>
              {STATUS_NEXT[order.status]?.length > 0 ? (
                <div className="space-y-3">
                  <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="block w-full min-w-0 rounded-lg border border-line bg-surface text-text placeholder:text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent h-10 px-3 text-sm">
                    <option value="">Choose a status</option>
                    {STATUS_NEXT[order.status].map((status) => (
                      <option key={status} value={status}>{formatStatus(status)}</option>
                    ))}
                  </select>
                  <Button variant="primary" className="w-full" disabled={!nextStatus || busy} onClick={updateStatus} loading={busy}>
                    {busy ? "Saving…" : "Update"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted">No further status changes available for this order.</p>
              )}
            </Panel>
          </aside>
        </div>
      </main>
      <Footer supportEmail="aetherlystore@gmail.com" />
    </ToastProvider>
  );
}




