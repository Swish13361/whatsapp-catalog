import axios from "axios";

const tokens = new Map(); // cached per Daraja app

async function getToken(c) {
  const hit = tokens.get(c.consumerKey);
  if (hit && Date.now() < hit.expiresAt) return hit.token;

  const auth = Buffer.from(`${c.consumerKey}:${c.consumerSecret}`).toString("base64");
  const { data } = await axios.get(
    `${c.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` }, timeout: 15000 }
  );

  tokens.set(c.consumerKey, {
    token: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in) - 60) * 1000,
  });
  return data.access_token;
}

const stamp = () => new Date().toISOString().replace(/\D/g, "").slice(0, 14); // YYYYMMDDHHmmss

const password = (c, ts) =>
  Buffer.from(`${c.shortcode}${c.passkey}${ts}`).toString("base64");

export async function stkPush(c, { phone, amount, reference, description, callbackUrl }) {
  const token = await getToken(c);
  const ts = stamp();

  const { data } = await axios.post(
    `${c.baseUrl}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: c.shortcode,
      Password: password(c, ts),
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: phone,
      PartyB: c.shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: reference.slice(0, 12),
      TransactionDesc: description.slice(0, 13),
    },
    { headers: { Authorization: `Bearer ${token}` }, timeout: 20000 }
  );
  return data;
}

export async function stkQuery(c, checkoutRequestId) {
  const token = await getToken(c);
  const ts = stamp();

  const { data } = await axios.post(
    `${c.baseUrl}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: c.shortcode,
      Password: password(c, ts),
      Timestamp: ts,
      CheckoutRequestID: checkoutRequestId,
    },
    { headers: { Authorization: `Bearer ${token}` }, timeout: 20000 }
  );
  return data;
}