
require("dotenv").config();
const axios = require("axios");

const {
  getTodayAIUsage,
  recordAIRequest
} = require("../database/db");

const DAILY_AI_LIMIT = 3;

async function createMessage(news) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key missing in .env");
  }

  const currentUsage = getTodayAIUsage();

  if (currentUsage >= DAILY_AI_LIMIT) {
    throw new Error(
      "Daily Free Mode limit reached. Try again tomorrow."
    );
  }

  const model =
    process.env.AI_MODEL || "gemini-3.5-flash-lite";

  const prompt = `
You are a factual news editor.

Rules:
1. Use ONLY facts explicitly present in the supplied headline and description.
2. Never invent facts, quotes or claims.
3. If description is empty, translate only the headline.
4. Write in simple, neutral Hindi.
5. Keep the message concise.
6. Include the original source link exactly as provided.
7. Do not add hashtags.

Headline: ${news.title}
Description: ${news.description || "Not available"}
Original Link: ${news.link}
`;

  // Count the attempt before sending the API request.
  // Failed requests also count, preventing repeated retries.
  recordAIRequest();

  const response = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/interactions",
    {
      model,
      input: prompt,
      store: false
    },
    {
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json"
      },
      timeout: 90000
    }
  );

  const steps = response.data.steps || [];

  const message = steps
    .filter(step => step.type === "model_output")
    .flatMap(step => step.content || [])
    .filter(part => part.type === "text")
    .map(part => part.text)
    .join("\n")
    .trim();

  if (!message) {
    throw new Error("Gemini returned an empty response");
  }

  return message;
}

module.exports = { createMessage };
