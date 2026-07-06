import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL; // Support both variable names for Render compatibility

  // Guard: ensure the env var is actually set
  if (!uri) {
    console.error(`🚫  MongoDB connection string environment variable is not set! Expected MONGODB_URI or MONGODB_URL.`);
    console.error("    → Add it in your Render dashboard under Environment Variables.");
    process.exit(1);
  }

  // ── Try MongoDB Atlas ──────────────────────────────────────────────────
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("✅ Database Connected (MongoDB Atlas)");
      mongoose.connection.on("disconnected", () =>
        console.warn("⚠️  MongoDB disconnected. Reconnecting...")
      );
      mongoose.connection.on("error", (err) =>
        console.error("❌ MongoDB error:", err.message)
      );
      return; // success – stop here
    } catch (error) {
      console.error(
        `❌ Atlas connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`
      );
      if (attempt < MAX_RETRIES) {
        console.log(`   Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  // ── All retries failed ────────────────────────────────────────────────
  console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("🚫  Could not connect to MongoDB Atlas.");
  console.error("   Checklist:");
  console.error("   1. Is MONGODB_URI set correctly in your Render env vars?");
  console.error("   2. Is 0.0.0.0/0 whitelisted in MongoDB Atlas Network Access?");
  console.error("   3. Is the Atlas database user password correct in the URI?");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  // Attempt fallback to a local MongoDB instance
  const localUri = process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017/blogify";
  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Database Connected (Local fallback)");
    mongoose.connection.on("disconnected", () =>
      console.warn("⚠️  MongoDB disconnected. Reconnecting..."));
    mongoose.connection.on("error", (err) =>
      console.error("❌ MongoDB error (local):", err.message));
    return; // success – fallback connection established
  } catch (fallbackError) {
    console.error(`❌ Local MongoDB fallback failed: ${fallbackError.message}`);
    process.exit(1);
  }
};

export default connectDB;
