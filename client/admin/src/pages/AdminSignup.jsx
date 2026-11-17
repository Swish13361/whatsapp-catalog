import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../useLanguage.js";
import { adminRegister } from "../api.js";
import {
  Button,
  Input,
  Card,
  Panel,
  Icon,
  ToastProvider,
} from "../ui/index.js";

export default function AdminSignup() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = "Create shop account · Aether";
  }, []);

  const validate = () => {
    const errors = {};
    if (!businessName.trim()) errors.businessName = "Enter your shop name.";
    else if (businessName.trim().length > 80) errors.businessName = "Keep your shop name under 80 characters.";
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (password.length < 8) errors.password = "Use at least 8 characters.";
    return errors;
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setServerError("");
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      const data = await adminRegister(businessName.trim(), email.trim(), password);
      if (!data.token || !data.merchant?.slug) throw new Error("AUTH_REQUEST_FAILED");
      localStorage.setItem("adminToken", data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "businessName") setBusinessName(value);
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
                <Icon name="plus" size={28} className="text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-text">Create your shop account</h1>
              <p className="text-sm text-muted mt-1">Set up your Aether shop and start selling digital products.</p>
            </div>
            <Panel description="Enter your shop details to get started." padded>
              <form onSubmit={handleRegister} noValidate className="layout-form">
                {serverError && <p className="text-sm text-danger animate-in fade-in-0" role="alert">{serverError}</p>}
                <div className="form-field">
                  <label className="label-base">Shop name</label>
                  <Input
                    className="input-base"
                    value={businessName}
                    onChange={(event) => handleInputChange("businessName", event.target.value)}
                    placeholder="Your shop name"
                    maxLength={80}
                    required
                    error={Boolean(fieldErrors.businessName)}
                  />
                  {fieldErrors.businessName && <p className="text-xs text-danger animate-in fade-in-0">{fieldErrors.businessName}</p>}
                </div>
                <div className="form-field">
                  <label className="label-base">Email address</label>
                  <Input
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
                </div>
                <Button variant="primary" className="w-full h-10" loading={loading} type="submit">
                  Create account
                </Button>
                <p className="text-xs text-center text-muted">
                  Already have an account?{" "}
                  <button type="button" onClick={() => navigate("/login")} className="text-accent hover:text-accent-hover underline underline-offset-2">Sign in</button>
                </p>
              </form>
            </Panel>
          </Card>
        </main>
      </div>
    </ToastProvider>
  );
}


