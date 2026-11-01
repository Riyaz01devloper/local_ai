const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const models = [
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-pro"
];

async function generateEmergencyResponse(userMessage) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  const prompt = `You are an emergency first-aid assistant.

Rules:
- Maximum 5 numbered steps.
- Keep the response under 80 words.
- Never guess or provide unsafe advice.
- If the situation is life-threatening, tell the user to call emergency services immediately.

User: ${userMessage}`;

  let lastError = null;
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.2,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to generate content with Gemini models");
}

module.exports = {
  generateEmergencyResponse,
};
