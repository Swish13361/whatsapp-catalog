export function Tabs({ value, onValueChange, children, className }) {
  const items = children.filter((child) => child?.type?.displayName === "Tab");
  return (
    <div className={`flex flex-column gap-1 ${className || ""}`}>
      <div className="flex gap-1 border-b border-line overflow-x-auto pb-2" role="tablist">
        {items.map((item) => {
          const active = item.props.value === value;
          return (
            <button
              key={item.props.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onValueChange(item.props.value)}
              className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-bold transition-colors ${
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:bg-accent-soft hover:text-accent-ink"
              }`}
            >
              {item.props.label}
            </button>
          );
        })}
      </div>
      <div className="pt-4" role="tabpanel">
        {items.find((item) => item.props.value === value)?.props.children}
      </div>
    </div>
  );
}

Tabs.Tab = function Tab({ label, children }) {
  return <span style={{ display: "none" }}>{children}</span>;
};
Tabs.Tab.displayName = "Tab";

export function Chips({ options, value, onValueChange, className }) {
  return (
    <div
      role="group"
      aria-label={className}
      className={`inline-flex flex-wrap gap-2 ${className || ""}`}
    >
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onValueChange(option)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors ${
              active
                ? "border-accent bg-accent text-accent-on"
                : "border-line bg-surface text-muted hover:bg-accent-soft hover:text-accent-ink"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}


