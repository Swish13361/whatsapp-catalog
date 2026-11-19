import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getOrderStatus } from "../api.js";
import { useLanguage } from "../useLanguage.js";
import { useToast } from "../ui/index.js";
import {
  Button,
  Input,
  Panel,
  PriceTag,
  StatusBadge,
  Icon,
  EmptyStateWithAction,
  LoadingOverlay,
  Toast,
  Modal,
  Page,
} from "../ui/index.js";
import { ToastProvider } from "../ui/index.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OrderLookup() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const orderCodeRef = useRef(null);

  useEffect(() => {
    document.title = `Look up an order · Aether`;
    orderCodeRef.current?.focus();
  }, []);

  const [orderCode, setOrderCode] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    if (name === "orderCode" && !value.trim()) return "Enter your order number.";
    if (name === "email" && !value.trim()) return "Enter your email address.";
    if (name === "email" && value.trim() && !EMAIL_PATTERN.test(value.trim())) return t("invalidEmail");
    return "";
  };

  const handleLookup = async (event) => {
    event.preventDefault();
    const orderCodeError = validateField("orderCode", orderCode);
    const emailError = validateField("email", email);
    
    setFieldErrors({ orderCode: orderCodeError, email: emailError });
    setError("");
    setResult(null);
    
    if (orderCodeError || emailError) {
      if (orderCodeError) orderCodeRef.current?.focus();
      else orderCodeRef.current?.focus();
      return;
    }
    
    setSubmitting(true);
    try {
      const data = await getOrderStatus(orderCode.trim());
      setResult(data);
      toast(t("orderFound"), "success");
    } catch (requestError) {
      setError(requestError.code === 404 || requestError.message.includes("not found") ? t("orderNotFound") : requestError.message || t("orderNotFound"));
      toast(t("orderNotFound"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (name, value) => {
    if (name === "orderCode") setOrderCode(value);
    if (name === "email") setEmail(value);
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
    setError("");
  };

  const isPaid = result?.paymentStatus === "PAID";

  return (
    <ToastProvider>
      <Page brand="Aether" variant="narrow" supportEmail="aetherlystore@gmail.com">
        <Panel title={t("orderLookup")} description="Enter your order number and the email address used for delivery." padded>
          <form onSubmit={handleLookup} className="layout-form" noValidate>
            <div className="form-field">
              <label className="label-base">{t("orderNumber")}</label>
              <Input
                ref={orderCodeRef}
                value={orderCode}
                onChange={(event) => handleInputChange("orderCode", event.target.value)}
                placeholder="ORD-ABCDE"
                required
                error={Boolean(fieldErrors.orderCode)}
                autoComplete="off"
              />
              {fieldErrors.orderCode && <p className="text-xs text-danger animate-in fade-in-0">{fieldErrors.orderCode}</p>}
            </div>
            <div className="form-field">
              <label className="label-base">{t("lookupEmail")}</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => handleInputChange("email", event.target.value)}
                placeholder="you@example.com"
                required
                inputMode="email"
                error={Boolean(fieldErrors.email)}
                autoComplete="email"
              />
              {fieldErrors.email && <p className="text-xs text-danger animate-in fade-in-0">{fieldErrors.email}</p>}
            </div>
            {error && <p className="text-sm text-danger animate-in fade-in-0" role="alert">{error}</p>}
            <Button variant="primary" className="w-full h-10" disabled={submitting} type="submit" loading={submitting}>
              {submitting ? t("submitting") : t("lookupButton")}
            </Button>
          </form>
        </Panel>

        {result && (
          <section className="mt-6 animate-in slide-in-from-bottom">
            <Modal
              open={!!result}
              onClose={() => setResult(null)}
              title={`${t("orderDetail")} #${result.orderCode}`}
              size="lg"
            >
              <div className="space-y-6">
                <Panel padded>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-muted">{t("orderCode")}</span>
                      <span className="text-base font-bold text-text">{result.orderCode}</span>
                    </div>
                    <StatusBadge status={result.paymentStatus === "PAID" ? "paid" : result.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1.5"><Icon name="clock" size={14} /> {t("total")}: <PriceTag amount={result.total} currency={result.currency || "USDT"} /></span>
                    <span className="flex items-center gap-1.5"><Icon name="mail" size={14} /> {result.paymentMethod}</span>
                    {result.paymentMethod === "USDT" && (
                      <span className="flex items-center gap-1.5"><Icon name="clock" size={14} /> {result.paymentNetwork}</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-muted">{t("afterPaymentConfirmed", { email: email.trim() || result.customerEmail || "" })}</p>
                  {isPaid ? (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-muted uppercase">{t("downloads")}</h4>
                      <p className="text-sm text-muted">Download links were sent to <strong>{email.trim() || result.customerEmail}</strong>.</p>
                      <Button variant="secondary" size="sm" onClick={() => toast({ title: t("downloadLinkSent", { email: email.trim() || result.customerEmail || "" }), variant: "success" })}>
                        {t("download")}
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted">Your download links will arrive by email once the shop confirms your payment.</p>
                  )}
                </Panel>
              </div>
            </Modal>
            
            <div className="bg-surface border border-line rounded-lg overflow-hidden animate-in fade-in-0">
              <div className="p-4 border-b border-line">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-text">{t("orderSummary")}</h3>
                  <StatusBadge status={result.paymentStatus === "PAID" ? "paid" : result.status} />
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted">{t("orderCode")}</span>
                  <span className="font-bold text-text">{result.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">{t("total")}</span>
                  <PriceTag amount={result.total} currency={result.currency || "USDT"} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">{t("paymentMethod")}</span>
                  <span className="font-medium text-text">{result.paymentMethod}</span>
                </div>
                {result.paymentMethod === "USDT" && (
                  <div className="flex justify-between">
                    <span className="text-muted">{t("network")}</span>
                    <span className="font-medium text-text">{result.paymentNetwork}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" onClick={() => setResult(null)}>
                {t("lookupAgain")}
              </Button>
              <Button variant="primary" onClick={() => navigate("/")}>
                {t("returnToStore")}
              </Button>
            </div>
          </section>
        )}

        {!result && !error && (
          <div className="mt-6 text-center animate-in fade-in-0">
            <Link to="/" className="text-xs font-bold text-accent hover:text-accent-hover underline underline-offset-2">
              {t("returnToStore")}
            </Link>
          </div>
        )}
      </Page>
      <Footer supportEmail="aetherlystore@gmail.com" />
    </ToastProvider>
  );
}


