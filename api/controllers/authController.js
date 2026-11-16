import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import Merchant from "../models/merchant.js";
import { formatPhone } from "../utils/phone.js";
import { isValidSlug, RESERVED_SLUGS } from "../constants/reservedSlugs.js";

const signToken = (m) => jwt.sign({ id: m._id }, config.jwtSecret, { expiresIn: "7d" });

const publicMerchant = (m) => ({
  id: m._id,
  businessName: m.businessName,
  slug: m.slug,
  whatsappNumber: m.whatsappNumber,
  email: m.email,
});

const allStrings = (...vals) => vals.every((v) => typeof v === "string" && v.trim());

function ensureAuthConfigured(res) {
  if (typeof config.jwtSecret === "string" && config.jwtSecret.trim()) return true;
  res.status(503).json({ error: "Authentication is not configured on the server" });
  return false;
}

export async function register(req, res) {
  if (!ensureAuthConfigured(res)) return;

  try {
    const { businessName, slug, whatsappNumber, email, password } = req.body;
    if (!allStrings(businessName, slug, whatsappNumber, email, password)) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (!isValidSlug(slug)) {
      return res.status(400).json({ error: "Store link must be 3 to 30 lowercase letters, numbers, or dashes" });
    }
    if (RESERVED_SLUGS.has(slug)) {
      return res.status(400).json({ error: "That store link is reserved. Choose another" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const merchant = await Merchant.create({
      businessName,
      slug,
      whatsappNumber: formatPhone(whatsappNumber),
      email,
      passwordHash,
    });

    res.status(201).json({ token: signToken(merchant), merchant: publicMerchant(merchant) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email or store link already taken" });
    }
    if (err.name === "ValidationError" || err.message === "Invalid Kenyan phone number") {
      return res.status(400).json({
        error: "Please check your details (store link: 3-30 letters, numbers or dashes; valid Kenyan phone)",
      });
    }
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function checkSlugAvailability(req, res) {
  const { slug } = req.params;

  if (!isValidSlug(slug)) {
    return res.json({ available: false, reason: "invalid" });
  }
  if (RESERVED_SLUGS.has(slug)) {
    return res.json({ available: false, reason: "reserved" });
  }

  try {
    const taken = await Merchant.exists({ slug });
    return res.json(taken
      ? { available: false, reason: "taken" }
      : { available: true });
  } catch (err) {
    console.error("Slug availability error:", err.message);
    return res.status(500).json({ error: "Could not check store link right now" });
  }
}

export async function login(req, res) {
  if (!ensureAuthConfigured(res)) return;

  try {
    const { email, password } = req.body;
    if (!allStrings(email, password)) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const merchant = await Merchant.findOne({ email: email.toLowerCase().trim() });
    const ok = merchant && (await bcrypt.compare(password, merchant.passwordHash));
    if (!ok || !merchant.isActive) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ token: signToken(merchant), merchant: publicMerchant(merchant) });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export function me(req, res) {
  res.json(publicMerchant(req.merchant)); 
}