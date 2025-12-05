import axios from 'axios';

// Supported languages with their names and codes
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  ru: 'Russian',
  pl: 'Polish',
  uk: 'Ukrainian',
  zh: 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  ja: 'Japanese',
  ko: 'Korean',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  tl: 'Tagalog',
  ar: 'Arabic',
  he: 'Hebrew',
  tr: 'Turkish',
  fa: 'Persian',
  ur: 'Urdu',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  sw: 'Swahili',
  zu: 'Zulu',
  am: 'Amharic',
  yo: 'Yoruba',
  ig: 'Igbo',
  ha: 'Hausa',
  cs: 'Czech',
  sk: 'Slovak',
  hu: 'Hungarian',
  ro: 'Romanian',
  bg: 'Bulgarian',
  el: 'Greek',
  fi: 'Finnish',
  sv: 'Swedish',
  no: 'Norwegian',
  da: 'Danish',
  is: 'Icelandic',
  et: 'Estonian',
  lv: 'Latvian',
  lt: 'Lithuanian',
  sr: 'Serbian',
  hr: 'Croatian',
  sl: 'Slovenian',
  sq: 'Albanian',
  mk: 'Macedonian',
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Translation cache to reduce API costs
const translationCache = new Map<string, string>();

function getCacheKey(text: string, from: string, to: string): string {
  return `${from}:${to}:${text.substring(0, 100)}`;
}

// Detect language of text (simple heuristic)
export function detectLanguage(text: string): LanguageCode {
  if (!text || text.trim().length === 0) return 'en';
  
  // Simple detection based on character sets
  const hasChineseChars = /[\u4e00-\u9fff]/.test(text);
  const hasJapaneseChars = /[\u3040-\u309f\u30a0-\u30ff]/.test(text);
  const hasKoreanChars = /[\uac00-\ud7af]/.test(text);
  const hasArabicChars = /[\u0600-\u06ff]/.test(text);
  const hasCyrillicChars = /[\u0400-\u04ff]/.test(text);
  const hasThaiChars = /[\u0e00-\u0e7f]/.test(text);
  
  if (hasChineseChars) return 'zh';
  if (hasJapaneseChars) return 'ja';
  if (hasKoreanChars) return 'ko';
  if (hasArabicChars) return 'ar';
  if (hasCyrillicChars) return 'ru';
  if (hasThaiChars) return 'th';
  
  // Default to English for Latin scripts
  return 'en';
}

// Translate text using DeepL API (premium quality)
async function translateWithDeepL(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPL_API_KEY not configured');
  }

  const url = 'https://api-free.deepl.com/v2/translate';
  
  const params: any = {
    auth_key: apiKey,
    text: text,
    target_lang: targetLanguage.toUpperCase(),
  };
  
  if (sourceLanguage) {
    params.source_lang = sourceLanguage.toUpperCase();
  }

  const response = await axios.post(url, new URLSearchParams(params), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (response.data?.translations?.[0]?.text) {
    return response.data.translations[0].text;
  }

  throw new Error('DeepL translation failed');
}

// Translate text using Google Translate API (fallback)
async function translateWithGoogle(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_TRANSLATE_API_KEY not configured');
  }

  const url = 'https://translation.googleapis.com/language/translate/v2';
  
  const params: any = {
    key: apiKey,
    q: text,
    target: targetLanguage,
  };
  
  if (sourceLanguage) {
    params.source = sourceLanguage;
  }

  const response = await axios.post(url, params);

  if (response.data?.data?.translations?.[0]?.translatedText) {
    return response.data.data.translations[0].translatedText;
  }

  throw new Error('Google Translate failed');
}

// Main translation function with fallback logic
export async function translateText(
  text: string,
  targetLanguage: LanguageCode,
  sourceLanguage?: LanguageCode
): Promise<{ translatedText: string; detectedLanguage: string }> {
  // Validate inputs
  if (!text || text.trim().length === 0) {
    return { translatedText: text, detectedLanguage: sourceLanguage || 'en' };
  }

  // Detect source language if not provided
  const fromLang = sourceLanguage || detectLanguage(text);
  
  // Don't translate if already in target language
  if (fromLang === targetLanguage) {
    return { translatedText: text, detectedLanguage: fromLang };
  }

  // Check cache first
  const cacheKey = getCacheKey(text, fromLang, targetLanguage);
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return { translatedText: cached, detectedLanguage: fromLang };
  }

  let translatedText: string;
  
  try {
    // Try Google Translate first (primary service)
    translatedText = await translateWithGoogle(text, targetLanguage, fromLang);
  } catch (googleError) {
    console.warn('Google Translate failed, trying DeepL:', googleError);
    
    try {
      // Fallback to DeepL if available
      translatedText = await translateWithDeepL(text, targetLanguage, fromLang);
    } catch (deeplError) {
      console.error('Both Google Translate and DeepL failed:', deeplError);
      // Return original text if both services fail
      return { translatedText: text, detectedLanguage: fromLang };
    }
  }

  // Cache the translation
  translationCache.set(cacheKey, translatedText);

  return { translatedText, detectedLanguage: fromLang };
}

// Batch translate multiple texts (more efficient)
export async function translateBatch(
  texts: string[],
  targetLanguage: LanguageCode,
  sourceLanguage?: LanguageCode
): Promise<Array<{ translatedText: string; detectedLanguage: string }>> {
  // Process translations in parallel
  return Promise.all(
    texts.map(text => translateText(text, targetLanguage, sourceLanguage))
  );
}

// Clear translation cache (useful for memory management)
export function clearTranslationCache(): void {
  translationCache.clear();
}

// Get cache size for monitoring
export function getTranslationCacheSize(): number {
  return translationCache.size;
}
