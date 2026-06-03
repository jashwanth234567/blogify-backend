import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import connectDB from "./configs/db.js";
import blogRouter from "./routes/blogRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import userRouter from "./routes/userRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";

const app = express();

await connectDB();
connectCloudinary();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve React build static files (if they exist)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.resolve(__dirname, "..", "client", "dist");
app.use(express.static(clientBuildPath));

// API Routes
app.use("/api/blog", blogRouter);
app.use("/api/comment", commentRouter);
app.use("/api/user", userRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/ai", aiRouter);

// Fallback for API routes (if not found, return 404 instead of serving index.html)
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// Fallback: serve React index.html for any other unmatched route (SPA routing)
app.use((req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("Server is running on port " + PORT);
});

export default app;
