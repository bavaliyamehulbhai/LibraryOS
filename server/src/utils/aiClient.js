const OpenAI = require("openai");

const getClient = () => {
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY || "dummy_key",
    baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"
  });
};

const client = getClient();

const DEFAULT_MODELS = [
  process.env.GROQ_MODEL,
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it"
].filter(Boolean);

/**
 * Robust Chat Completion wrapper with automatic model fallback
 */
const callChatCompletion = async (params) => {
  const client = getClient();
  let preferredModel = params.model || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const modelsToTry = [...new Set([preferredModel, ...DEFAULT_MODELS])];

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const response = await client.chat.completions.create({
        ...params,
        model
      });
      return response;
    } catch (error) {
      lastError = error;
      const errorMsg = error.message || "";
      // If model not found or account doesn't have access, try next model in priority order
      if (
        error.status === 404 ||
        errorMsg.includes("does not exist") ||
        errorMsg.includes("not have access") ||
        errorMsg.includes("decommissioned")
      ) {
        console.warn(`[Groq AI] Model '${model}' unavailable. Attempting fallback...`);
        continue;
      }
      // For auth errors or rate limits, re-throw immediately
      throw error;
    }
  }
  throw lastError;
};

module.exports = {
  client,
  callChatCompletion,
  DEFAULT_MODEL: process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
};
