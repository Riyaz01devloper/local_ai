const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmergencyResponse(userMessage) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.2,
      },
    });

    const prompt = `You are an emergency first-aid assistant.

Rules:
- Maximum 5 numbered steps.
- Keep the response under 80 words.
- Never guess or provide unsafe advice.
- If the situation is life-threatening, tell the user to call emergency services immediately.

User: ${userMessage}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini Error:", err.message || err);
    throw err;
  }
}

module.exports = {
  generateEmergencyResponse,
};