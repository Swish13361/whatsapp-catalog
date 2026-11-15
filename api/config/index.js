import "dotenv/config";          // loads .env into process.env

const config = {
  port: process.env.PORT || 5001,    // use 5001 if PORT isn't set
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET, 

   mpesaBaseUrl:
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke",
mpesaConsumerKey: process.env.MPESA_CONSUMER_KEY,
mpesaConsumerSecret: process.env.MPESA_CONSUMER_SECRET,
mpesaShortcode: process.env.MPESA_SHORTCODE,
mpesaPasskey: process.env.MPESA_PASSKEY,
publicBaseUrl: process.env.PUBLIC_BASE_URL,
stkCallbackSecret: process.env.STK_CALLBACK_SECRET,
// Skipping verification is only ever allowed in the sandbox
skipVerify: process.env.MPESA_SKIP_VERIFY === "true" && process.env.MPESA_ENV !== "production",
mpesaReady: Boolean(
  process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_SHORTCODE &&
    process.env.MPESA_PASSKEY &&
    process.env.PUBLIC_BASE_URL &&
    process.env.STK_CALLBACK_SECRET
),
};

export default config;