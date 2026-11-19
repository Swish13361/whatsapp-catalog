import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getOrderStatus } from "../api.js";
import { useAuthStore } from "../stores/authStore.js";
import { useLanguage } from "../useLanguage.js";
import {
  Button,
  PriceTag,
  StatusBadge,
  EmptyState,
  Skeleton,
  Panel,
  Icon,
  Chips,
  Modal,
  Toast,
  Tooltip,
  EmptyStateWithAction,
  Page,
  ToastProvider,
  useToast,
} from "../ui/index.js";

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

export default function MyOrders() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const auth = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    document.title = `My orders · Aether`;
  }, []);
  const [orders, setOrders] = useState(readOrderLog);
  const [filter, setFilter] = useState("");
  const [refreshing, setRefreshing] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    auth.initialize();
  }, [auth]);

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        orders.forEach((order) => {
          if (order.paymentStatus !== "PAID" && order.status !== "cancelled") {
            pollOrder(order.orderCode);
          }
        });
      }, 10000);
    }
    return () => clearInterval(refreshIntervalRef.current);
  }, [autoRefresh, orders]);

  const pollOrder = useCallback(async (orderCode) => {
    try {
      const data = await getOrderStatus(orderCode);
      setOrders((current) =>
        current.map((entry) =>
          entry.orderCode === orderCode
            ? { ...entry, status: data.status, paymentStatus: data.paymentStatus, total: data.total, currency: data.currency }
            : entry,
        ),
      );
      writeOrderLog(readOrderLog());
    } catch {
      // Silently skip; the stored copy remains valid.
    }
  }, []);

  const refreshOrder = (orderCode) => {
    setRefreshing((current) => ({ ...current, [orderCode]: true }));
    void pollOrder(orderCode).finally(() => {
      setRefreshing((current) => {
        const next = { ...current };
        delete next[orderCode];
        return next;
      });
    });
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
  };

  const visible = useMemo(() => orders.filter((entry) => !filter || entry.status === filter), [orders, filter]);
  const statuses = useMemo(() => [...new Set(orders.map((entry) => entry.status))], [orders]);
  const filterOptions = ["", ...statuses];

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

  return (
    <ToastProvider>
      <Page brand="Aether" variant="default" supportEmail="aetherlystore@gmail.com">
        <Panel title={t("myOrders")} description="Your orders and their current status." padded>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 animate-in slide-in-from-bottom">
            <div className="flex flex-wrap gap-2" role="group" aria-label={t("filterByStatus")}>
              <Chips
                options={filterOptions.map((s) => s || t("all"))}
                value={filter || t("all")}
                onValueChange={(value) => setFilter(value === t("all") ? "" : value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 rounded border border-line bg-surface text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
                {t("autoRefresh")}
              </label>
              {Object.keys(refreshing).length > 0 && (
                <span className="text-xs text-muted animate-pulse">
                  <Icon name="refreshCw" size={12} className="animate-spin inline-block" /> {t("updating")}
                </span>
              )}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyStateWithAction
              title={filter ? "No matching orders" : t("noOrders")}
              description={filter ? "Try a different status filter." : "Your orders will appear here after you place one."}
              icon={filter ? "search" : "package"}
              action={<Button onClick={() => navigate("/")}>{t("returnToStore")}</Button>}
              className="py-12 animate-in fade-in-0"
            />
          ) : (
            <div className="table-container animate-in slide-in-from-bottom">
              <table className="table-base">
                <thead>
                  <tr className="border-b border-line bg-surface/50">
                    <th className="th-base">{t("orderCode")}</th>
                    <th className="th-base">{t("orderDate")}</th>
                    <th className="th-base">{t("orderItems")}</th>
                    <th className="th-base">{t("total")}</th>
                    <th className="th-base">{t("statusLabel")}</th>
                    <th className="th-base"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((order) => (
                    <tr key={order.orderCode} className="hover:bg-accent-soft/30 transition-colors animate-in fade-in-0">
                      <td className="td-base text-sm font-bold text-text font-mono">{order.orderCode}</td>
                      <td className="td-base text-sm text-muted">{order.createdAt ? new Date(order.createdAt).toLocaleDateString(language) : "—"}</td>
                      <td className="td-base text-sm text-text max-w-xs truncate" title={order.items?.map((item) => `${item.name} ×${item.quantity}`).join(", ") || "1 item"}>
                        {order.items?.map((item) => `${item.name} ×${item.quantity}`).join(", ") || "1 item"}
                      </td>
                      <td className="td-base text-sm text-text">
                        <PriceTag amount={order.total ?? 0} currency={order.currency || "USDT"} />
                      </td>
                      <td className="td-base">
                        <StatusBadge status={order.paymentStatus ?? order.status} />
                      </td>
                      <td className="td-base">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openOrderDetail(order)}
                            className="gap-1.5"
                          >
                            <Icon name="externalLink" size={12} />
                            View
                          </Button>
                          {refreshing[order.orderCode] ? (
                            <button type="button" className="flex shrink-0 w-8 h-8 rounded-full border border-line text-muted" disabled aria-hidden="true">
                              <Icon name="refreshCw" size={12} className="animate-spin" />
                            </button>
                          ) : (
                            <Tooltip content={t("refreshStatus")} position="top">
                              <button type="button" onClick={() => refreshOrder(order.orderCode)} className="flex shrink-0 items-center justify-center w-8 h-8 rounded border border-line text-muted hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label="Refresh status">
                                <Icon name="refreshCw" size={12} />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </Page>

      {selectedOrder && (
        <Modal
          open={!!selectedOrder}
          onClose={closeOrderDetail}
          title={`${t("orderDetail")} #${selectedOrder.orderCode}`}
          size="lg"
        >
          <div className="space-y-6">
            <Panel padded>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">{t("orderCode")}</span>
                  <span className="text-base font-bold text-text font-mono">{selectedOrder.orderCode}</span>
                </div>
                <StatusBadge status={selectedOrder.paymentStatus === "PAID" ? "paid" : selectedOrder.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted">{t("orderDate")}</span>
                  <p className="font-medium text-text">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString(language) : "—"}</p>
                </div>
                <div>
                  <span className="text-muted">{t("total")}</span>
                  <PriceTag amount={selectedOrder.total ?? 0} currency={selectedOrder.currency || "USDT"} />
                </div>
                <div>
                  <span className="text-muted">{t("statusLabel")}</span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div>
                  <span className="text-muted">{t("paymentLabel")}</span>
                  <StatusBadge status={selectedOrder.paymentStatus ?? "unpaid"} />
                </div>
              </div>
            </Panel>

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <Panel title={t("orderItems")} padded>
                <ul className="divide-y divide-line">
                  {selectedOrder.items.map((item, index) => (
                    <li key={index} className="py-3 flex justify-between animate-in fade-in-0" style={{ animationDelay: `${index * 50}ms` }}>
                      <span className="text-sm text-text">{item.name}</span>
                      <span className="text-sm text-muted">× {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={closeOrderDetail}>
                {t("close")}
              </Button>
              <Button variant="primary" onClick={() => { navigate(`/orders/${selectedOrder.orderCode}`); closeOrderDetail(); }}>
                {t("viewFullDetails")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </ToastProvider>
  );
}


