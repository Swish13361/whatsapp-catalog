export function Tabs({ value, onValueChange, children, className }) {
  const items = children.filter((child) => child?.type?.displayName === "Tab");
  return (
    <div className={`flex flex-col gap-1 ${className || ""}`}>
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
              className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-bold min-h-[40px] transition-[color,background-color,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-t ${
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
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold min-h-[32px] sm:min-h-0 transition-[color,background-color,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer ${
              active
                ? "border-accent bg-accent text-on-accent"
                : "border-line bg-surface text-muted hover:bg-accent-soft hover:text-accent-ink active:bg-line/40"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
