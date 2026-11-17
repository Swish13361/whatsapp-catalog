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
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((item) => (
        <Toast key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
      ))}
    </div>
  );
}

const VARIANT_STYLE = {
  neutral: "border-line bg-surface text-ink",
  accent: "border-accent bg-accent-soft text-accent-ink",
  success: "border-success bg-success-soft text-success",
  warning: "border-warning bg-warning-soft text-warning",
  danger: "border-danger bg-danger-soft text-danger",
};

function Toast({ item, onDismiss }) {
  const { title, description, variant } = item;
  return (
    <div
      className={`pointer-events-auto flex w-full items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${VARIANT_STYLE[variant]}`}
      role="status"
      aria-live="polite"
    >
      {title && (
        <span className="text-sm font-semibold text-ink">{title}</span>
      )}
      {description && title && <span className="text-xs text-muted">{description}</span>}
      {description && !title && <span className="text-sm text-ink">{description}</span>}
      <button
        className="flex shrink-0 items-center justify-center w-5 h-5 rounded-lg text-muted hover:bg-accent-soft hover:text-accent-ink transition-colors"
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
<Icon name="x" size={12} />
      </button>
    </div>
  );
}


