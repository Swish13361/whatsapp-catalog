export function formatPhone(input) {
  let p = String(input).replace(/\D/g, "");

  if (p.startsWith("254")) {
    return /^254(7|1)\d{8}$/.test(p) ? p : new Error("Invalid Kenyan phone number");
  }

  if (p.startsWith("0")) p = "254" + p.slice(1);
  if (p.startsWith("7") || p.startsWith("1")) p = "254" + p;

  if (!/^254(7|1)\d{8}$/.test(p)) throw new Error("Invalid Kenyan phone number");
  return p;
}