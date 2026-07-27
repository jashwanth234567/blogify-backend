import "./configs/env.js";
import mongoose from "mongoose";
import connectDB from "./configs/db.js";
import User from "./models/User.js";

await connectDB();

try {
  const users = await User.find({ email: /domakonda/i });
  console.log("Matching users count:", users.length);
  for (const u of users) {
    console.log({
      id: u._id,
      name: u.name,
      username: u.username,
      email: u.email,
      isAdmin: u.isAdmin,
      adminRole: u.adminRole,
      status: u.status,
      verified: u.verified
    });
  }
} catch (err) {
  console.error(err);
} finally {
  await mongoose.disconnect();
}
