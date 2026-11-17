const VARIANTS = {
  paid: "border-success/30 bg-success-soft text-success",
  completed: "border-success/30 bg-success-soft text-success",
  active: "border-success/30 bg-success-soft text-success",
  delivered: "border-success/30 bg-success-soft text-success",
  shipped: "border-success/30 bg-success-soft text-success",
  verified: "border-success/30 bg-success-soft text-success",
  enabled: "border-success/30 bg-success-soft text-success",
  success: "border-success/30 bg-success-soft text-success",
  pending: "border-warning/30 bg-warning-soft text-warning",
  confirming: "border-warning/30 bg-warning-soft text-warning",
  unpaid: "border-warning/30 bg-warning-soft text-warning",
  waiting_payment: "border-warning/30 bg-warning-soft text-warning",
  low_stock: "border-warning/30 bg-warning-soft text-warning",
  draft: "border-warning/30 bg-warning-soft text-warning",
  warning: "border-warning/30 bg-warning-soft text-warning",
  expired: "border-danger/30 bg-danger-soft text-danger",
  failed: "border-danger/30 bg-danger-soft text-danger",
  cancelled: "border-danger/30 bg-danger-soft text-danger",
  canceled: "border-danger/30 bg-danger-soft text-danger",
  out_of_stock: "border-danger/30 bg-danger-soft text-danger",
  archived: "border-danger/30 bg-danger-soft text-danger",
  danger: "border-danger/30 bg-danger-soft text-danger",
  new: "border-accent/30 bg-accent-soft text-accent-ink",
  accent: "border-accent/30 bg-accent-soft text-accent-ink",
  neutral: "border-line bg-surface text-muted",
};

const DOT_VARIANTS = {
  "border-success/30 bg-success-soft text-success": "bg-success",
  "border-warning/30 bg-warning-soft text-warning": "bg-warning",
  "border-danger/30 bg-danger-soft text-danger": "bg-danger",
  "border-accent/30 bg-accent-soft text-accent-ink": "bg-accent",
  "border-line bg-surface text-muted": "bg-muted",
};

export function StatusBadge({ status, className }) {
  const key = String(status ?? "").toLowerCase().trim();
  const normalized = key.replaceAll(" ", "_");
  const variant = VARIANTS[normalized] ?? VARIANTS[key] ?? VARIANTS.neutral;
  const dotColor = DOT_VARIANTS[variant] ?? "bg-muted";

  let label = "—";
  if (status !== undefined && status !== null && status !== "") {
    const raw = String(status).replaceAll("_", " ").trim();
    label = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${variant} ${className || ""}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}


