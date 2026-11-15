import config from "../config/index.js";
import Order from "../models/order.js";
import { getCredentials } from "../mpesa/credentials.js";
import { stkPush } from "../mpesa/client.js";

export async function startStkPush(merchant, order) {
  const data = await stkPush(getCredentials(merchant), {
    phone: order.customerPhone,
    amount: order.total,
    reference: order.orderCode,
    description: "Order payment",
    callbackUrl: `${config.publicBaseUrl}/api/payments/stk/${config.stkCallbackSecret}`,
  });

  if (!data?.CheckoutRequestID) throw new Error("No CheckoutRequestID returned");

  await Order.updateOne(
    { _id: order._id },
    { $addToSet: { checkoutIds: data.CheckoutRequestID }, $unset: { paymentNote: "" } }
  );
  return data.CheckoutRequestID;
}