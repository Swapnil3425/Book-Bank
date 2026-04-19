// backend/utils/geminiClient.js
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";

if (!GEMINI_API_KEY) {
  console.warn(
    "[Gemini] GEMINI_API_KEY is not set. Chatbot endpoint will fail until you configure it."
  );
}

/**
 * Call Gemini generateContent API with a simple text prompt.
 * Docs: https://ai.google.dev/api/generate-content
 */
async function generateGeminiText(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  };

  const headers = {
    "Content-Type": "application/json",
    "x-goog-api-key": GEMINI_API_KEY
  };

  try {
    const { data } = await axios.post(url, body, { headers });

    const candidate = data.candidates && data.candidates[0];
    const content = candidate && candidate.content;
    const parts = content && content.parts;
    const text = parts && parts[0] && parts[0].text;

    return text || "I couldn’t generate a proper response just now.";
  } catch (error) {
    console.error("[Gemini API Error]", error.response?.data || error.message);
    if (error.response?.status === 429) {
      return "The chatbot is currently experiencing high traffic and exceeded its quota. Please try again later.";
    }
    return "I encountered an error connecting to the AI brain. Please try again later.";
  }
}

module.exports = {
  generateGeminiText
};
