import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderStatus } from "../api.js";
import { useAuthStore } from "../stores/authStore.js";
import { useLanguage } from "../useLanguage.js";
import { useToast } from "../ui/index.js";
import {
  Button,
  Icon,
  PriceTag,
  StatusBadge,
  EmptyState,
  Skeleton,
  Panel,
  Toast,
  Modal,
  EmptyStateWithAction,
  Tooltip,
  Page,
} from "../ui/index.js";
import { ToastProvider } from "../ui/index.js";

const ORDER_LOG_KEY = "aether-orders";

function readOrderLog() {
  try {
    return JSON.parse(localStorage.getItem(ORDER_LOG_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeOrderLog(orders) {
  try {
    localStorage.setItem(ORDER_LOG_KEY, JSON.stringify(orders));
  } catch {
    // Storage unavailable; orders live only for this session.
  }
}

export default function OrderDetail() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useAuthStore();
  const { id: orderCode } = useParams();
  const [showCopyToast, setShowCopyToast] = useState(false);

  useEffect(() => {
    document.title = `Order #${orderCode} · Aether`;
  }, [orderCode]);
  const [orders, setOrders] = useState(readOrderLog);
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    auth.initialize();
  }, [auth]);

  const order = orders.find((entry) => entry.orderCode === orderCode);

  useEffect(() => {
    if (!orderCode) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const data = await getOrderStatus(orderCode);
        if (!active) return;
        setStatus(data);
        setStatusError("");
        setOrders((current) =>
          current.map((entry) =>
            entry.orderCode === orderCode
              ? { ...entry, status: data.status, paymentStatus: data.paymentStatus, total: data.total, currency: data.currency }
              : entry,
          ),
        );
        writeOrderLog(readOrderLog());
      } catch (error) {
        if (active) setStatusError(error.message || "Could not refresh order status.");
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderCode]);

  const isPaid = status?.paymentStatus === "PAID";

  const copyToClipboard = useCallback((text, message) => {
    navigator.clipboard.writeText(text);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
    toast({ title: message, variant: "success" });
  }, [toast]);

  if (auth.status === "loading") {
    return (
      <Page brand="Aether" variant="default">
        <div className="text-center py-24 animate-in fade-in-0">
          <Skeleton heading className="mx-auto w-64" />
          <p className="mt-4 text-sm text-muted">{t("loadingCheckout")}</p>
        </div>
      </Page>
    );
  }
  if (auth.status === "unauthenticated") {
    return (
      <Page brand="Aether" variant="default">
        <EmptyStateWithAction
          title={t("notAuthorized")}
          description={t("adminOnly")}
          icon="lock"
          action={<Button onClick={() => navigate("/login")}>{t("signIn")}</Button>}
        />
      </Page>
    );
  }
  if (!order) {
    return (
      <Page brand="Aether" variant="default">
        <EmptyStateWithAction
          title={t("orderNotFound")}
          description="No order with that number was found."
          icon="package"
          action={<Button onClick={() => navigate("/orders")}>{t("myOrders")}</Button>}
        />
      </Page>
    );
  }

  return (
    <ToastProvider>
      <Page brand="Aether" variant="sidebar" supportEmail="support@aether.example">
        <div className="grid lg:grid-cols-[5fr_7fr] gap-6 lg:gap-8">
          <section className="flex flex-col gap-6 min-w-0">
            <Panel title={t("orderDetail")} description={`#${order.orderCode}`} padded className="animate-in slide-in-from-bottom">
              <dl className="divide-y divide-line">
                <div className="py-3 flex justify-between">
                  <dt className="text-xs font-bold text-muted">{t("orderCode")}</dt>
                  <dd className="text-sm font-bold text-text font-mono">{order.orderCode}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-xs font-bold text-muted">{t("orderDate")}</dt>
                  <dd className="text-sm text-muted">{order.createdAt ? new Date(order.createdAt).toLocaleDateString(language) : "—"}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-xs font-bold text-muted">{t("total")}</dt>
                  <dd className="text-sm font-bold text-text">
                    <PriceTag amount={(status?.total ?? order.total) ?? 0} currency={(status?.currency ?? order.currency) || "USDT"} />
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-xs font-bold text-muted">{t("statusLabel")}</dt>
                  <dd className="text-sm font-bold text-text">
                    <StatusBadge status={status?.status ?? order.status} className="animate-in zoom-in-95" />
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-xs font-bold text-muted">{t("paymentLabel")}</dt>
                  <dd className="text-sm font-bold text-text">
                    <StatusBadge status={status?.paymentStatus ?? order.paymentStatus ?? "unpaid"} className="animate-in zoom-in-95" />
                  </dd>
                </div>
              </dl>
              {statusError && <p className="text-sm text-danger animate-in fade-in-0" role="alert">{statusError}</p>}
            </Panel>

            {order.items && order.items.length > 0 && (
              <Panel title={t("orderItems")} padded className="animate-in slide-in-from-bottom" style={{ animationDelay: "100ms" }}>
                <ul className="divide-y divide-line">
                  {order.items.map((item, index) => (
                    <li key={index} className="py-3 flex justify-between animate-in fade-in-0" style={{ animationDelay: `${index * 50}ms` }}>
                      <span className="text-sm text-text">{item.name}</span>
                      <span className="text-sm text-muted">× {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </section>

          <aside className="lg:sticky lg:top-20 flex flex-col gap-4 w-full shrink-0 animate-in slide-in-from-bottom" style={{ animationDelay: "150ms" }}>
            <Panel title={t("paymentDetails")} padded>
              <p className="text-sm text-muted">{t("afterPaymentConfirmed", { email: order.customerEmail || "the email address on this order" })}</p>
              {status?.paymentMethod && (
                <p className="text-sm text-muted mt-2">{status.paymentMethod}{status.paymentNetwork ? ` · ${status.paymentNetwork}` : ""}</p>
              )}
              {status?.paymentAddress && (
                <div className="mt-4 animate-in slide-in-from-bottom">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-muted">Wallet address</p>
                    <Tooltip content={t("copyWalletAddress")} position="top">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(status.paymentAddress, t("walletCopied"))}
                        className="text-xs font-bold text-accent hover:text-accent-hover underline underline-offset-2 flex items-center gap-1"
                      >
                        <Icon name="copy" size={12} />
                      </button>
                    </Tooltip>
                  </div>
                  <code className="address-wrap">{status.paymentAddress}</code>
                </div>
              )}
              {isPaid ? (
                <div className="mt-4 p-4 bg-success-soft border border-success rounded-lg animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-success mb-2">
                    <Icon name="checkCircle" size={20} />
                    <span className="font-bold">{t("paymentConfirmed", { email: order.customerEmail || "" })}</span>
                  </div>
                  <p className="text-sm text-success">{t("downloadLinksSent")}</p>
                </div>
              ) : status?.paymentReference ? (
                <div className="mt-4 p-4 bg-warning-soft border border-warning rounded-lg animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-warning mb-2">
                    <Icon name="clock" size={20} />
                    <span className="font-bold">{t("transactionSubmitted")}</span>
                  </div>
                  <p className="text-sm text-warning">{t("awaitingConfirmation")}</p>
                </div>
              ) : null}
            </Panel>

            {isPaid && (
              <Panel title={t("downloads")} padded className="animate-in slide-in-from-bottom" style={{ animationDelay: "100ms" }}>
                <p className="text-sm text-muted mb-4">{t("downloadsOnlyWhenPaid")}</p>
                <ul className="divide-y divide-line">
                  {order.items.map((item, index) => (
                    <li key={index} className="py-3 flex items-center justify-between animate-in fade-in-0" style={{ animationDelay: `${index * 50}ms` }}>
                      <div>
                        <span className="text-sm text-text">{item.name}</span>
                        <span className="text-xs text-muted">Digital download</span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toast({ title: t("downloadLinkSent", { email: order.customerEmail || "" }), variant: "success" })}
                      >
                        <Icon name="download" size={12} className="mr-1" />
                        {t("download")}
                      </Button>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {!isPaid && order.items && order.items.length > 0 && (
              <Panel padded className="bg-accent-soft/30 border-accent/50 animate-in slide-in-from-bottom" style={{ animationDelay: "150ms" }}>
                <p className="text-sm text-muted text-center">
                  <Icon name="lock" size={16} className="inline-block mr-1" />
                  {t("payToUnlockDownloads")}
                </p>
              </Panel>
            )}
          </aside>
        </div>
      </Page>
      <Footer supportEmail="support@aether.example" />

      {showCopyToast && (
        <Toast message={t("walletCopied")} variant="success" onClose={() => setShowCopyToast(false)} duration={2000} />
      )}
    </ToastProvider>
  );
}
