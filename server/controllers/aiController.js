import { generateBlogContent, generateSummaryContent, translateHtmlContent, generateAudioContent, suggestSeoTitles, generateChatReply } from "../configs/gemini.js";
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

        const result = await generateBlogContent(prompt);

        if (!result) {
            return res.json({ success: false, message: "Failed to generate content" });
        }

        // Save to AI History
        await AiHistory.create({
            user: userId,
            prompt,
            generatedContent: JSON.stringify(result),
            type: "blog",
        });

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
        const summary = await generateSummaryContent(cleanText);

        if (!summary) {
            return res.json({ success: false, message: "Failed to generate summary" });
        }

        // Save to AI History
        await AiHistory.create({
            user: userId,
            prompt: cleanText.substring(0, 100) + "...",
            generatedContent: summary,
            type: "summary",
        });

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

        // Ensure the API key is present before proceeding
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY missing in translateContent');
            return res.json({ success: false, message: 'GEMINI_API_KEY missing. Configure it in .env or Render environment.' });
        }

        if (!targetLanguage) {
            return res.json({ success: false, message: "Target language is required" });
        }

        const translatedTitle = title ? await translateHtmlContent(title, targetLanguage) : "";
        const translatedSubTitle = subTitle ? await translateHtmlContent(subTitle, targetLanguage) : "";
        const translatedDesc = description ? await translateHtmlContent(description, targetLanguage) : "";

        // If any of the requested text translations failed (returned null or empty), return success: false
        if ((title && !translatedTitle) || (subTitle && !translatedSubTitle) || (description && !translatedDesc)) {
            return res.json({ success: false, message: "Translation failed. Please verify Gemini API key configuration." });
        }

        // Build result object
        const result = {
            title: translatedTitle,
            subTitle: translatedSubTitle,
            description: translatedDesc,
        };

        // Helper to pick a voice based on target language
        const voiceForLang = (lang) => {
          const map = {
            es: "es-ES-Standard-A", // Spanish
            fr: "fr-FR-Standard-A", // French
            de: "de-DE-Standard-A", // German
            hi: "hi-IN-Standard-A", // Hindi
          };
          return map[lang] || "en-US-Standard-A";
        };

        // Generate audio for the translated description using the appropriate voice
        const audioData = await generateAudioContent(translatedDesc, voiceForLang(targetLanguage));
        if (audioData) {
            result.audioBase64 = audioData; // data URI for <audio> tag
        }

        // Save to AI History
        await AiHistory.create({
            user: userId,
            prompt: `Translate to ${targetLanguage}: ${title}`,
            generatedContent: JSON.stringify(result),
            type: "translation",
        });

        res.json({ success: true, translated: result });
    } catch (error) {
        console.error("Translation controller error:", error);
        // Fallback: return original inputs without translation
        const fallbackResult = {
            title: title || "",
            subTitle: subTitle || "",
            description: description || "",
            audioBase64: null,
        };
        res.json({ success: true, translated: fallbackResult, message: "Fallback: translation not performed due to API key issues." });
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

        const titles = await suggestSeoTitles(topic);

        if (!titles) {
            return res.json({ success: false, message: "Failed to suggest titles" });
        }

        // Save to AI History
        await AiHistory.create({
            user: userId,
            prompt: topic,
            generatedContent: JSON.stringify(titles),
            type: "title",
        });

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

    if (!message) {
      return res.json({ success: false, message: "Message is required" });
    }

    const reply = await generateChatReply(message, history);
    if (!reply) {
      const missingKeyMsg = !process.env.GEMINI_API_KEY
        ? "GEMINI_API_KEY is missing. Configure it in .env or Render env vars."
        : "Failed to generate chat reply.";
      return res.json({ success: false, message: missingKeyMsg });
    }

    // Save to AI History
    if (userId) {
      await AiHistory.create({
        user: userId,
        prompt: message,
        generatedContent: reply,
        type: "chat",
      });
    }

    return res.json({ success: true, reply });
  } catch (error) {
    console.error("Chat controller error:", error);
    return res.json({ success: false, message: error.message });
  }
};