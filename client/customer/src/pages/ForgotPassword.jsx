import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../useLanguage.js";
import { useToast } from "../ui/index.js";
import {
  Button,
  Input,
  Card,
  Panel,
  Page,
} from "../ui/index.js";
import { ToastProvider } from "../ui/index.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const emailRef = useRef(null);
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    if (!email.trim()) {
      setServerError("Enter your email address.");
      emailRef.current?.focus();
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setServerError("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      toast({ title: t("resetLinkSent", { email: email.trim() }), variant: "success" });
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

return (
    <ToastProvider>
      <Page brand="Aether" variant="auth" supportEmail="aetherlystore@gmail.com">
        <Card padded className="w-full animate-in slide-in-from-bottom">
          <Panel title={t("forgotPassword")} description="We'll send reset instructions to your email address." padded>
            <form onSubmit={handleSubmit} noValidate className="layout-form">
              {serverError && <p className="text-sm text-danger animate-in fade-in-0" role="alert">{serverError}</p>}
              <div className="form-field">
                <label className="label-base">{t("deliveryEmail")}</label>
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  required
                  className="input-base"
                />
              </div>
              <Button variant="primary" className="w-full h-10" loading={loading} type="submit">
                {t("sendResetLink")}
              </Button>
              <p className="text-xs text-center text-muted">
                Remembered your password?{" "}
                <a href="/login" className="text-accent hover:text-accent-hover underline underline-offset-2">{t("signIn")}</a>
              </p>
            </form>
          </Panel>
        </Card>
      </Page>
    </ToastProvider>
  );
}




