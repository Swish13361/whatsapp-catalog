import { forwardRef } from "react";
import { Icon } from "./Icon.jsx";

const FIELD_BASE =
  "block w-full min-w-0 rounded-lg border border-line bg-surface text-text placeholder:text-muted transition-[color,background-color,border-color] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

export const Input = forwardRef(
  ({ size = "default", disabled, error, className, ...props }, ref) => {
    const height = size === "sm" ? "h-8 px-2.5 text-xs min-h-[40px] sm:min-h-0" : "h-10 px-3 text-sm min-h-[40px]";
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
    const height = size === "sm" ? "h-8 px-2.5 text-xs min-h-[40px] sm:min-h-0" : "h-10 px-3 text-sm min-h-[40px]";
    return (
      <select
        ref={ref}
        className={`${FIELD_BASE} ${height} appearance-none cursor-pointer pr-8 ${error ? "border-danger focus-visible:outline-danger" : ""} ${className || ""}`}
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
    const height = size === "sm" ? "h-[88px] px-2.5 text-xs" : "h-[104px] px-3 text-sm";
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
  ({ checked, disabled, className, label, ...props }, ref) => {
    return (
      <label className={`inline-flex items-center gap-3 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none min-h-[40px] sm:min-h-0 py-1 ${className || ""}`}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className="w-5 h-5 rounded border border-line bg-surface text-accent transition-[color,background-color,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed cursor-pointer"
          {...props}
        />
        {label && <span className="text-sm text-text">{label}</span>}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

const BADGE = {
  neutral: "border-line bg-surface text-muted",
  accent: "border-accent/30 bg-accent-soft text-accent-ink",
  success: "border-success/30 bg-success-soft text-success",
  warning: "border-warning/30 bg-warning-soft text-warning",
  danger: "border-danger/30 bg-danger-soft text-danger",
};

export function Badge({ variant = "neutral", className, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold whitespace-nowrap ${BADGE[variant] || BADGE.neutral} ${className || ""}`}
    >
      {children}
    </span>
  );
}

export function Card({ className, children, padded, shadow }) {
  return (
    <section
      className={`border border-line bg-surface rounded-lg ${shadow ? "shadow-sm" : ""} ${
        padded ? "p-4 sm:p-6" : ""
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
        <header className={`border-b border-line pb-4 ${padded ? "px-4 pt-4 sm:px-6 sm:pt-6" : "p-4 sm:p-6"}`}>
          {title && <h2 className="text-lg font-bold text-text">{title}</h2>}
          {description && <p className="text-sm text-muted">{description}</p>}
        </header>
      ) : null}
      <div className={`${padded ? "p-4 sm:p-6" : "px-4 pb-4 sm:px-6 sm:pb-6"}`}>{children}</div>
    </section>
  );
}

export function Modal({ open, onClose, title, className, children, description }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className={`relative w-full max-w-lg bg-surface rounded-lg border border-line shadow-md flex flex-col ${className || ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {title || description ? (
          <header className="border-b border-line px-6 py-4 flex flex-col gap-1 pr-12">
            {title && <h2 id="modal-title" className="text-lg font-bold text-text">{title}</h2>}
            {description && <p className="text-sm text-muted">{description}</p>}
          </header>
        ) : null}
        <div className="px-6 py-5 flex-grow overflow-y-auto">{children}</div>
        <button
          type="button"
          className="absolute top-3 right-3 flex shrink-0 items-center justify-center min-w-[40px] min-h-[40px] rounded-lg text-muted hover:bg-accent-soft hover:text-accent-ink transition-[color,background-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
}


