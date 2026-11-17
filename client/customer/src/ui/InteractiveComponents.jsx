import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";
import { Button } from "./Button.jsx";

export function Modal({ open, onClose, title, description, children, className, size = "md", closeOnOverlay = true }) {
  if (!open) return null;

  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90vw]",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && closeOnOverlay) onClose();
      }}
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full ${sizes[size]} bg-surface rounded-xl border border-line shadow-md flex flex-col overflow-hidden ${className || ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        {(title || description) && (
          <header className="border-b border-line px-6 py-4 flex flex-col gap-1 pr-14">
            {title && <h2 id="modal-title" className="text-lg font-bold text-text">{title}</h2>}
            {description && <p id="modal-description" className="text-sm text-muted">{description}</p>}
          </header>
        )}
        <div className="px-6 pb-6 pt-4 flex-grow overflow-y-auto">{children}</div>
        <button
          type="button"
          className="absolute top-3 right-3 flex shrink-0 items-center justify-center min-w-[40px] min-h-[40px] rounded-lg text-muted hover:bg-accent-soft hover:text-accent-ink transition-[color,background-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="x" size={18} />
        </button>
      </div>
    </div>
  );
}

export function ImageZoom({ src, alt, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleWheel = (event) => {
    if (!isOpen) return;
    event.preventDefault();
    setScale((prev) => {
      const next = prev - event.deltaY * 0.001;
      return Math.min(Math.max(next, 1), 4);
    });
  };

  const handleMouseDown = (event) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: event.clientX - position.x, y: event.clientY - position.y };
    event.preventDefault();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseMove = (event) => {
      if (!isDragging) return;
      setPosition({
        x: event.clientX - dragStartRef.current.x,
        y: event.clientY - dragStartRef.current.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        loading="lazy"
        className={`cursor-zoom-in transition-[color,background-color] duration-150 ${className || ""}`}
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => {
            setIsOpen(false);
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          onWheel={handleWheel}
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} - zoomed view`}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center center",
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={src} alt={alt} className="max-h-[90vh] max-w-[90vw] object-contain" />
          </div>
          <button
            type="button"
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            aria-label="Close zoomed image"
          >
            <Icon name="x" size={20} />
          </button>
          {scale > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs">
              Drag to pan · Scroll to zoom · Esc to close
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function LoadingOverlay({ isLoading, message, className }) {
  if (!isLoading) return null;
  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center bg-surface/80 backdrop-blur-sm ${className || ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="bg-surface border border-line rounded-lg p-8 flex flex-col items-center gap-4 shadow-sm max-w-sm w-full mx-4">
        <div className="relative w-10 h-10">
          <svg className="w-full h-full text-accent animate-spin" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="31.4 31.4"
              strokeLinecap="round"
              className="animate-spin"
              style={{ strokeDashoffset: "31.4" }}
            />
          </svg>
        </div>
        <p className="text-sm text-text text-center">{message || "Loading…"}</p>
      </div>
    </div>
  );
}

export function SkeletonCard({ className, lines = 3, aspectRatio = "aspect-[4/3]" }) {
  return (
    <div className={`border border-line bg-surface rounded-lg overflow-hidden ${className || ""}`}>
      <div className={`${aspectRatio} bg-line/60 animate-pulse`} />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-line/60 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-line/60 rounded animate-pulse w-1/2" />
        {Array.from({ length: lines - 2 }).map((_, i) => (
          <div key={i} className="h-4 bg-line/60 rounded animate-pulse w-full" />
        ))}
      </div>
    </div>
  );
}

export function PasswordStrength({ password }) {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(Math.min(score, 4));
  }, [password]);

  const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
  const colors = [
    "bg-danger",
    "bg-danger/80",
    "bg-warning",
    "bg-accent",
    "bg-success",
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4} aria-label="Password strength">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded transition-colors duration-150 ${
              i < strength ? colors[strength - 1] : "bg-line"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted">{labels[strength] || ""}</p>
    </div>
  );
}

export function Stepper({ steps, currentStep, className }) {
  return (
    <nav className={`flex items-center gap-2 ${className || ""}`} aria-label="Progress steps">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <div key={step.label} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`flex shrink-0 w-8 h-8 rounded-full border-2 items-center justify-center text-xs font-bold transition-[color,background-color,border-color] duration-150 ${
                  isCompleted
                    ? "bg-success border-success text-on-accent"
                    : isActive
                    ? "bg-accent border-accent text-on-accent"
                    : "bg-surface border-line text-muted"
                }`}
              >
                {isCompleted ? <Icon name="check" size={12} /> : index + 1}
              </div>
              <div className="hidden md:block">
                <p className={`text-xs font-bold transition-[color] duration-150 ${isActive || isCompleted ? "text-text" : "text-muted"}`}>
                  {step.label}
                </p>
                {step.description && (
                  <p className={`text-[10px] transition-[color] duration-150 ${isActive || isCompleted ? "text-muted" : "text-muted/50"}`}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`hidden lg:block h-0.5 flex-1 transition-[background-color] duration-150 ${
                  isCompleted ? "bg-success" : "bg-line"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Toast({ message, variant = "info", onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 150);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const variants = {
    success: "bg-success-soft border-success/30 text-success",
    error: "bg-danger-soft border-danger/30 text-danger",
    warning: "bg-warning-soft border-warning/30 text-warning",
    info: "bg-accent-soft border-accent/30 text-accent-ink",
  };

  const icons = {
    success: "checkCircle",
    error: "alertCircle",
    warning: "alertTriangle",
    info: "info",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${variants[variant] || variants.info}`}
      role="alert"
      aria-live="polite"
    >
      <Icon name={icons[variant] || "info"} size={16} className="shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose?.(), 150);
        }}
        className="ml-2 shrink-0 flex items-center justify-center min-w-[32px] min-h-[32px] text-current/70 hover:text-current transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
        aria-label="Dismiss"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

export function Tooltip({ children, content, position = "top", className }) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowPositions = {
    top: "top-full left-1/2 -translate-x-1/2",
    bottom: "bottom-full left-1/2 -translate-x-1/2",
    left: "left-full top-1/2 -translate-y-1/2",
    right: "right-full top-1/2 -translate-y-1/2",
  };

  return (
    <div
      ref={triggerRef}
      className="inline-block relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute ${positions[position]} z-10 px-2.5 py-1 text-xs font-medium text-text bg-surface border border-line rounded shadow-sm whitespace-nowrap ${className || ""}`}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowPositions[position]}`}
            style={{
              borderTopColor: position === "bottom" ? "rgb(var(--line))" : "transparent",
              borderBottomColor: position === "top" ? "rgb(var(--line))" : "transparent",
              borderLeftColor: position === "right" ? "rgb(var(--line))" : "transparent",
              borderRightColor: position === "left" ? "rgb(var(--line))" : "transparent",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "danger", loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">{description}</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function EmptyStateWithAction({ title, description, action, className, icon }) {
  const icons = {
    search: "search",
    bag: "shoppingBag",
    order: "package",
    user: "user",
    lock: "lock",
    mail: "mail",
    star: "star",
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className || ""}`}>
      <div className="w-16 h-16 rounded-full bg-line flex items-center justify-center mb-4">
        <Icon name={icons[icon] || "package"} size={28} className="text-muted" />
      </div>
      <h3 className="text-lg font-bold text-text mb-1">{title}</h3>
      <p className="text-sm text-muted mb-6 max-w-sm">{description}</p>
      {action && (
        <div className="flex gap-2">{action}</div>
      )}
    </div>
  );
}
