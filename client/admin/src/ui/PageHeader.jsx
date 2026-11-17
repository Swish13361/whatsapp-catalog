export function PageHeader({ eyebrow, title, description, action, className }) {
  return (
    <div className={`flex flex-column gap-2 sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 ${className || ""}`}>
      <div className="flex flex-column gap-2">
        {eyebrow && (
          <p className="text-xs font-bold text-accent tracking-wider uppercase">{eyebrow}</p>
        )}
        {title && <h1 className="text-xl font-bold text-ink">{title}</h1>}
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}


