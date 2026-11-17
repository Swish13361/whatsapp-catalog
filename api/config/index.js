import "dotenv/config";          // loads .env into process.env

const usdtWallets = {
  TRC20: process.env.USDT_TRC20_ADDRESS?.trim() || "",
  BEP20: process.env.USDT_BEP20_ADDRESS?.trim() || "",
  BINANCE: process.env.USDT_BINANCE_ADDRESS?.trim() || "",
};

export function isUsdtWalletConfigured(network) {
  const address = usdtWallets[network];
  if (!address) return false;
  if (network === "TRC20") return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
  if (network === "BEP20") return /^0x[a-fA-F0-9]{40}$/.test(address);
  if (network === "BINANCE") return /^0x[a-fA-F0-9]{40}$/.test(address);
  return false;
}

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
usdtWallets,
alipay: {
  accountId: process.env.ALIPAY_ACCOUNT_ID || "",
  accountName: process.env.ALIPAY_ACCOUNT_NAME || "",
},
bankTransfer: {
  accountName: process.env.BANK_ACCOUNT_NAME || "",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
  bankName: process.env.BANK_NAME || "",
  routing: process.env.BANK_ROUTING || "",
},
appwrite: {
  endpoint: process.env.APPWRITE_ENDPOINT || "",
  projectId: process.env.APPWRITE_PROJECT_ID || "",
  apiKey: process.env.APPWRITE_API_KEY || "",
  bucketId: process.env.APPWRITE_BUCKET_ID || "",
},
};

export default config;