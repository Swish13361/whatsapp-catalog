import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import { useLanguage } from "../useLanguage.js";
import { useTheme } from "../hooks/useTheme.js";
import { Icon } from "../ui/Icon.jsx";
import { Button, Input, Card, Panel, ThemeToggle } from "../ui/index.js";
import { ToastProvider } from "../ui/index.js";

export default function AdminAuth() {
  const navigate = useNavigate();
  const authStatus = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);
  const login = useAuthStore((state) => state.login);
  const { t } = useLanguage();
  const { mode, toggleTheme } = useTheme();
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authStatus === "unknown") {
      void initialize();
    } else if (authStatus === "authenticated") {
      navigate("/admin", { replace: true });
    }
  }, [authStatus, initialize, navigate]);

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login({ email: values.email, password: values.password });
      navigate("/admin", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToastProvider>
      <div className="admin-app flex h-full min-h-screen flex-column bg-bg text-text">
        <aside className="admin-sidebar shrink-0 border-r border-line bg-surface">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <span className="flex items-center gap-2.5 text-accent-on font-bold" aria-label="Catalog dashboard">
              <span className="flex shrink-0 items-center justify-center w-7 h-7 rounded-lg bg-accent text-accent-on font-bold text-sm">A</span>
              <span>Aether</span>
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-[440px]">
              <div className="text-center mb-8">
                <span className="flex shrink-0 items-center justify-center w-16 h-16 rounded-xl bg-accent-soft text-accent-ink font-bold text-2xl mx-auto mb-4">A</span>
                <h1 className="text-xl font-bold text-text">{t("signInToYourShop")}</h1>
                <p className="text-sm text-muted mt-1">Manage your digital products, orders, and payment confirmations.</p>
              </div>
              <Card padded>
                {authStatus === "error" && (
                  <p className="text-sm text-danger mb-4" role="status">We couldn't verify your previous sign-in. Please sign in again.</p>
                )}
                {error && <p className="text-sm text-danger mb-4" role="alert">{error}</p>}
                <form className="admin-auth-form flex flex-column gap-4" onSubmit={submit} noValidate>
                  <div className="flex flex-column gap-1">
                    <label className="text-xs font-bold text-muted">Email address</label>
                    <Input
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={update}
                      autoComplete="email"
                      placeholder="you@yourshop.co.ke"
                      required
                    />
                  </div>
                  <div className="flex flex-column gap-1">
                    <label className="text-xs font-bold text-muted">Password</label>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={values.password}
                        onChange={update}
                        autoComplete="current-password"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted hover:text-accent transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full" loading={busy} type="submit" disabled={busy}>
                    {busy ? "One moment..." : "Sign in"}
                  </Button>
                </form>
                <p className="text-xs text-muted mt-4 text-center">Private owner access for the Aether digital store.</p>
              </Card>
            </div>
          </div>
          <div className="px-4 py-4 border-t border-line">
            <ThemeToggle mode={mode} setMode={toggleTheme} t={t} className="w-full" />
          </div>
        </aside>
      </div>
    </ToastProvider>
  );
}

