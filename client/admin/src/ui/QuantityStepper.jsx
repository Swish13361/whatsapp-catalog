import { useState, useCallback } from "react";

export function QuantityStepper({ value, onChange, min = 0, max = 10, size = "default", disabled }) {
  const [qty, setQty] = useState(value);
  const set = useCallback(
    (next) => {
      const n = Number.isFinite(next) ? next : qty;
      if (n < min || n > max) return;
      setQty(n);
      onChange(n);
    },
    [qty, min, max, onChange],
  );
  const decrement = () => set(qty - 1);
  const increment = () => set(qty + 1);
  const height = size === "sm" ? "h-8" : "h-10";
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface">
      <button
        type="button"
        disabled={disabled || qty <= min}
        onClick={decrement}
        className={`flex shrink-0 items-center justify-center w-8 ${height} text-ink hover:bg-accent-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
        aria-label="Decrease quantity"
      >
        <Icon name="minus" size={12} />
      </button>
      <output className="w-8 text-sm font-bold text-ink text-center">{qty}</output>
      <button
        type="button"
        disabled={disabled || qty >= max}
        onClick={increment}
        className={`flex shrink-0 items-center justify-center w-8 ${height} text-ink hover:bg-accent-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
        aria-label="Increase quantity"
      >
        <Icon name="plus" size={12} />
      </button>
    </div>
  );
}


