import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Icon } from "../ui/Icon.jsx";
import { useTheme } from "../hooks/useTheme.js";
import { useLanguage } from "../useLanguage.js";

const navLinks = [
  { href: "/admin", label: "dashboard", icon: "grid" },
  { href: "/admin/orders", label: "adminOrders", icon: "list" },
  { href: "/admin/products", label: "adminProducts", icon: "package" },
  { href: "/admin/inventory", label: "adminInventory", icon: "cpu" },
  { href: "/admin/settings", label: "adminSettings", icon: "settings" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const authenticated = localStorage.getItem("adminToken") !== null;

  useEffect(() => {
    if (!authenticated) {
      navigate("/login", { replace: true });
    }
  }, [navigate, authenticated]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-app flex h-full min-h-screen flex-column bg-bg text-ink">
      <aside className={`admin-sidebar shrink-0 border-r border-line bg-surface ${drawerOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"} transition-transform duration-200`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2.5 text-accent-on font-bold" onClick={() => navigate("/admin", { replace: true })} role="link" tabIndex={0} aria-label="Dashboard">
            <span className="flex shrink-0 items-center justify-center w-7 h-7 rounded-lg bg-accent text-accent-on font-bold text-sm">A</span>
            <span>Aether</span>
          </div>
          <button type="button" className="lg:hidden text-muted" onClick={() => setDrawerOpen(false)}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <nav className="px-3 pb-4" aria-label="Admin navigation">
          <p className="px-4 text-xs font-bold text-accent uppercase mb-3">Workspace</p>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => { event.preventDefault(); navigate(link.href); }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors text-muted hover:bg-accent-soft hover:text-accent-ink`}
            >
              <Icon name={link.icon} size={14} />
              <span>{t(link.label)}</span>
            </a>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-line">
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left text-ink hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <Icon name="externalLink" size={12} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex-column relative">
        {drawerOpen && (
          <div className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden" aria-hidden="true" onClick={() => setDrawerOpen(false)} />
        )}
        <button type="button" className="lg:hidden absolute left-4 top-4 z-30 flex items-center justify-center w-9 h-9 rounded-lg border border-line bg-surface text-ink hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
          <Icon name="menu" size={16} />
        </button>

        <header className="admin-topbar shrink-0 border-b border-line bg-surface px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-bold text-muted uppercase tracking-wider">
            <span>Your store</span>
            <span className="text-line">/</span>
            <strong className="text-ink">Management</strong>
          </div>
          <ThemeToggle mode={mode} setMode={toggleTheme} t={t} className="text-ink" />
        </header>

        <main className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>

        <footer className="shrink-0 border-t border-line bg-surface px-5 py-3 text-xs text-muted">
          Aether &nbsp;·&nbsp; Your store, in good hands.
        </footer>
      </div>
    </div>
  );
}


