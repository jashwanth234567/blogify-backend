import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing! Ensure it is set in .env or Render env vars.');
}

// Initialize the SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the correct 1.5-flash model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const generateBlogContent = async (title) => {
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
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanedResponse = response.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const generateSummaryContent = async (text) => {
  try {
    const prompt = `Provide a brief, concise summary (around 3-4 sentences) of the following article content. Keep it engaging and professional.\n\nArticle content:\n${text}\n\nReturn ONLY the plain text summary without any markdown code blocks or HTML.`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini Summarize Error:", error);
    return null;
  }
};

export const translateHtmlContent = async (text, targetLanguage) => {
  try {
    const prompt = `Translate the following HTML/text content into ${targetLanguage}. You MUST preserve all HTML tags, inline tags, attributes, and formatting structure exactly as they are. Translate only the human-readable text content inside tags.\n\nContent:\n${text}\n\nReturn ONLY the translated content. Do NOT wrap in markdown code blocks.`;
    const result = await model.generateContent(prompt);
    return result.response.text().replace(/```html/g, "").replace(/```/g, "").trim();
  } catch (error) {
    console.error("Gemini Translate Error:", error);
    return null;
  }
};

export const suggestSeoTitles = async (topic) => {
  try {
    const prompt = `Suggest 3 catchy and SEO-friendly titles for a blog post about: "${topic}". Return ONLY a valid JSON array of strings:\n[\n  "Title 1",\n  "Title 2"\n]`;
    const result = await model.generateContent(prompt);
    const response = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(response);
  } catch (error) {
    console.error("Gemini Suggest Titles Error:", error);
    return null;
  }
};

export const generateChatReply = async (message, history = []) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing – cannot generate chat reply');
      throw new Error('GEMINI_API_KEY is missing');
    }
    let context = "You are a premium AI writing assistant for Blogify SaaS. Help the user with blog ideas, SEO tags, writing, grammar, outline generation, or general queries. Keep replies formatted nicely using markdown.\n\n";
    if (history && history.length > 0) {
      history.forEach(h => {
        context += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content || h.text}\n`;
      });
    }
    context += `User: ${message}\nAssistant:`;

    const result = await model.generateContent(context);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};