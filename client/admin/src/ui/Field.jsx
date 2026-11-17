import { forwardRef } from "react";
import { Icon } from "./Icon.jsx";

const FIELD_BASE =
  "block w-full min-w-0 rounded-lg border border-line bg-surface text-ink placeholder:text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

export const Input = forwardRef(
  ({ size = "default", disabled, error, className, ...props }, ref) => {
    const height = size === "sm" ? "h-8 px-2 text-xs" : "h-10 px-3 text-sm";
    return (
      <input
        ref={ref}
        className={`${FIELD_BASE} ${height} ${error ? "border-danger focus-visible:outline-danger" : ""} ${className || ""}`}
        disabled={disabled}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export const Select = forwardRef(
  ({ size = "default", disabled, error, className, ...props }, ref) => {
    const height = size === "sm" ? "h-8 px-2 text-xs" : "h-10 px-3 text-sm";
    return (
      <select
        ref={ref}
        className={`${FIELD_BASE} ${height} appearance-none cursor-pointer ${error ? "border-danger focus-visible:outline-danger" : ""} ${className || ""}`}
        disabled={disabled}
        {...props}
      >
        {props.children}
      </select>
    );
  },
);
Select.displayName = "Select";

export const Textarea = forwardRef(
  ({ size = "default", disabled, error, className, rows = 3, ...props }, ref) => {
    const height = size === "sm" ? "h-[88px] px-2 text-xs" : "h-[104px] px-3 text-sm";
    return (
      <textarea
        ref={ref}
        className={`${FIELD_BASE} ${height} resize-y ${error ? "border-danger focus-visible:outline-danger" : ""} ${className || ""}`}
        disabled={disabled}
        rows={rows}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export const Checkbox = forwardRef(
  ({ checked, disabled, error, className, label, ...props }, ref) => {
    return (
      <div className={`flex items-center gap-3 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${className || ""}`}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className="w-5 h-5 rounded border-line bg-surface text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed"
          {...props}
        />
        {label && <span className="text-sm text-ink">{label}</span>}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";

const BADGE = {
  neutral: "border border-line bg-surface text-muted",
  accent: "bg-accent-soft text-accent-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function Badge({ variant = "neutral", className, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold whitespace-nowrap ${BADGE[variant]} ${className || ""}`}
    >
      {children}
    </span>
  );
}

export function Card({ className, children, padded, shadow }) {
  return (
    <section
      className={`border border-line bg-surface rounded-lg ${shadow ? "shadow-sm" : ""} ${
        padded ? "p-6" : ""
      } ${className || ""}`}
    >
      {children}
    </section>
  );
}

export function Panel({ title, description, className, children, padded }) {
  return (
    <section className={`border border-line bg-surface rounded-lg shadow-sm ${className || ""}`}>
      {title || description ? (
        <header className={`border-b border-line pb-4 ${padded ? "px-6 pt-6" : "p-6"}`}>
          {title && <h2 className="text-lg font-bold text-ink">{title}</h2>}
          {description && <p className="text-sm text-muted">{description}</p>}
        </header>
      ) : null}
      <div className={`${padded ? "p-6" : "px-6 pb-6"}`}>{children}</div>
    </section>
  );
}

export function Modal({ open, onClose, title, className, children, description }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div
        className={`relative w-full max-w-lg m-4 bg-surface rounded-lg border border-line shadow-sm flex flex-column ${className || ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {title || description ? (
          <header className="border-b border-line px-6 py-4 flex flex-column gap-1">
            {title && <h2 id="modal-title" className="text-lg font-bold text-ink">{title}</h2>}
            {description && <p className="text-sm text-muted">{description}</p>}
          </header>
        ) : null}
        <div className="px-6 pb-6 flex-grow overflow-y-auto">{children}</div>
        <button
          type="button"
          className="absolute top-4 right-4 flex shrink-0 items-center justify-center w-8 h-8 rounded-lg text-muted hover:bg-accent-soft hover:text-accent-ink transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="x" size={14} />
        </button>
      </div>
    </div>
  );
}


