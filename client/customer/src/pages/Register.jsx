import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api.js";
import { useAuthStore } from "../stores/authStore.js";
import { useLanguage } from "../useLanguage.js";
import {
  Button,
  Input,
  Card,
  Panel,
  Icon,
  PasswordStrength,
  Checkbox,
  Toast,
  Page,
} from "../ui/index.js";
import { ToastProvider } from "../ui/index.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const auth = useAuthStore();

  useEffect(() => {
    document.title = `Create account · Aether`;
  }, []);
  const businessNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

const validate = () => {
    const errors = {};
    const name = values.name.trim();
    const email = values.email.trim();
    if (!name) errors.name = "Enter your name.";
    else if (name.length > 50) errors.name = "Name must be under 50 characters.";
    if (!email) errors.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
    if (!values.password) errors.password = "Enter a password.";
    else if (values.password.length < 8) errors.password = "Use at least 8 characters.";
    if (!acceptedTerms) errors.terms = "You must accept the Terms and Conditions.";
    return errors;
  };

  const handleInputChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    setServerError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setServerError("");
    if (Object.keys(errors).length) {
      const refs = { name: businessNameRef, email: emailRef, password: passwordRef };
      refs[Object.keys(errors)[0]].current?.focus();
      return;
    }
    setLoading(true);
    try {
      const data = await register({ name: values.name.trim(), email: values.email.trim(), password: values.password });
      if (!data.token) throw new Error("REGISTRATION_FAILED");
      localStorage.setItem("customerToken", data.token);
      localStorage.setItem(
        "aether-profile",
        JSON.stringify({ name: values.name.trim(), email: values.email.trim() }),
      );
      auth.initialize();
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToastProvider>
      <Page brand="Aether" variant="auth" supportEmail="aetherlystore@gmail.com">
        <Card padded className="w-full animate-in slide-in-from-bottom">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-4">
              <Icon name="user" size={28} className="text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-text">{t("createAccount")}</h1>
            <p className="text-sm text-muted mt-1">Start shopping with Aether</p>
          </div>
          <Panel description="Create your customer account." padded>
            <form onSubmit={handleSubmit} noValidate className="layout-form">
              {serverError && <p className="text-sm text-danger animate-in fade-in-0" role="alert">{serverError}</p>}
              <div className="form-field">
                <label className="label-base">{t("name")}</label>
                <Input
                  ref={businessNameRef}
                  id="name"
                  className="input-base"
                  value={values.name}
                  onChange={(event) => handleInputChange("name", event.target.value)}
                  placeholder={t("fullName")}
                  maxLength={50}
                  required
                  error={Boolean(fieldErrors.name)}
                  autoFocus
                />
                {fieldErrors.name && <p className="text-xs text-danger animate-in fade-in-0">{fieldErrors.name}</p>}
              </div>
              <div className="form-field">
                <label className="label-base">{t("deliveryEmail")}</label>
                <Input
                  ref={emailRef}
                  id="email"
                  className="input-base"
                  type="email"
                  value={values.email}
                  onChange={(event) => handleInputChange("email", event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
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
                    value={values.password}
                    onChange={(event) => handleInputChange("password", event.target.value)}
                    autoComplete="new-password"
                    minLength={8}
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
                <PasswordStrength password={values.password} />
              </div>
<div className="form-field">
                <Checkbox
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  label={
                    <>
                      I agree to the <button type="button" onClick={() => navigate("/terms")} className="text-accent hover:text-accent-hover underline underline-offset-2 p-0 font-inherit bg-transparent cursor-pointer">Terms and Conditions</button> and <button type="button" onClick={() => navigate("/privacy")} className="text-accent hover:text-accent-hover underline underline-offset-2 p-0 font-inherit bg-transparent cursor-pointer">Privacy Policy</button>
                    </>
                  }
                  error={Boolean(fieldErrors.terms)}
                />
                {fieldErrors.terms && <p className="text-xs text-danger animate-in fade-in-0">{fieldErrors.terms}</p>}
              </div>
              <Button variant="primary" className="w-full h-10" loading={loading} type="submit" disabled={!acceptedTerms}>
                {t("createAccount")}
              </Button>
              <p className="text-xs text-center text-muted">{t("noCardNeeded")}</p>
              <p className="text-xs text-center text-muted">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-accent hover:text-accent-hover underline underline-offset-2 p-0 font-inherit bg-transparent cursor-pointer"
                >
                  {t("signIn")}
                </button>
              </p>
            </form>
          </Panel>
        </Card>
      </Page>
    </ToastProvider>
  );
}


