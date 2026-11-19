import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customerLogin } from "../api.js";
import { useAuthStore } from "../stores/authStore.js";
import { useLanguage } from "../useLanguage.js";
import {
  Button,
  Input,
  Card,
  Panel,
  Icon,
  Checkbox,
  Toast,
  EmptyStateWithAction,
  Page,
} from "../ui/index.js";
import { ToastProvider } from "../ui/index.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const auth = useAuthStore();
  const search = new URLSearchParams(window.location.search);
  const returnTo = search.get("returnTo") || "/";

  useEffect(() => {
    document.title = `Sign in · Aether`;
  }, []);
  const emailRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (auth.status === "authenticated") {
      navigate(returnTo === "/login" ? "/" : returnTo, { replace: true });
    }
  }, [auth, navigate, returnTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!email.trim()) errors.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    if (!acceptedTerms) errors.terms = "You must accept the Terms and Conditions.";
    setFieldErrors(errors);
    setServerError("");
    if (Object.keys(errors).length) {
      const first = Object.keys(errors)[0];
      if (first === "email") emailRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      const data = await customerLogin({ email: email.trim(), password });
      if (!data.token) throw new Error("LOGIN_FAILED");
      localStorage.setItem("customerToken", data.token);
      localStorage.setItem(
        "aether-profile",
        JSON.stringify({ name: data.user?.name || "", email: data.user?.email || email.trim() }),
      );
      auth.initialize();
      navigate(returnTo === "/login" ? "/" : returnTo, { replace: true });
    } catch (err) {
      setServerError(err.message || "Sign in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    setServerError("");
  };

  return (
    <ToastProvider>
      <Page brand="Aether" variant="auth" supportEmail="support@aether.example">
        <Card padded className="w-full animate-in slide-in-from-bottom">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-4">
              <Icon name="lock" size={28} className="text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-text">{t("signIn")}</h1>
            <p className="text-sm text-muted mt-1">Welcome back to your account</p>
          </div>
          <Panel description="Sign in to your customer account." padded>
            <form onSubmit={handleSubmit} noValidate className="layout-form">
              {serverError && <p className="text-sm text-danger animate-in fade-in-0" role="alert">{serverError}</p>}
              <div className="form-field">
                <label className="label-base">{t("deliveryEmail")}</label>
                <Input
                  ref={emailRef}
                  id="email"
                  className="input-base"
                  type="email"
                  value={email}
                  onChange={(event) => handleInputChange("email", event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  required
                  error={Boolean(fieldErrors.email)}
                />
                {fieldErrors.email && <p className="text-xs text-danger animate-in fade-in-0">{fieldErrors.email}</p>}
              </div>
              <div className="form-field">
                <label className="label-base">{t("password")}</label>
                <div className="relative">
                  <Input
                    id="password"
                    className="input-base pr-10"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => handleInputChange("password", event.target.value)}
                    autoComplete="current-password"
                    required
                    error={Boolean(fieldErrors.password)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted hover:text-accent transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
{fieldErrors.password && <p className="text-xs text-danger animate-in fade-in-0">{fieldErrors.password}</p>}
              </div>
              <div className="form-field">
                <Checkbox
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  label={
                    <>
                      I agree to the <a href="/terms" className="text-accent hover:text-accent-hover underline underline-offset-2">Terms and Conditions</a> and <a href="/privacy" className="text-accent hover:text-accent-hover underline underline-offset-2">Privacy Policy</a>
                    </>
                  }
                  error={Boolean(fieldErrors.terms)}
                />
                {fieldErrors.terms && <p className="text-xs text-danger animate-in fade-in-0">{fieldErrors.terms}</p>}
              </div>
              <Button variant="primary" className="w-full h-10" loading={loading} type="submit" disabled={!acceptedTerms}>
                {t("signIn")}
              </Button>
              <p className="text-xs text-center text-muted">
                <a href="/forgot-password" className="text-accent hover:text-accent-hover underline underline-offset-2">{t("forgotPassword")}</a>
              </p>
<p className="text-xs text-center text-muted">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-accent hover:text-accent-hover underline underline-offset-2 p-0 font-inherit bg-transparent cursor-pointer"
                >
                  {t("signUp")}
                </button>
              </p>
            </form>
          </Panel>
        </Card>
      </Page>
    </ToastProvider>
  );
}
