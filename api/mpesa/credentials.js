import config from "../config/index.js";

// Later: return this merchant's own shortcode, passkey and Daraja keys here.
export function getCredentials(_merchant) {
  return {
    baseUrl: config.mpesaBaseUrl,
    consumerKey: config.mpesaConsumerKey,
    consumerSecret: config.mpesaConsumerSecret,
    shortcode: config.mpesaShortcode,
    passkey: config.mpesaPasskey,
  };
}