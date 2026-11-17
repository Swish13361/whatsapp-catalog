import { forwardRef } from "react";

import { Icon } from "./Icon.jsx";

const SIZE = {
  default: "h-10 px-4 text-sm min-h-[40px]",
  sm: "h-8 px-3 text-xs min-h-[40px] sm:min-h-0",
};

const VARIANT = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-hover focus-visible:outline-accent",
  secondary:
    "border border-line bg-surface text-text hover:bg-accent-soft active:bg-line/40 focus-visible:outline-accent",
  ghost: "bg-transparent text-text hover:bg-accent-soft active:bg-line/40 focus-visible:outline-accent",
  danger: "border border-danger/40 bg-surface text-danger hover:bg-danger-soft active:bg-danger-soft/60 focus-visible:outline-danger",
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
      "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-[color,background-color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer";
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`${base} ${SIZE[size] || SIZE.default} ${VARIANT[variant] || VARIANT.primary} ${className || ""}`}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Icon name="refreshCw" size={size === "sm" ? 12 : 14} className="animate-spin" />}
        <span>{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";


