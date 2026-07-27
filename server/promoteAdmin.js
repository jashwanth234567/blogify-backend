// One-time script to promote a user to Super Admin
import "./configs/env.js";
import mongoose from "mongoose";
import connectDB from "./configs/db.js";
import User from "./models/User.js";

await connectDB();

const email = "domakondajashwanth12k@gmail.com";

try {
  const user = await User.findOne({ email });
  
  if (!user) {
    console.log("❌ User not found with email:", email);
    process.exit(1);
  }

  console.log("Found user:", user.name, "(@" + user.username + ")");
  console.log("Current isAdmin:", user.isAdmin);
  console.log("Current adminRole:", user.adminRole);

  // Promote to Super Admin
  user.isAdmin = true;
  user.adminRole = "Super Admin";
  user.status = "active";
  user.verified = true;
  
  await user.save();
  
  console.log("✅ User promoted to Super Admin successfully!");
  console.log("   isAdmin:", user.isAdmin);
  console.log("   adminRole:", user.adminRole);
  console.log("   verified:", user.verified);
} catch (err) {
  console.error("❌ Error:", err.message);
} finally {
  await mongoose.disconnect();
  process.exit(0);
}
