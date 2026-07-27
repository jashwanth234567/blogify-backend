class NLPService {
  /**
   * Check and correct grammar using the open-source LanguageTool API.
   * Completely replaces Gemini for grammar queries.
   */
  async checkGrammar(text, language = 'en-US') {
    if (!text || text.trim() === '') return text;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const params = new URLSearchParams({
        text: text,
        language: language,
      });

      const response = await fetch('https://api.languagetoolplus.com/v2/check', {
        method: 'POST',
        body: params,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      
      // Auto-apply grammar fixes if suggestions exist
      let correctedText = text;
      let offsetAdjustment = 0;

      if (data && data.matches) {
        data.matches.forEach(match => {
          if (match.replacements && match.replacements.length > 0) {
            const replacement = match.replacements[0].value;
            const start = match.offset + offsetAdjustment;
            const end = start + match.length;
            
            correctedText = correctedText.substring(0, start) + replacement + correctedText.substring(end);
            offsetAdjustment += replacement.length - match.length;
          }
        });
      }
      
      return correctedText;
    } catch (error) {
      console.warn("LanguageTool Grammar Error:", error.message);
      return text; // Fallback to original text on failure
    }
  }

  /**
   * Extract tags/keywords using local NLP logic (Stopword removal + Frequency analysis)
   * Completely replaces Gemini for keyword extraction.
   */
  extractTags(text, limit = 5) {
    if (!text) return [];
    
    const stopwords = new Set([
      "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", 
      "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", 
      "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", 
      "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", 
      "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", 
      "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", 
      "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", 
      "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", 
      "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", 
      "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", 
      "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", 
      "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", 
      "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "will"
    ]);

    // Strip HTML and punctuation
    const cleanText = text.replace(/<[^>]*>?/gm, ' ').replace(/[^\w\s]/g, '').toLowerCase();
    const words = cleanText.split(/\s+/);
    
    const wordCounts = {};
    words.forEach(word => {
      if (word.length > 3 && !stopwords.has(word) && isNaN(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    // Sort by frequency
    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    // Return top N keywords/tags
    return sortedWords.slice(0, limit);
  }
}

export const nlpService = new NLPService();
