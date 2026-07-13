// aiService.js

// ✅ Import REAL RunAnywhere package
import { LlamaModel } from "web-starter-app/src/@runanywhere";

let model = null;

// Load model once
async function loadModel() {
  if (!model) {
    model = await LlamaModel.load({
      model: "smollm2"
    });
  }
}

// Initialize
loadModel();

export async function getAIResponse(input) {
  try {
    if (!model) {
      await loadModel();
    }

    const result = await model.generate({
      prompt: `Give short first aid advice: ${input}`,
      maxTokens: 80
    });

    if (result?.text) {
      return result.text;
    }
  } catch (err) {
    console.log("Model failed:", err);
  }

  return smartResponse(input);
}




function smartResponse(input) {
  const text = input.toLowerCase().replace(/[^a-z\s]/g, "");

  if (text.includes("burn")) {
    return `🔥 Burn Care:
1. Cool under running water
2. Do NOT apply ice
3. Cover with cloth`;
  }

  if (text.includes("cut") || text.includes("bleeding")) {
    return `🩸 Injury Care:
1. Apply pressure
2. Clean wound
3. Bandage it`;
  }

  if (text.includes("faint")) {
    return `😵 Fainting:
1. Lay flat
2. Elevate legs
3. Check breathing`;
  }

  if (text.includes("fire")) {
    return `🔥 Fire:
1. Move away
2. Cover nose
3. Avoid smoke`;
  }

  return `⚠️ Stay calm, ensure safety, and seek help if needed.`;
}