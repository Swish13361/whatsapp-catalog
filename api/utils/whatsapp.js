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
  if (order.paymentMethod === "MPESA") {
  lines.push(
    order.paymentStatus === "PAID"
      ? `Payment: PAID via M-Pesa${order.mpesaReceipt ? ` (${order.mpesaReceipt})` : ""}`
      : "Payment: M-Pesa (awaiting confirmation)"
  );
} else {
  lines.push("Payment: pay on delivery");
}

  return `https://wa.me/${merchant.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
} 
 const STATUS_TEXT = {
  NEW: "has been received",
  PREPARING: "is being prepared",
  OUT_FOR_DELIVERY: "is on its way to you",
  COMPLETED: "is complete. Thank you for shopping with us!",
  CANCELLED: "has been cancelled. Please contact us if you have questions",
};

export function buildCustomerUrl({ merchant, order }) {
  const text = `Hello ${order.customerName}, your order ${order.orderCode} from ${merchant.businessName} ${STATUS_TEXT[order.status]}.`;
  return `https://wa.me/${order.customerPhone}?text=${encodeURIComponent(text)}`;
}