import { aiProvider } from "../services/aiProvider.js";
import { translationService } from "../services/translationService.js";
import { nlpService } from "../services/nlpService.js";
import AiHistory from "../models/AiHistory.js";

// AI Generate Blog Content
// POST /api/blog/generate
export const generateBlog = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.userId;

        if (!prompt) {
            return res.json({ success: false, message: "Prompt is required" });
        }

        const result = await aiProvider.generateBlog(prompt);

        if (!result) {
            return res.json({ success: false, message: "Failed to generate content" });
        }

        // Save to AI History (non-blocking)
        if (userId) {
            AiHistory.create({
                user: userId,
                prompt,
                generatedContent: JSON.stringify(result),
                type: "blog",
            }).catch(err => console.error("History save error:", err.message));
        }

        res.json({
            success: true,
            content: result.description,
            subTitle: result.subTitle,
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// AI Summarize Blog Content
// POST /api/ai/summarize
export const generateSummary = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.userId;

        if (!content) {
            return res.json({ success: false, message: "Content is required to summarize" });
        }

        // Strip HTML tags for cleaner summarization input
        const cleanText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        const summary = await aiProvider.summarizeBlog(cleanText);

        if (!summary) {
            return res.json({ success: false, message: "Failed to generate summary" });
        }

        // Save to AI History (non-blocking)
        if (userId) {
            AiHistory.create({
                user: userId,
                prompt: cleanText.substring(0, 100) + "...",
                generatedContent: summary,
                type: "summary",
            }).catch(err => console.error("History save error:", err.message));
        }

        res.json({ success: true, summary });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// AI Translate Blog Content
// POST /api/ai/translate
export const translateContent = async (req, res) => {
    try {
        const { title, subTitle, description, targetLanguage } = req.body;
        const userId = req.userId;

        if (!targetLanguage) {
            return res.json({ success: false, message: "Target language is required" });
        }

        const [translatedTitle, translatedSubTitle, translatedDesc] = await Promise.all([
            title ? translationService.translateHtmlContent(title, targetLanguage) : Promise.resolve(title || ""),
            subTitle ? translationService.translateHtmlContent(subTitle, targetLanguage) : Promise.resolve(subTitle || ""),
            description ? translationService.translateHtmlContent(description, targetLanguage) : Promise.resolve(description || "")
        ]);

        // Build result object
        const result = {
            title: translatedTitle || title || "",
            subTitle: translatedSubTitle || subTitle || "",
            description: translatedDesc || description || "",
            audioBase64: null, // Audio rendering is now handled purely client-side
        };

        // Save to AI History
        if (userId) {
            try {
                await AiHistory.create({
                    user: userId,
                    prompt: `Translate to ${targetLanguage}: ${title}`,
                    generatedContent: JSON.stringify(result),
                    type: "translation",
                });
            } catch (historyErr) {
                console.error("Failed to save AiHistory:", historyErr.message);
            }
        }

        res.json({ success: true, translated: result });
    } catch (error) {
        console.error("Translation controller error:", error);
        const fallbackResult = {
            title: req.body?.title || "",
            subTitle: req.body?.subTitle || "",
            description: req.body?.description || "",
            audioBase64: null,
        };
        res.json({ success: true, translated: fallbackResult, message: "Fallback translation applied." });
    }
};

// AI Suggest SEO Titles
// POST /api/ai/suggest-titles
export const suggestTitles = async (req, res) => {
    try {
        const { topic } = req.body;
        const userId = req.userId;

        if (!topic) {
            return res.json({ success: false, message: "Topic is required" });
        }

        const titles = await aiProvider.generateSEO(topic);

        if (!titles) {
            return res.json({ success: false, message: "Failed to suggest titles" });
        }

        // Save to AI History (only if user is logged in)
        if (userId) {
            AiHistory.create({
                user: userId,
                prompt: topic,
                generatedContent: JSON.stringify(titles),
                type: "title",
            }).catch(err => console.error("History save error:", err.message));
        }

        res.json({ success: true, titles });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// AI Chat Assistant
// POST /api/ai/chat
export const chatAssistant = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.userId;

    console.log("Chat Request Received:", message);

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }
    
    // Check if the user is asking for Grammar Correction
    if (message.toLowerCase().includes("check and improve the grammar")) {
        console.log("Triggering NLP Grammar Service...");
        // Extract text after the prompt pattern
        const textToFix = message.split(": ").pop();
        
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        const corrected = await nlpService.checkGrammar(textToFix);
        console.log("Grammar Check Completed. Result:", corrected);
        
        res.write(`data: ${JSON.stringify({ chunk: "Here is the grammatically corrected text:\n\n" })}\n\n`);
        res.write(`data: ${JSON.stringify({ chunk: corrected })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        res.end();
        console.log("Response Sent (Grammar).");
        
        if (userId) {
          AiHistory.create({ user: userId, prompt: message, generatedContent: corrected, type: "chat" }).catch(console.error);
        }
        return;
    }

    console.log("Triggering AI Provider Chat Stream...");
    // Set headers for regular AI streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = aiProvider.chatStream(message, history);
    let fullReply = "";

    for await (const chunk of stream) {
      fullReply += chunk;
      // Send chunk as SSE
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // Send end event
    res.write(`data: [DONE]\n\n`);
    res.end();
    console.log("Response Sent (Stream).");

    // Save full reply to AI History
    if (userId && fullReply) {
      AiHistory.create({
        user: userId,
        prompt: message,
        generatedContent: fullReply,
        type: "chat",
      }).catch(err => console.error("History save error:", err.message));
    }

  } catch (error) {
    console.error("AI Chat Controller Error:", error);
    res.write(`data: ${JSON.stringify({ chunk: "Sorry, the AI Assistant encountered an error." })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
};