import jwt from "jsonwebtoken";
import config from "../config/index.js";
import Merchant from "../models/merchant.js";

export default async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Login required" });

  try {
    const { id } = jwt.verify(token, config.jwtSecret);
    req.merchant = { id }; // minimal payload
    next();
  } catch {
    res.status(401).json({ error: "Login required" });
  }
}

export async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Login required" });

  try {
    const { id } = jwt.verify(token, config.jwtSecret);
    const merchant = await Merchant.findById(id);
    if (!merchant || merchant.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.merchant = merchant;
    next();
  } catch {
    res.status(401).json({ error: "Login required" });
  }
}