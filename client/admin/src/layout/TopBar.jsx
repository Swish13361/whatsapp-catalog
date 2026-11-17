import { useNavigate } from "react-router-dom";
import { Icon } from "../ui/Icon.jsx";
import { ThemeToggle } from "../ui/ThemeToggle.jsx";
import { LanguageSwitcher } from "../ui/LanguageSwitcher.jsx";
import { useTheme } from "../hooks/useTheme.js";
import { useLanguage } from "../useLanguage.js";

const navLinks = [
  { href: "/", label: "Shop" },
  { href: "/orders/lookup", label: "Order lookup" },
];

export function TopBar({ brand = "Aether", className }) {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const authenticated = localStorage.getItem("adminToken") !== null;

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login", { replace: true });
  };

  return (
    <header className={`sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm ${className || ""}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex cursor-pointer items-center gap-2" onClick={() => navigate("/dashboard", { replace: true })}>
              <span className="flex shrink-0 items-center justify-center w-7 h-7 rounded-lg bg-accent text-accent-on font-bold text-sm">
                A
              </span>
              <span className="font-bold text-ink">{brand}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle mode={mode} setMode={toggleTheme} t={t} />
            <LanguageSwitcher />
            {authenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex shrink-0 items-center justify-center w-9 h-9 rounded-lg border border-line bg-surface text-ink hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                title="Sign out"
              >
                <Icon name="externalLink" size={12} />
              </button>
            ) : (
              <>
                <button type="button" onClick={() => navigate("/login")} className="text-sm font-medium text-ink hover:text-accent transition-colors">Sign in</button>
                <button type="button" onClick={() => navigate("/signup")} className="flex items-center justify-center gap-2 w-9 h-9 rounded-lg border border-line bg-surface text-ink hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" title="Create account">
                  <Icon name="plus" size={12} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function MobileDrawer() {
  return null;
}


