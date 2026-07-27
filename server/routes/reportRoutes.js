import express from "express";
import { protect } from "../middleware/auth.js";
import { createReport, getReports, resolveReport } from "../controllers/reportController.js";

const router = express.Router();

// User submits report
router.post("/", protect, createReport);

// Admin moderation endpoints
router.get("/admin", protect, getReports);
router.put("/admin/:reportId", protect, resolveReport);

export default router;
