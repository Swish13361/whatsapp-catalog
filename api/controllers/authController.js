import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import User from "../models/user.js";
import Merchant from "../models/merchant.js";
import { isValidSlug, RESERVED_SLUGS } from "../constants/reservedSlugs.js";

const signToken = (id) => jwt.sign({ id }, config.jwtSecret, { expiresIn: "7d" });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});

const allStrings = (...vals) => vals.every((v) => typeof v === "string" && v.trim());

function ensureAuthConfigured(res) {
  if (typeof config.jwtSecret === "string" && config.jwtSecret.trim()) return true;
  res.status(503).json({ error: "Authentication is not configured on the server" });
  return false;
}

async function createStoreSlug(name) {
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  const base = isValidSlug(normalized) && !RESERVED_SLUGS.has(normalized)
    ? normalized
    : "shop";

  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const tail = suffix === 1 ? "" : `-${suffix}`;
    const slug = `${base.slice(0, 30 - tail.length)}${tail}`;
    if (!await Merchant.exists({ slug })) return slug;
  }

  throw new Error("Unable to generate a unique store link");
}

// Customer register
export async function customerRegister(req, res) {
  if (!ensureAuthConfigured(res)) return;

  try {
    const { name, email, password } = req.body;
    if (!allStrings(name, email, password)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/.test(email)) {
      return res.status(400).json({ error: "Please add a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ error: "Email already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: passwordHash,
      role: "user",
    });

    res.status(201).json({
      token: signToken(user._id),
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Customer register error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

// Customer login
export async function customerLogin(req, res) {
  if (!ensureAuthConfigured(res)) return;

  try {
    const { email, password } = req.body;
    if (!allStrings(email, password)) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      token: signToken(user._id),
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Customer login error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

// Admin register
export async function adminRegister(req, res) {
  if (!ensureAuthConfigured(res)) return;

  try {
    const { businessName, email, password } = req.body;
    if (!allStrings(businessName, email, password)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/.test(email)) {
      return res.status(400).json({ error: "Please add a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existingMerchant = await Merchant.findOne({ email: email.toLowerCase().trim() });
    if (existingMerchant) {
      return res.status(409).json({ error: "Email already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const slug = await createStoreSlug(businessName.trim());
    const merchant = await Merchant.create({
      businessName: businessName.trim(),
      slug,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "admin",
    });

    res.status(201).json({
      token: signToken(merchant._id),
      merchant: {
        id: merchant._id,
        businessName: merchant.businessName,
        slug: merchant.slug,
      },
    });
  } catch (err) {
    console.error("Admin register error:", err.message);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "Please check your details and try again" });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email is already in use" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

// Admin login
export async function adminLogin(req, res) {
  if (!ensureAuthConfigured(res)) return;

  try {
    const { email, password } = req.body;
    if (!allStrings(email, password)) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const merchant = await Merchant.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
    const ok = merchant && (await bcrypt.compare(password, merchant.passwordHash));
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      token: signToken(merchant._id),
      merchant: {
        id: merchant._id,
        businessName: merchant.businessName,
        slug: merchant.slug,
        role: merchant.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

// Get current user (customer or merchant)
export async function me(req, res) {
  try {
    const user = req.user || req.merchant;
    if (user.role === "customer") {
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.json({
        merchant: {
          id: user._id,
          businessName: user.businessName,
          slug: user.slug,
          role: user.role,
        },
      });
    }
  } catch (err) {
    console.error("Me error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export const adminMe = me;