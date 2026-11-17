import { forwardRef } from "react";

import { Icon } from "./Icon.jsx";

const SIZE = {
  default: "h-10 px-3 text-sm",
  sm: "h-8 px-2 text-xs",
};

const VARIANT = {
  primary: "bg-accent text-accent-on hover:bg-accent-hover focus-visible:ring-accent",
  secondary:
    "border border-line bg-surface text-ink hover:bg-accent-soft focus-visible:ring-accent",
  ghost: "bg-transparent text-ink hover:bg-accent-soft focus-visible:ring-accent",
  danger: "border border-line bg-surface text-danger hover:bg-danger-soft focus-visible:ring-danger",
};

export const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "default",
      disabled,
      loading,
      type = "button",
      onClick,
      className,
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2";
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`${base} ${SIZE[size]} ${VARIANT[variant]} ${className || ""}`}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Icon name="refreshCw" size={size === "sm" ? 12 : 14} className="animate-spin" />}
        <span>{loading ? "Working…" : children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";


