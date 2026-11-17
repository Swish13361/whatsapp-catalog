import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../api.js";
import { EMAIL_PATTERN, getAuthErrorMessage } from "./authUtils.js";
import { useLanguage } from "../useLanguage.js";
import {
  Button,
  Input,
  Card,
  Panel,
  Icon,
  ToastProvider,
} from "../ui/index.js";

function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = "Owner sign in · Aether";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!email.trim()) errors.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    else if (password.length < 8) errors.password = "Use at least 8 characters.";

    setFieldErrors(errors);
    setServerError("");
    if (Object.keys(errors).length) {
      document.getElementById(Object.keys(errors)[0])?.focus();
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(email, password);
      if (!data.token) throw new Error("AUTH_REQUEST_FAILED");
      localStorage.setItem("adminToken", data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(getAuthErrorMessage(err));
      if (err?.status === 409) emailRef.current?.focus();
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
      <div className="page-wrapper min-h-screen flex flex-col bg-bg">
        <main className="page-content container-main page-section page-auth flex-1 flex items-center justify-center" id="main-content" tabIndex={-1}>
          <Card padded className="w-full animate-in slide-in-from-bottom">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-4">
                <Icon name="lock" size={28} className="text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-text">Owner sign in</h1>
              <p className="text-sm text-muted mt-1">Manage your digital products, orders, and payment confirmations.</p>
            </div>
            <Panel description="Sign in to your owner account." padded>
              <form onSubmit={handleLogin} noValidate className="layout-form">
                {serverError && <p className="text-sm text-danger animate-in fade-in-0" role="alert">{serverError}</p>}
                <div className="form-field">
                  <label className="label-base">Email address</label>
                  <Input
                    ref={emailRef}
                    id="email"
                    className="input-base"
                    type="email"
                    value={email}
                    onChange={(event) => handleInputChange("email", event.target.value)}
                    placeholder="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    error={Boolean(fieldErrors.email)}
                  />
                  {fieldErrors.email && <p className="text-xs text-danger animate-in fade-in-0">{fieldErrors.email}</p>}
                </div>
                <div className="form-field">
                  <label className="label-base">Password</label>
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
                <Button variant="primary" className="w-full h-10" loading={loading} type="submit">
                  Log in
                </Button>
                <p className="text-xs text-center text-muted">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => navigate("/signup")} className="text-accent hover:text-accent-hover underline underline-offset-2">Sign up</button>
                </p>
              </form>
            </Panel>
          </Card>
        </main>
      </div>
    </ToastProvider>
  );
}

export default Login;


