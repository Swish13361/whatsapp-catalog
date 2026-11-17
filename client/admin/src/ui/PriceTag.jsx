export function PriceTag({ amount, currency = "USDT", className }) {
  const value = Number(amount || 0);
  return (
    <span className={`text-sm font-bold text-ink ${className || ""}`}>
      {value.toFixed(2)} {currency}
    </span>
  );
}


