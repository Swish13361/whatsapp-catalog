const money = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export function buildWhatsAppUrl({ merchant, order }) {
  const lines = [
    `Hello ${merchant.businessName}, I'd like to place order ${order.orderCode}:`,
    "",
    ...order.items.map((i) => `${i.quantity} x ${i.name} - KES ${money(i.price * i.quantity)}`),
    "",
    `Total: KES ${money(order.total)}`,
    `Name: ${order.customerName}`,
  ];
  if (order.deliveryAddress) lines.push(`Delivery: ${order.deliveryAddress}`);
  if (order.notes) lines.push(`Notes: ${order.notes}`);
  lines.push("Payment: pay on delivery");

  return `https://wa.me/${merchant.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}