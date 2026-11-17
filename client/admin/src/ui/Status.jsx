import { Icon } from "./Icon.jsx";
import { Button } from "./Button.jsx";

export function Skeleton({ className, width, height, circle, text, heading }) {
  const h = circle ? "h-16 w-16 rounded-full" : heading ? "h-6" : text ? "h-4" : "";
  const w = width ? `w-[${width}]` : circle ? "" : "w-full";
  return (
    <span
      className={`animate-pulse rounded-lg ${h} ${w} ${className || ""}`}
      aria-hidden="true"
    />
  );
}

export function EmptyState({ icon = "alertTriangle", title, description, action, className }) {
  return (
    <div className={`flex flex-column items-center justify-center gap-3 text-center p-8 ${className || ""}`}>
      <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-lg bg-line text-muted">
        <Icon name={icon} size={20} />
      </div>
      {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
      {description && <p className="text-sm text-muted">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description, onRetry, retryLabel = "Try again", className }) {
  return (
    <div className={`flex flex-column items-center justify-center gap-3 text-center p-8 ${className || ""}`}>
      <Icon name="alertCircle" size={24} className="text-danger" />
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {description && <p className="text-sm text-muted">{description}</p>}
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>{retryLabel}</Button>}
    </div>
  );
}


