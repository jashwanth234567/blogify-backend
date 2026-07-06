import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing! Ensure it is set in .env or Render env vars.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
  // Faster, lower token usage for text generation
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  },
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

    const cleanedResponse = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.log("Gemini Error:", error);
    return null;
  }
};

// 1. Generate Blog Summary helper
export const generateSummaryContent = async (text) => {
  // Use a faster config for summaries
  const summaryModel = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  });
  try {
    const prompt = `
Provide a brief, concise summary (around 3-4 sentences) of the following article content.
Keep it engaging and professional.

Article content:
${text}

Return ONLY the plain text summary without any markdown code blocks or HTML.
`;

    // Add an 8‑second timeout to avoid hanging forever
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Summary generation timed out")), 8000)
    );
    const result = await Promise.race([summaryModel.generateContent(prompt), timeout]);
    return result.response.text().trim();
  } catch (error) {
    console.warn("Gemini Summarize Error (fallback):", error);
    // Fallback: strip HTML and return first 200 characters
    const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return plain.slice(0, 200) + (plain.length > 200 ? "…" : "");
  }
};

// 2. Translate HTML helper
export const translateHtmlContent = async (text, targetLanguage) => {
  try {
    const prompt = `
Translate the following HTML/text content into ${targetLanguage}.
You MUST preserve all HTML tags, inline tags, attributes, and formatting structure exactly as they are. Translate only the human-readable text content inside tags.

Content:
${text}

Return ONLY the translated content. Do NOT wrap in markdown code blocks like \`\`\`html or \`\`\`.
`;

    const result = await model.generateContent(prompt);
    return result.response.text()
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .trim();
  } catch (error) {
    console.log("Gemini Translate Error:", error);
    return null;
  }
};

// New: Generate audio (TTS) using Gemini's audio modality
export const generateAudioContent = async (text, voiceName = "en-US-Standard-A") => {
  try {
    // Use a model that supports audio generation (flash-tts preview)
    const audioModel = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      // Request audio output; keep same fast config
      generationConfig: {
        responseMimeType: "audio/mp3",
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });
    const prompt = `Speak the following text exactly as is, using voice ${voiceName}: ${text}`;
    const result = await audioModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // Ensure audio response
      generationConfig: { responseMimeType: "audio/mp3" },
    });
    // The SDK returns a Blob or base64; we convert to base64 string
    const audioData = await result.response.blob();
    const arrayBuffer = await audioData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:audio/mp3;base64,${base64}`;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};

// 3. Suggest SEO Titles helper
export const suggestSeoTitles = async (topic) => {
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

    const result = await model.generateContent(prompt);
    const response = result.response.text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(response);
  } catch (error) {
    console.log("Gemini Suggest Titles Error:", error);
    return null;
  }
};

// 4. Chat Assistant helper
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