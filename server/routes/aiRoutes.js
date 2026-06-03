import express from "express";
import { protect } from "../middleware/auth.js";
import { generateSummary, translateContent, suggestTitles, chatAssistant } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/suggest-titles", protect, suggestTitles);
aiRouter.post("/summarize", generateSummary);
aiRouter.post("/translate", translateContent);
aiRouter.post("/chat", chatAssistant);

export default aiRouter;
