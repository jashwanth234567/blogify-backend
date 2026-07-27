import { GoogleGenerativeAI } from "@google/generative-ai";

// Use gemini-2.0-flash — fastest, most stable, free-tier available model
const GEMINI_MODEL = "gemini-2.0-flash";

class AIProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.isValidKey = Boolean(this.apiKey && this.apiKey.trim().length > 10);
    this.genAI = this.isValidKey ? new GoogleGenerativeAI(this.apiKey) : null;
  }

  getModel(modelName = GEMINI_MODEL, generationConfig = {}) {
    if (!this.genAI) return null;
    try {
      return this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024, ...generationConfig }
      });
    } catch (err) {
      console.error("Error creating Gemini model:", err.message);
      return null;
    }
  }

  // 1. Generate Blog Article Content
  async generateBlog(title) {
    const model = this.getModel(GEMINI_MODEL);
    if (model) {
      try {
        const prompt = `
Generate a professional blog article.
Title: ${title}

Requirements:
- Create a catchy subtitle.
- Generate a detailed blog post in HTML format.

Return ONLY valid JSON:
{
  "subTitle": "Blog subtitle",
  "description": "<h2>Introduction</h2><p>...</p>"
}
`;
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("AI timeout")), 10000));
        const result = await Promise.race([model.generateContent(prompt), timeout]);
        const response = result.response.text();
        const cleanedResponse = response
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        return JSON.parse(cleanedResponse);
      } catch (error) {
        console.warn("AI Blog Generation Error:", error.message);
      }
    }

    // Fallback article generator
    return {
      subTitle: `Comprehensive Guide to ${title}`,
      description: `<h2>Introduction</h2><p>Welcome to our deep dive into <strong>${title}</strong>. In this article, we explore key concepts, practical insights, and modern best practices.</p><h2>Key Highlights</h2><p>Building high quality solutions requires attention to detail, robust architecture, and smooth user experience.</p><h2>Conclusion</h2><p>Stay tuned for more updates and detailed tutorials on ${title}.</p>`
    };
  }

  // 2. Generate Blog Summary
  async summarizeBlog(text) {
    if (!text) return "";
    const summaryModel = this.getModel(GEMINI_MODEL, { maxOutputTokens: 256 });
    if (summaryModel) {
      try {
        const prompt = `
Provide a brief, concise summary (around 3-4 sentences) of the following article content. Keep it engaging and professional.

Article content:
${text.slice(0, 3000)}

Return ONLY plain text summary without code blocks.
`;
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Summary generation timed out")), 8000)
        );
        const result = await Promise.race([summaryModel.generateContent(prompt), timeout]);
        const resText = result.response.text().trim();
        if (resText) return resText;
      } catch (error) {
        console.warn("AI Summarize Error:", error.message);
      }
    }

    // Instant Fallback: strip HTML and return concise lead section
    const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const sentences = plain.match(/[^.!?]+[.!?]+/g) || [plain];
    return sentences.slice(0, 4).join(" ") || plain.slice(0, 280) + "...";
  }

  // 3. AI Chat Assistant (Streaming)
  async *chatStream(message, history = []) {
    const model = this.getModel(GEMINI_MODEL);
    if (model) {
      try {
        let context = "You are a premium AI writing assistant for Blogify SaaS. Help the user with blog ideas, SEO tags, writing, grammar, outline generation, or general queries. Keep replies nicely formatted.\n\n";
        if (history && history.length > 0) {
          history.forEach(h => {
            context += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content || h.text}\n`;
          });
        }
        context += `User: ${message}\nAssistant:`;

        const result = await model.generateContentStream(context);
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) yield chunkText;
        }
        return;
      } catch (error) {
        console.warn("AI Chat Streaming Error:", error.message);
      }
    }

    // Fallback Chat Reply - stream word by word
    const fallback = `I am Blogify AI Assistant. You asked: "${message}". How can I help you refine your blog content, SEO strategy, or article layout today?`;
    yield fallback;
  }

  // 4. Suggest SEO Titles
  async generateSEO(topic) {
    const model = this.getModel(GEMINI_MODEL);
    if (model) {
      try {
        const prompt = `
Suggest 3 catchy and SEO-friendly titles for a blog post about: "${topic}".
Return ONLY a valid JSON array of strings:
[
  "Title option 1",
  "Title option 2",
  "Title option 3"
]
`;
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000));
        const result = await Promise.race([model.generateContent(prompt), timeout]);
        const response = result.response.text()
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        return JSON.parse(response);
      } catch (error) {
        console.warn("AI Suggest Titles Error:", error.message);
      }
    }

    // Fallback title options
    return [
      `The Ultimate Guide to ${topic}`,
      `10 Essential Insights Every Developer Should Know About ${topic}`,
      `Unlocking the Future of ${topic}: Trends and Best Practices`
    ];
  }
}

export const aiProvider = new AIProvider();
