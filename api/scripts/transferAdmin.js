
import mongoose from "mongoose";
import User from "../models/user.js"; 
import dotenv from "dotenv";
dotenv.config()
;

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const target = await User.findOne({ email: process.argv[2], emailVerified: true });
  if (!target) throw new Error("New admin must be a registered, verified user");

  await User.updateMany({ role: "admin" }, { role: "user" }); // demote old admin first
  target.role = "admin";                                      // then promote the new one
  await target.save();
  console.log("Admin is now", target.email);
  process.exit(0);
})();