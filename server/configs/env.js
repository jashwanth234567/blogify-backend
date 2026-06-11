/**
 * env.js — Bootstrap dotenv FIRST before any other module reads process.env.
 *
 * WHY this file exists:
 * In ES modules, `import` statements are HOISTED and executed before any
 * top-level code. This means that calling `dotenv.config()` in server.js
 * AFTER the import declarations runs TOO LATE — other modules (e.g. gemini.js)
 * already read `process.env` before dotenv had a chance to populate it.
 *
 * Solution: put dotenv.config() in its own module and import it FIRST.
 * Node guarantees modules are evaluated in import order, so this file
 * runs before any subsequent import reads process.env.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root (one directory up from configs/)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// Validate critical environment variables
const required = ["GEMINI_API_KEY", "MONGODB_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  console.error("   → Make sure they are set in server/.env or in Render's Environment panel.");
} else {
  console.log("✅ All required environment variables loaded.");
}
