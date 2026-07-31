// Dedicated High-Speed Translation Service
// Removes reliance on Gemini and uses a fetch fallback with in-memory caching.

class TranslationService {
  constructor() {
    // In-memory cache: { "en:hi:Hello": "नमस्ते" }
    this.cache = new Map();
  }

  getLangCode(langName) {
    if (!langName) return 'en';
    const lower = langName.toLowerCase();
    if (lower.includes('hi') || lower.includes('hindi')) return 'hi';
    if (lower.includes('te') || lower.includes('telugu')) return 'te';
    if (lower.includes('ta') || lower.includes('tamil')) return 'ta';
    if (lower.includes('es') || lower.includes('spanish')) return 'es';
    if (lower.includes('fr') || lower.includes('french')) return 'fr';
    if (lower.includes('de') || lower.includes('german')) return 'de';
    if (lower.includes('ja') || lower.includes('japanese')) return 'ja';
    if (lower.includes('zh') || lower.includes('chinese')) return 'zh-CN';
    if (lower.includes('ar') || lower.includes('arabic')) return 'ar';
    if (lower.includes('ru') || lower.includes('russian')) return 'ru';
    if (lower.includes('it') || lower.includes('italian')) return 'it';
    if (lower.includes('pt') || lower.includes('portuguese')) return 'pt';
    return lower.slice(0, 2);
  }

  async translateHtmlContent(text, targetLanguage) {
    if (!text) return "";
    const langCode = this.getLangCode(targetLanguage);
    
    // Hash key for cache
    const cacheKey = `${langCode}:${text.length}:${text.substring(0, 20)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Split long HTML text into chunks if needed (simplified here to 2000 chars for public API limits)
      const textChunk = text.length > 2000 ? text.slice(0, 2000) : text;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s max timeout

      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(textChunk)}`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (data && data[0]) {
        const translatedText = data[0].map(item => item[0]).join('');
        this.cache.set(cacheKey, translatedText);
        return translatedText;
      }
      return text;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn("Translation Service Error: Request timed out");
      } else {
        console.error("Translation Service Error:", err.message);
      }
      // Graceful fallback to original text
      return text;
    }
  }
}

export const translationService = new TranslationService();
