import { createContext, useCallback, useContext, useState } from "react";
import { Icon } from "./Icon.jsx";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(
    ({ title, description, variant = "neutral", duration = 4000 } = {}) => {
      const id = String(Date.now()) + String(Math.random()).slice(2, 7);
      setToasts((current) => [...current, { id, title, description, variant, duration }]);
      if (duration > 0) {
        setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), duration);
      }
      return id;
    },
    [],
  );

  const dismiss = useCallback((id) => setToasts((current) => current.filter((item) => item.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastHost />
    </ToastContext.Provider>
  );
}

function ToastHost() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((item) => (
        <Toast key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
      ))}
    </div>
  );
}

const VARIANT_STYLE = {
  neutral: "border-line bg-surface text-text",
  accent: "border-accent/30 bg-accent-soft text-accent-ink",
  success: "border-success/30 bg-success-soft text-success",
  warning: "border-warning/30 bg-warning-soft text-warning",
  danger: "border-danger/30 bg-danger-soft text-danger",
};

const VARIANT_ICONS = {
  neutral: "info",
  accent: "info",
  success: "checkCircle",
  warning: "alertTriangle",
  danger: "alertCircle",
};

function Toast({ item, onDismiss }) {
  const { title, description, variant } = item;
  const icon = VARIANT_ICONS[variant] || VARIANT_ICONS.neutral;
  return (
    <div
      className={`pointer-events-auto flex w-full items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${VARIANT_STYLE[variant] || VARIANT_STYLE.neutral}`}
      role="status"
      aria-live="polite"
    >
      <Icon name={icon} size={16} className="shrink-0" />
      <div className="flex-1 min-w-0">
        {title && <span className="block text-sm font-semibold truncate">{title}</span>}
        {description && <span className={`block text-xs ${title ? "text-muted" : "text-text"}`}>{description}</span>}
      </div>
      <button
        className="flex shrink-0 items-center justify-center min-w-[36px] min-h-[36px] rounded-lg text-muted hover:bg-accent-soft hover:text-accent-ink transition-[color,background-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
