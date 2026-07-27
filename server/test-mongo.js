// test-mongo.js
import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
console.log("Connecting to:", uri);
(async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Connected to Atlas");
    const admin = client.db().admin();
    const info = await admin.serverStatus();
    console.log("MongoDB version:", info.version);
    await client.close();
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
})();
