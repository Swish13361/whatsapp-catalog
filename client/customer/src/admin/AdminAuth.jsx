import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import "./admin.css";

export default function AdminAuth({ mode = "login" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const authStatus = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const [values, setValues] = useState({
    businessName: "",
    slug: "",
    whatsappNumber: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authStatus === "unknown") {
      void initialize();
    } else if (authStatus === "authenticated") {
      navigate("/admin", { replace: true });
    }
  }, [authStatus, initialize, navigate]);

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: name === "slug" ? value.toLowerCase() : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (isRegister) {
        await register(values);
      } else {
        await login({ email: values.email, password: values.password });
      }
      navigate("/admin", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-aside">
        <a className="admin-auth-brand" href="/"><span className="admin-brand-mark">W</span> market<span>.</span></a>
        <div className="admin-auth-message">
          <span className="admin-auth-kicker"><span /> SELLER STUDIO</span>
          <h1>Your shop,<br /><em>your way.</em></h1>
          <p>One calm place to look after your products, orders, and the people who shop with you.</p>
        </div>
        <div className="admin-auth-aside-note"><span>✳</span> SMALL SHOPS, BIG POSSIBILITIES</div>
        <div className="admin-auth-orbit" aria-hidden="true"><span>✳</span></div>
      </section>

      <section className="admin-auth-content">
        <Link className="admin-auth-mobile-brand" to="/admin/login"><span className="admin-brand-mark">W</span> market.</Link>
        <div className="admin-auth-form-wrap">
          <p className="admin-auth-overline">{isRegister ? "START SELLING" : "WELCOME BACK"}</p>
          <h2>{isRegister ? "Create your shop" : "Sign in to your shop"}</h2>
          <p className="admin-auth-subtitle">
            {isRegister ? "Set up your storefront and start sharing your products." : "Your orders and products are right where you left them."}
          </p>

          {authStatus === "error" && (
            <p className="admin-form-error" role="status">We couldn’t verify your previous sign-in. Please sign in again.</p>
          )}

          <form className="admin-auth-form" onSubmit={submit}>
            {isRegister && (
              <>
                <label className="admin-field">
                  <span>Business name</span>
                  <input name="businessName" value={values.businessName} onChange={update} maxLength={80} autoComplete="organization" placeholder="e.g. Willow & Co." required />
                </label>
                <label className="admin-field">
                  <span>Store link <small>3–30 letters, numbers, or dashes</small></span>
                  <div className="admin-slug-input"><span>/store/</span><input name="slug" value={values.slug} onChange={update} minLength={3} maxLength={30} pattern="[a-z0-9\x2d]+" placeholder="your-shop" required /></div>
                </label>
                <label className="admin-field">
                  <span>WhatsApp number</span>
                  <input name="whatsappNumber" type="tel" value={values.whatsappNumber} onChange={update} autoComplete="tel" placeholder="0712 345 678" required />
                  <small className="admin-field-hint">Use a Kenyan number, starting with 07, 01, or 254.</small>
                </label>
              </>
            )}
            <label className="admin-field">
              <span>Email address</span>
              <input name="email" type="email" value={values.email} onChange={update} autoComplete="email" placeholder="you@yourshop.co.ke" required />
            </label>
            <label className="admin-field">
              <span>Password {isRegister && <small>At least 8 characters</small>}</span>
              <input name="password" type="password" value={values.password} onChange={update} autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : undefined} required />
            </label>

            {error && <p className="admin-form-error" role="alert">{error}</p>}
            <button className="admin-button admin-button-primary admin-auth-submit" type="submit" disabled={busy}>
              {busy ? "One moment..." : isRegister ? "Create my shop" : "Sign in"} <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="admin-auth-switch">
            {isRegister ? "Already have a shop?" : "New to market?"}{" "}
            <Link to={isRegister ? "/admin/login" : "/admin/register"}>{isRegister ? "Sign in" : "Create your shop"}</Link>
          </p>
        </div>
        <p className="admin-auth-legal">By continuing, you agree to keep your shop information accurate.</p>
      </section>
    </main>
  );
}
