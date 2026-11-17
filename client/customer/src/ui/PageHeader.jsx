export function PageHeader({ eyebrow, title, description, action, className }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 ${className || ""}`}>
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <p className="text-xs font-bold text-accent tracking-wider uppercase">{eyebrow}</p>
        )}
        {title && <h1 className="text-xl font-bold text-text">{title}</h1>}
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
}
