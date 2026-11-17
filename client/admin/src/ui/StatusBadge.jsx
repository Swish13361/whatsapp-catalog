const VARIANTS = {
  neutral: "border-line bg-surface text-muted",
  accent: "bg-accent-soft text-accent-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function StatusBadge({ status, className }) {
  const key = String(status ?? "").toLowerCase();
  const normalized = key.replaceAll(" ", "_");
  const variant = VARIANTS[normalized] ?? VARIANTS[key] ?? VARIANTS.neutral;
  const label =
    status === undefined || status === null || status === ""
      ? "—"
      : String(status)
          .replaceAll("_", " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${variant} ${className || ""}`}>
      {label}
    </span>
  );
}


