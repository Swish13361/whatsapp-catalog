import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import Merchant from "../models/merchant.js";
import { formatPhone } from "../utils/phone.js";

const signToken = (m) => jwt.sign({ id: m._id }, config.jwtSecret, { expiresIn: "7d" });

const publicMerchant = (m) => ({
  id: m._id,
  businessName: m.businessName,
  slug: m.slug,
  whatsappNumber: m.whatsappNumber,
  email: m.email,
});

const allStrings = (...vals) => vals.every((v) => typeof v === "string" && v.trim());

export async function register(req, res) {
  try {
    const { businessName, slug, whatsappNumber, email, password } = req.body;
    if (!allStrings(businessName, slug, whatsappNumber, email, password)) {
      return res.status(400).json({ error: "All fields are required" });
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

export async function login(req, res) {
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