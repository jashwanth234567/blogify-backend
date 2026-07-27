// server/configs/db.js – Try Atlas, fallback to in‑memory DB
import mongoose from "mongoose";
import { autoSeedDatabase } from "../utils/autoSeed.js";

const connectDB = async () => {
  const defaultAtlasUri = "mongodb+srv://blogify:Blogify12345@cluster0.u9ngkvc.mongodb.net/blogdb?retryWrites=true&w=majority&appName=Cluster0";
  const primaryUri = process.env.MONGODB_URI || process.env.MONGODB_URL || defaultAtlasUri;

  // 1️⃣ Try Primary Atlas URI
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 8000 });
    console.log("✅ Database Connected (MongoDB Atlas)");
    await autoSeedDatabase();
    return;
  } catch (err) {
    console.warn(`⚠️ Atlas primary connection failed: ${err.message}`);
  }

  // 2️⃣ Try Default Atlas URI if primary was different
  if (primaryUri !== defaultAtlasUri) {
    try {
      console.log("Retrying with default Atlas URI...");
      await mongoose.connect(defaultAtlasUri, { serverSelectionTimeoutMS: 8000 });
      console.log("✅ Database Connected (Default MongoDB Atlas)");
      await autoSeedDatabase();
      return;
    } catch (err) {
      console.warn(`⚠️ Default Atlas connection failed: ${err.message}`);
    }
  }

  // 3️⃣ Fail‑safe in‑memory DB (always works as last resort)
  try {
    console.warn("⏳ Falling back to in‑memory MongoDB (MongoMemoryServer)...");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongoServer = await MongoMemoryServer.create();
    const memUri = mongoServer.getUri();
    await mongoose.connect(memUri);
    console.log("✅ Database Connected (Fail‑Safe In‑Memory DB)");
    await autoSeedDatabase();
  } catch (memErr) {
    console.error("❌ Unable to connect to any database:", memErr.message);
    process.exit(1);
  }
};

export default connectDB;
