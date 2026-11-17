export function formatPhone(input) {
  let phone = String(input).replace(/\D/g, "");

  if (phone.startsWith("0")) phone = `254${phone.slice(1)}`;
  if (phone.startsWith("7") || phone.startsWith("1")) phone = `254${phone}`;

  if (!/^254(7|1)\d{8}$/.test(phone)) {
    throw new Error("Invalid Kenyan phone number");
  }

  return phone;
}

