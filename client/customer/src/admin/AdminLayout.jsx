import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import { useLanguage } from "../useLanguage.js";
import { useTheme } from "../hooks/useTheme.js";
import { Icon } from "../ui/Icon.jsx";
import { Panel, Button, ThemeToggle } from "../ui/index.js";

const initials = (name = "") => name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "A";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/orders", label: "Orders", icon: "list" },
  { href: "/admin/products", label: "Products", icon: "package" },
  { href: "/admin/inventory", label: "Inventory", icon: "cpu" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { mode, toggleTheme } = useTheme();
  const merchant = useAuthStore((state) => state.merchant);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);
  const initialize = useAuthStore((state) => state.initialize);
  const logoutSession = useAuthStore((state) => state.logout);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    return (
      <main className="flex h-full items-center justify-center bg-bg text-text">
        <div className="flex flex-column items-center gap-3">
          <span className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg border border-line bg-surface text-text">
            <Icon name="cpu" size={16} />
          </span>
          <p className="text-sm text-muted">Preparing your workspace…</p>
        </div>
      </main>
    );
  }
  if (status === "error") {
    return (
      <main className="flex h-full items-center justify-center bg-bg text-text p-6">
        <Panel title="We couldn’t connect to your workspace." description={error || "Try again."} padded>
          <Button variant="primary" onClick={() => void initialize()}>Try again</Button>
        </Panel>
      </main>
    );
  }
  if (status !== "authenticated" || !merchant) return null;

  return (
    <div className="admin-app flex h-full min-h-screen flex-column bg-bg text-text">
      <aside className={`admin-sidebar shrink-0 border-r border-line bg-surface ${drawerOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"} transition-transform duration-200`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <NavLink to="/admin" className="flex items-center gap-2.5 text-accent-on font-bold" aria-label="Catalog dashboard">
            <span className="flex shrink-0 items-center justify-center w-7 h-7 rounded-lg bg-accent text-accent-on font-bold text-sm">A</span>
            <span>Aether</span>
          </NavLink>
          <button type="button" className="lg:hidden text-muted" onClick={() => setDrawerOpen(false)}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-accent-soft text-accent-ink font-bold text-xs">{initials(merchant.businessName)}</span>
            <div className="min-w-0 flex-1">
              <strong className="block text-sm text-text truncate">{merchant.businessName}</strong>
              <span className="text-xs text-muted">Store manager</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full border border-line bg-surface text-xs font-bold text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-success" aria-label="Active" />
            Active
          </span>
        </div>

        <nav className="px-3 pb-4" aria-label="Admin navigation">
          <p className="px-4 text-xs font-bold text-accent uppercase mb-3">Workspace</p>
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors ${isActive ? "bg-accent text-accent-on" : "text-muted hover:bg-accent-soft hover:text-accent-ink"}`
              }
            >
              <Icon name={link.icon} size={14} />
              <span>{t(link.label === "Dashboard" ? "dashboard" : link.label === "Orders" ? "adminOrders" : link.label === "Products" ? "adminProducts" : link.label === "Inventory" ? "adminInventory" : "adminSettings")}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-line">
          <Button variant="secondary" onClick={logout} className="w-full">Sign out</Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex-column relative">
        {drawerOpen && (
          <div className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden" aria-hidden="true" onClick={() => setDrawerOpen(false)} />
        )}
        <button type="button" className="lg:hidden absolute left-4 top-4 z-30 flex items-center justify-center w-9 h-9 rounded-lg border border-line bg-surface text-text hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
          <Icon name="menu" size={16} />
        </button>

        <header className="admin-topbar shrink-0 border-b border-line bg-surface px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-bold text-muted uppercase tracking-wider">
            <span>Your store</span>
            <span className="text-line">/</span>
            <strong className="text-text">Management</strong>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/${encodeURIComponent(merchant.slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-bold text-text hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              View storefront <Icon name="externalLink" size={12} />
            </a>
            <ThemeToggle mode={mode} setMode={toggleTheme} t={t} className="text-text" />
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-8">
          <Outlet context={merchant} />
        </main>

        <footer className="shrink-0 border-t border-line bg-surface px-5 py-3 text-xs text-muted">
          Aether &nbsp;·&nbsp; Your store, in good hands.
        </footer>
      </div>
    </div>
  );
}




