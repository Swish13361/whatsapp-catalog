import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
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
  const location = useLocation();
  const auth = useAuthStore();
  const { mode, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isCustomer = auth.isCustomer && auth.status === "authenticated";
  const isInitializing = auth.status === "unknown" || auth.status === "checking";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    auth.logout();
    navigate("/", { replace: true });
    setIsMenuOpen(false);
  };

  return (
    <div>
      <header
        className={`sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm ${className || ""}`}
      >
        <div className="header-inner">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-8">
              <button
                type="button"
                className="md:hidden flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg text-text hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={isDrawerOpen}
                aria-controls="mobile-navigation-drawer"
              >
                <Icon name="menu" size={20} />
              </button>
              <Link
                to="/"
                className="flex items-center gap-2"
                aria-label={brand}
              >
                <span className="flex shrink-0 items-center justify-center w-7 h-7 rounded-lg bg-accent text-on-accent font-bold text-sm">
                  A
                </span>
                <span className="font-bold text-text">{brand}</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted" aria-label="Main navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-text hover:text-accent transition-[color] duration-150 py-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:block">
                <label htmlFor="topbar-search" className="sr-only">Search products</label>
                <input
                  id="topbar-search"
                  type="search"
                  placeholder="Search products…"
                  className="w-[200px] h-9 rounded-lg border border-line bg-surface text-text placeholder:text-muted px-3 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  aria-label="Search products"
                />
              </div>
              <ThemeToggle mode={mode} setMode={toggleTheme} t={t} />
              <LanguageSwitcher />
              {isInitializing ? (
                <div className="flex items-center gap-2">
                  <div className="w-[80px] h-9 rounded-lg border border-line bg-surface animate-pulse" />
                  <div className="w-[40px] h-[40px] rounded-lg border border-line bg-surface animate-pulse" />
                </div>
              ) : isCustomer ? (
                <div
                  className="relative"
                  ref={menuRef}
                >
                  <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-1.5 text-sm font-medium text-text hover:text-accent transition-[color,background-color] duration-150 px-2.5 py-1.5 rounded-lg hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent min-h-[40px]"
                    aria-expanded={isMenuOpen}
                    aria-label="Account menu"
                    aria-haspopup="true"
                  >
                    <Icon name="user" size={16} />
                    <span className="hidden sm:inline">Account</span>
                    <Icon name={isMenuOpen ? "chevronUp" : "chevronDown"} size={12} />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-lg border border-line bg-surface shadow-sm py-2" role="menu">
                      <Link
                        to="/account"
                        className="block px-4 py-2.5 text-sm text-text hover:bg-accent-soft transition-[background-color] duration-150"
                        role="menuitem"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon name="user" size={14} className="inline-block mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2.5 text-sm text-text hover:bg-accent-soft transition-[background-color] duration-150"
                        role="menuitem"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon name="package" size={14} className="inline-block mr-2" />
                        My orders
                      </Link>
                      {auth.merchant && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2.5 text-sm text-text hover:bg-accent-soft transition-[background-color] duration-150"
                          role="menuitem"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Icon name="settings" size={14} className="inline-block mr-2" />
                          Admin
                        </Link>
                      )}
                      <hr className="my-1.5 border-line" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger-soft transition-[background-color] duration-150"
                        role="menuitem"
                      >
                        <Icon name="logOut" size={14} className="inline-block mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-xs sm:text-sm font-semibold text-text hover:text-accent transition-[color,background-color] duration-150 px-3 py-1.5 rounded-lg hover:bg-accent-soft min-h-[40px] flex items-center justify-center cursor-pointer"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg border border-line bg-surface text-text hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-[color,background-color] duration-150 cursor-pointer"
                    title="Create account"
                    aria-label="Create account"
                  >
                    <Icon name="plus" size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {isDrawerOpen && <MobileDrawer brand={brand} onClose={() => setIsDrawerOpen(false)} />}
    </div>
  );
}

export function MobileDrawer({ onClose, brand = "Aether" }) {
  const navigate = useNavigate();
  const auth = useAuthStore();
  const { mode, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isCustomer = auth.isCustomer && auth.status === "authenticated";
  const isInitializing = auth.status === "unknown" || auth.status === "checking";
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsOpen(true);
      document.body.style.overflow = "hidden";
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        handleClose();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      document.body.style.overflow = "";
      onClose();
    }, 200);
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/", { replace: true });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start" role="dialog" aria-modal="true" aria-label="Navigation drawer" id="mobile-navigation-drawer">
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden="true"
        onClick={handleClose}
      />
      <aside
        className={`fixed top-0 left-0 z-10 w-[280px] max-w-[85vw] h-[100dvh] bg-surface border-r border-line shadow-sm flex flex-col transform transition-transform duration-200 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <Link to="/" className="flex items-center gap-2" aria-label={brand} onClick={handleClose}>
            <span className="flex shrink-0 items-center justify-center w-7 h-7 rounded-lg bg-accent text-on-accent font-bold text-sm">A</span>
            <span className="font-bold text-text">{brand}</span>
          </Link>
          <button
            type="button"
            className="flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg text-muted hover:text-text hover:bg-accent-soft transition-[color,background-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={handleClose}
            aria-label="Close menu"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={handleClose}
              className="flex items-center px-4 py-3 min-h-[40px] rounded-lg text-sm font-semibold text-text hover:bg-accent-soft hover:text-accent transition-[color,background-color] duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent uppercase">Theme</span>
            <ThemeToggle mode={mode} setMode={toggleTheme} t={t} />
          </div>
          <LanguageSwitcher />
          {isInitializing ? (
            <div className="space-y-2 pt-2 border-t border-line">
              <div className="w-full h-[40px] rounded-lg border border-line bg-surface animate-pulse" />
              <div className="w-full h-[40px] rounded-lg border border-line bg-surface animate-pulse" />
            </div>
          ) : isCustomer ? (
            <div className="space-y-1 pt-2 border-t border-line">
              <Link to="/orders" onClick={handleClose} className="flex items-center px-4 py-2.5 min-h-[40px] rounded-lg text-sm font-semibold text-text hover:bg-accent-soft">
                My orders
              </Link>
              <Link to="/account" onClick={handleClose} className="flex items-center px-4 py-2.5 min-h-[40px] rounded-lg text-sm font-semibold text-text hover:bg-accent-soft">
                Account
              </Link>
              {auth.merchant && (
                <Link to="/admin" onClick={handleClose} className="flex items-center px-4 py-2.5 min-h-[40px] rounded-lg text-sm font-semibold text-text hover:bg-accent-soft">
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2.5 min-h-[40px] rounded-lg text-sm font-semibold text-danger hover:bg-danger-soft transition-[background-color] duration-150"
              >
                <Icon name="logOut" size={14} className="inline-block mr-2" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => { navigate("/login"); handleClose(); }}
                className="w-full text-center px-4 py-2.5 min-h-[40px] rounded-lg text-sm font-semibold text-text border border-line hover:bg-accent-soft transition-[color,background-color] duration-150 cursor-pointer"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { navigate("/register"); handleClose(); }}
                className="w-full text-center px-4 py-2.5 min-h-[40px] rounded-lg text-sm font-semibold bg-accent text-on-accent hover:bg-accent-hover transition-[background-color] duration-150 cursor-pointer"
              >
                Create account
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}