// src/services/ai.js
// import { generateAIResponse } from "./runAnywhere";
export async function getAIResponse(input) {
  return smartResponse(input);
}

function smartResponse(input) {
  const text = input.toLowerCase().replace(/[^a-z\s]/g, "");

  if (text.includes("burn")) {
    return `🔥 Burn Care:
1. Cool under running water
2. Do NOT apply ice
3. Cover with a clean cloth`;
  }

  if (text.includes("cut") || text.includes("bleeding")) {
    return `🩸 Injury Care:
1. Apply pressure
2. Clean the wound
3. Cover with a clean bandage`;
  }

  if (text.includes("faint")) {
    return `😵 Fainting:
1. Lay the person flat
2. Elevate their legs
3. Check breathing`;
  }

  if (text.includes("fire")) {
    return `🔥 Fire Emergency:
1. Move to a safe location
2. Avoid smoke
3. Contact emergency services`;
  }

  return `⚠️ Stay calm, ensure immediate safety, and seek professional help when needed.`;
}