import { useCallback } from "react";
import { Icon } from "./Icon.jsx";

export function QuantityStepper({ value, onChange, min = 0, max = 10, size = "default", disabled }) {
  const currentQty = typeof value === "number" ? value : 1;

  const set = useCallback(
    (next) => {
      if (!Number.isFinite(next)) return;
      if (next < min || next > max) return;
      onChange?.(next);
    },
    [min, max, onChange],
  );

  const decrement = () => set(currentQty - 1);
  const increment = () => set(currentQty + 1);
  const height = size === "sm" ? "h-8 min-h-[40px] sm:min-h-0" : "h-10 min-h-[40px]";
  const btnWidth = size === "sm" ? "w-8 min-w-[40px] sm:min-w-[32px]" : "w-10 min-w-[40px]";

  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-surface overflow-hidden">
      <button
        type="button"
        disabled={disabled || currentQty <= min}
        onClick={decrement}
        className={`flex shrink-0 items-center justify-center ${btnWidth} ${height} text-text hover:bg-accent-soft active:bg-line/40 disabled:opacity-40 disabled:cursor-not-allowed transition-[color,background-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
        aria-label="Decrease quantity"
      >
        <Icon name="minus" size={14} />
      </button>
      <output className="w-10 text-sm font-bold text-text text-center select-none">{currentQty}</output>
      <button
        type="button"
        disabled={disabled || currentQty >= max}
        onClick={increment}
        className={`flex shrink-0 items-center justify-center ${btnWidth} ${height} text-text hover:bg-accent-soft active:bg-line/40 disabled:opacity-40 disabled:cursor-not-allowed transition-[color,background-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
        aria-label="Increase quantity"
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}
