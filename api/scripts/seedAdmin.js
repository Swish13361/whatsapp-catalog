// scripts/seedAdmin.js — run once: node scripts/seedAdmin.js
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/user.js"; 
import dotenv from "dotenv";
dotenv.config()
;

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  if (await User.exists({ role: "admin" })) {
    console.log("Admin already exists");
    process.exit(0);
  }
  await User.create({
    email: process.env.ADMIN_EMAIL,
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
    role: "admin",
    emailVerified: true,
  });
  console.log("Admin created");
  process.exit(0);
})();