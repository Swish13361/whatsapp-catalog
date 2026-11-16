import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import "./admin.css";

function initials(name = "") {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "S";
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const merchant = useAuthStore((state) => state.merchant);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);
  const initialize = useAuthStore((state) => state.initialize);
  const logoutSession = useAuthStore((state) => state.logout);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate, status]);

  const logout = () => {
    logoutSession();
    navigate("/admin/login", { replace: true });
  };

  if (status === "unknown" || status === "checking") {
    return <main className="admin-loading"><span className="admin-spinner" />Preparing your workspace...</main>;
  }
  if (status === "error") {
    return (
      <main className="admin-loading admin-load-error">
        <p>We couldn’t connect to your workspace.</p>
        <span>{error}</span>
        <button className="admin-button admin-button-primary" type="button" onClick={() => void initialize()}>Try again</button>
      </main>
    );
  }
  if (status !== "authenticated" || !merchant) return null;

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <NavLink className="admin-brand" to="/admin" aria-label="Catalog dashboard">
          <span className="admin-brand-mark">W</span>
          <span>market<span className="admin-brand-dot">.</span><small>SELLER STUDIO</small></span>
        </NavLink>

        <div className="admin-store-card">
          <span className="admin-store-avatar">{initials(merchant.businessName)}</span>
          <span className="admin-store-copy"><strong>{merchant.businessName}</strong><small>Store manager</small></span>
          <span className="admin-live-dot" aria-label="Active" />
        </div>

        <p className="admin-nav-label">WORKSPACE</p>
        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link${isActive ? " is-active" : ""}`}>
            <span className="admin-nav-icon">⌂</span> Overview
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link${isActive ? " is-active" : ""}`}>
            <span className="admin-nav-icon">▤</span> Orders
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link${isActive ? " is-active" : ""}`}>
            <span className="admin-nav-icon">◇</span> Products
          </NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <a className="admin-view-store" href={`/${encodeURIComponent(merchant.slug)}`} target="_blank" rel="noopener noreferrer">
            <span>↗</span> View your storefront
          </a>
          <button className="admin-logout" type="button" onClick={logout}>
            <span>⇥</span> Sign out
          </button>
          <div className="admin-profile">
            <span className="admin-profile-avatar">{initials(merchant.businessName)}</span>
            <span><strong>{merchant.email}</strong><small>{merchant.slug}</small></span>
          </div>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">YOUR STORE <span>/</span> <strong>MANAGEMENT</strong></div>
          <a className="admin-topbar-store" href={`/${encodeURIComponent(merchant.slug)}`} target="_blank" rel="noopener noreferrer">
            Storefront <span>↗</span>
          </a>
        </header>
        <main className="admin-main">
          <Outlet context={merchant} />
        </main>
        <footer className="admin-footer"><span>market<span className="admin-brand-dot">.</span></span> Your store, in good hands.</footer>
      </div>
    </div>
  );
}
