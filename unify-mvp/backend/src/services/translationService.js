const { translate } = require('google-translate-api-x');

/**
 * Mock language detection fallback based on basic character heuristics.
 */
const mockDetectLanguage = (text = '') => {
  const lower = text.toLowerCase();
  if (/[áéíóúñ¿¡]/.test(lower) || /(hola|gracias|adios)/.test(lower)) return 'es';
  if (/[àâçéèêëîïôûùüÿœ]/.test(lower) || /(bonjour|merci|salut)/.test(lower)) return 'fr';
  return 'en';
};

/**
 * Fallback translation used when no key exists or external call fails.
 */
const mockTranslateText = (text, from, to) => {
  if (from === to) return text;
  return `[${from}->${to}] ${text}`;
};

const detectLanguage = async (text) => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  // If no API key is configured, use a deterministic mock for local development.
  if (!apiKey) return mockDetectLanguage(text);

  try {
    const result = await translate(text, { to: 'en' });
    return result?.from?.language?.iso || mockDetectLanguage(text);
  } catch (error) {
    return mockDetectLanguage(text);
  }
};

const translateToTarget = async ({ text, fromLanguage, toLanguage }) => {
  if (fromLanguage === toLanguage) return text;

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return mockTranslateText(text, fromLanguage, toLanguage);

  try {
    const result = await translate(text, { from: fromLanguage, to: toLanguage });
    return result.text;
  } catch (error) {
    return mockTranslateText(text, fromLanguage, toLanguage);
  }
};

module.exports = {
  detectLanguage,
  translateToTarget,
};
