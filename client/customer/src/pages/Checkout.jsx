import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { createOrder, getOrderStatus, submitUsdtReference } from "../api.js";
import { useCartStore } from "../stores/cartStore.js";
import { SINGLE_STORE_KEY, useStoreDataStore } from "../stores/storeDataStore.js";
import { useLanguage } from "../useLanguage.js";
import {
  Button,
  Input,
  Card,
  Panel,
  PriceTag,
  StatusBadge,
  Badge,
  Icon,
  EmptyState,
  Skeleton,
  Stepper,
  Toast,
  LoadingOverlay,
  Tooltip,
  Page,
} from "../ui/index.js";
import { ToastProvider } from "../ui/index.js";
import { Footer } from "../layout/Footer.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

function localizeError(message, t) {
  if (message === "Enter a valid email address for delivery") return t("invalidEmail");
  const walletError = message.match(/^USDT payments on (.+) do not have a valid wallet address configured yet$/);
  if (walletError) return t("walletNotConfiguredError", { network: walletError[1] });
  return message || "Something went wrong. Try again.";
}

const checkoutSteps = [
  { label: "Details", description: "Customer info" },
  { label: "Payment", description: "Choose network" },
  { label: "Complete", description: "Confirm order" },
];

const paymentSteps = [
  { label: "Pay", description: "Send USDT" },
  { label: "Verify", description: "Submit hash" },
  { label: "Done", description: "Confirmed" },
];

export default function Checkout() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const storeResult = useStoreDataStore((state) => state.stores[SINGLE_STORE_KEY]);
  const fetchStore = useStoreDataStore((state) => state.fetchStore);
  const cartSlug = useCartStore((state) => state.slug);
  const storedCart = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const cart = cartSlug === SINGLE_STORE_KEY ? storedCart : [];
  const configuredNetworks = storeResult?.paymentOptions?.usdtNetworks ?? ["TRC20", "BEP20"];
  const supportedNetworks = storeResult?.paymentOptions?.supportedUsdtNetworks || ["TRC20", "BEP20"];
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentNetwork, setPaymentNetwork] = useState("TRC20");
  const [transactionHash, setTransactionHash] = useState("");
  const [isSubmittingHash, setIsSubmittingHash] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    void fetchStore();
  }, [fetchStore]);

  const merchant = storeResult?.merchant;
  const storeName = merchant?.businessName || "Aether";
  const trimmedEmail = customerEmail.trim();
  const emailError = trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail) ? t("invalidEmail") : "";
  const selectedNetwork = configuredNetworks.includes(paymentNetwork) ? paymentNetwork : configuredNetworks[0] || supportedNetworks[0];
  const isViewMode = Boolean(orderId);
  const stashedItems = isViewMode
    ? (() => { try { return JSON.parse(sessionStorage.getItem(`aether-order-items-${orderId}`) || "[]"); } catch { return []; } })()
    : null;

  useEffect(() => {
    if (!storeResult?.merchant) return undefined;
    const previousTitle = document.title;
    document.title = `${t("checkoutTitle")} | ${storeResult.merchant.businessName}`;
    return () => {
      document.title = previousTitle;
    };
  }, [storeResult?.merchant, t]);

  useEffect(() => {
    if (!isViewMode || !orderId) return undefined;
    setCurrentStep(0);
    let active = true;
    const poll = async () => {
      try {
        const data = await getOrderStatus(orderId);
        if (!active) return;
        setStatus(data);
        setStatusError("");
        if (data.paymentStatus === "PAID") setCurrentStep(2);
        else if (data.paymentReference) setCurrentStep(1);
      } catch (error) {
        if (active) setStatusError(localizeError(error.message, t));
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isViewMode, orderId, t]);

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    if (isSubmitting || !customerName.trim() || !EMAIL_PATTERN.test(trimmedEmail) || cart.length === 0) return;
    setIsSubmitting(true);
    setFormError("");
    try {
      const result = await createOrder({
        customerName: customerName.trim(),
        customerEmail: trimmedEmail,
        notes: notes.trim(),
        items: cart.map(({ productId, qty }) => ({ productId, quantity: qty })),
        paymentMethod: "USDT",
        paymentNetwork: selectedNetwork,
      });
      sessionStorage.setItem(`aether-order-items-${result.orderCode}`, JSON.stringify(cart));
      navigate(`/checkout/${result.orderCode}`, { replace: true });
    } catch (error) {
      setFormError(localizeError(error.message, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitHash = async (event) => {
    event.preventDefault();
    if (isSubmittingHash || !orderId) return;
    setIsSubmittingHash(true);
    setStatusError("");
    try {
      const result = await submitUsdtReference(orderId, transactionHash);
      setStatus((current) => ({ ...current, paymentReference: result.paymentReference }));
      setCurrentStep(1);
    } catch (error) {
      setStatusError(localizeError(error.message, t));
    } finally {
      setIsSubmittingHash(false);
    }
  };

  const copyWalletAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(status?.paymentAddress || "");
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch {
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    }
  }, [status?.paymentAddress]);

  if (!storeResult || storeResult.status === "loading") {
    return (
      <Page brand={storeName} variant="narrow">
        <div className="text-center py-24 animate-in fade-in-0">
          <Skeleton heading className="mx-auto w-64" />
          <p className="mt-4 text-sm text-muted">{t("loadingCheckout")}</p>
        </div>
      </Page>
    );
  }
  if (storeResult.status === "network-error") {
    return (
      <Page brand={storeName} variant="narrow">
        <EmptyState title={t("shopCouldNotLoad")} description={storeResult.error || t("connectionError")} action={<Button onClick={() => void fetchStore({ force: true })}>{t("tryAgain")}</Button>} />
      </Page>
    );
  }
  if (storeResult.status === "not-found" || !storeResult.merchant) {
    return <Page brand={storeName} variant="narrow"><EmptyState title={t("storeNotFound")} /></Page>;
  }

  const isPaid = status?.paymentStatus === "PAID";
  const expired = status?.paymentStatus === "EXPIRED";

  return (
    <ToastProvider>
      {!isViewMode ? (
        <Page brand={storeName} variant="sidebar-wide" supportEmail="support@aether.example">
          <Stepper steps={checkoutSteps} currentStep={currentStep} className="mb-6" />
          
          <section className="flex flex-col gap-6 min-w-0">
            <Panel title={t("customerDetails")} padded className="animate-in slide-in-from-bottom">
              <form onSubmit={handleCreateOrder} noValidate className="layout-form">
                <div className="form-field">
                  <label className="label-base">{t("name")}</label>
                  <Input
                    ref={nameRef}
                    className="input-base"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder={t("fullName")}
                    maxLength={80}
                    autoComplete="name"
                    required
                    error={!customerName.trim() && isSubmitting ? "Enter your name." : ""}
                  />
                </div>
                <div className="form-field">
                  <label className="label-base">{t("deliveryEmail")}</label>
                  <Input
                    ref={emailRef}
                    className="input-base"
                    type="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={254}
                    required
                    error={Boolean(emailError)}
                    aria-invalid={Boolean(emailError)}
                  />
                  {emailError && <p className="text-xs text-danger animate-in fade-in-0">{emailError}</p>}
                </div>
                <div className="form-field">
                  <label className="label-base">{t("orderNote")}</label>
                  <textarea className="textarea-base" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={t("orderNotePlaceholder")} rows={3} maxLength={300} />
                </div>
                {formError && <p className="text-sm text-danger animate-in fade-in-0" role="alert">{formError}</p>}
                <Button variant="primary" className="w-full h-10" loading={isSubmitting} type="submit" disabled={isSubmitting || !customerName.trim() || Boolean(emailError) || cart.length === 0}>
                  {t("placeOrder")}
                </Button>
              </form>
            </Panel>
          </section>

          <aside className="lg:sticky lg:top-20 flex flex-col gap-4 w-full shrink-0 animate-in slide-in-from-bottom" style={{ animationDelay: "100ms" }}>
            <Card padded className="shadow-sm border-line/50 hover:border-accent/30 transition-colors">
              <h3 className="text-xs font-bold text-muted uppercase mb-3">{t("paymentMethod")}</h3>
              <p className="text-sm text-muted mb-4">{t("usdtManual")}</p>
              <p className="text-xs text-muted mb-3">{t("chooseNetwork")}</p>
              <fieldset className="border-0 p-0 m-0 flex flex-col gap-2">
                <legend className="text-xs font-bold text-muted mb-2">{t("usdtNetwork")}</legend>
                {supportedNetworks.map((network) => (
                  <label key={network} className="flex items-center gap-3 cursor-pointer select-none group">
                    <input type="radio" name="paymentNetwork" value={network} checked={selectedNetwork === network} onChange={() => setPaymentNetwork(network)} className="w-4 h-4 rounded border border-line bg-surface text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" />
                    <span className="text-sm text-text">
                      {network === "TRC20" ? t("tronNetwork") : network === "BEP20" ? t("bnbNetwork") : t("binanceNetwork")}
                      {!configuredNetworks.includes(network) && <span className="text-xs text-muted ml-2">({t("notConfigured")})</span>}
                    </span>
                    {!configuredNetworks.includes(network) && (
                      <Tooltip content={t("networkNotConfigured")} position="right">
                        <Icon name="alertCircle" size={14} className="text-warning" />
                      </Tooltip>
                    )}
                  </label>
                ))}
              </fieldset>
              <div className="border-t border-line pt-4">
                <Badge variant={configuredNetworks.includes(selectedNetwork) ? "success" : "neutral"}>
                  {configuredNetworks.includes(selectedNetwork) ? t("enabled") : t("comingSoon")}
                </Badge>
              </div>
            </Card>
            
            <Card padded className="bg-accent-soft/30 border-accent/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Icon name="shoppingBag" size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text">{t("orderSummary")}</p>
                  <p className="text-xs text-muted">{cart.length} {t("productPlural")}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted">{t("subtotal")}</span>
                <PriceTag amount={cart.reduce((sum, item) => sum + item.price * item.qty, 0)} currency={cart[0]?.currency || "USDT"} />
              </div>
            </Card>
          </aside>
        </Page>
      ) : (
        <Page brand={storeName} variant="narrow" supportEmail="support@aether.example">
          <Stepper steps={paymentSteps} currentStep={currentStep} className="mb-6" />
          
          <Panel title={t("orderDetail")} description={`#${orderId}`} padded>
            <div className="layout-split">
              <div className="flex flex-col gap-6">
                <div className="card-padded animate-in slide-in-from-bottom">
                  <div className="flex items-center justify-between mb-2">
                    <span className="label-base">{t("orderCode")}</span>
                    <span className="text-sm font-bold text-text">{orderId}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="label-base">{t("total")}</span>
                    <span className="text-sm font-bold text-text">
                      <PriceTag amount={status?.total ?? 0} currency={status?.currency || "USDT"} />
                    </span>
                  </div>
                  {stashedItems.length > 0 && (
                    <div className="mt-3 border-t border-line pt-3">
                      <span className="label-base block mb-1">{t("orderItems")}</span>
                      {stashedItems.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-text mb-1">
                          <span>{item.name}</span>
                          <span>× {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 animate-in slide-in-from-bottom">
                  <span className="label-base">{t("statusLabel")}</span>
                  <StatusBadge status={status?.status ?? "new"} />
                </div>
                <div className="flex items-center gap-3 animate-in slide-in-from-bottom">
                  <span className="label-base">{t("paymentLabel")}</span>
                  <StatusBadge status={expired ? "expired" : status?.paymentStatus ?? "unpaid"} />
                  {expired && <span className="text-xs text-danger animate-in fade-in-0">Payment window expired.</span>}
                </div>
                {statusError && <p className="text-sm text-danger animate-in fade-in-0" role="alert">{statusError}</p>}
                {status?.whatsappUrl && (
                  <a href={status.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-accent hover:text-accent-hover underline underline-offset-2 flex items-center gap-1.5">
                    <Icon name="mail" size={12} /> {t("chatOnWhatsApp")}
                  </a>
                )}
              </div>
              {status && (
                <Panel title={t("paymentDetails")} padded className="animate-in slide-in-from-bottom">
                  
                  <p>{t("payWithUsdtNetwork", { network: status?.paymentNetwork })}</p>
                  <p className="text-sm text-muted">{t("afterPaymentConfirmed", { email: trimmedEmail || "the email address on this order" })}</p>
                  <p>{t("sendExactAmount", { amount: Number(status?.cryptoAmount ?? status?.total ?? 0).toFixed(2), network: status?.paymentNetwork })}</p>
                  <p className="text-sm text-warning">{t("cryptoWarning")}</p>
                  
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="flex items-start gap-4">
                      <QRCodeCanvas value={status?.paymentAddress} size={192} level="M" includeMargin className="qr-code-fixed" />
                      <div className="flex flex-col gap-2 flex-grow pt-4">
                        <div className="flex items-center gap-2">
                          <span className="label-base">Wallet address</span>
                          <Tooltip content={t("copyWalletAddress")} position="top">
                            <button
                              type="button"
                              onClick={copyWalletAddress}
                              disabled={!status?.paymentAddress}
                              className="text-xs font-bold text-accent hover:text-accent-hover underline underline-offset-2 flex items-center gap-1"
                            >
                              <Icon name="copy" size={12} /> {t("copy")}
                            </button>
                          </Tooltip>
                        </div>
                        <code className="address-wrap">{status?.paymentAddress}</code>
                      </div>
                    </div>
                    
                    {isPaid ? (
                      <div className="p-4 bg-success-soft border border-success rounded-lg animate-in zoom-in-95">
                        <div className="flex items-center gap-2 text-success">
                          <Icon name="checkCircle" size={20} />
                          <span className="font-bold">{t("paymentConfirmed", { email: trimmedEmail || "the email address on this order" })}</span>
                        </div>
                        <p className="text-sm text-success mt-1">{t("downloadLinksSent")}</p>
                        <Button variant="secondary" className="w-full mt-3 h-10" onClick={() => navigate("/orders")}>
                          {t("viewOrders")}
                        </Button>
                      </div>
                    ) : status?.paymentReference ? (
                      <div className="p-4 bg-warning-soft border border-warning rounded-lg animate-in zoom-in-95">
                        <div className="flex items-center gap-2 text-warning">
                          <Icon name="clock" size={20} />
                          <span className="font-bold">{t("transactionSubmitted")}</span>
                        </div>
                        <p className="text-sm text-warning mt-1">{t("awaitingConfirmation")}</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitHash} className="mt-4 layout-form animate-in slide-in-from-bottom">
                        <div className="form-field">
                          <label className="label-base">{t("transactionHash")}</label>
                          <Input
                            className="input-base font-mono"
                            value={transactionHash}
                            onChange={(event) => setTransactionHash(event.target.value.toLowerCase())}
                            minLength={64}
                            maxLength={64}
                            placeholder={t("transactionHashPlaceholder")}
                            required
                            pattern="[a-fA-F0-9]{64}"
                            error={transactionHash.length > 0 && transactionHash.length !== 64}
                          />
                          {transactionHash.length > 0 && transactionHash.length !== 64 && (
                            <p className="text-xs text-danger">{t("hashMustBe64Chars")}</p>
                          )}
                        </div>
                        <Button variant="primary" className="w-full h-10" loading={isSubmittingHash} type="submit" disabled={isSubmittingHash || transactionHash.length !== 64}>
                          {isSubmittingHash ? t("submitting") : t("submitTransactionHash")}
                        </Button>
                      </form>
                    )}
                  </div>
                </Panel>
              )}
            </div>
          </Panel>
        </Page>
      )}
      <Footer supportEmail="support@aether.example" />
      
      {showCopyToast && (
        <Toast message={t("walletCopied")} variant="success" onClose={() => setShowCopyToast(false)} duration={2000} />
      )}
    </ToastProvider>
  );
}


