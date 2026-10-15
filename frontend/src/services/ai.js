/**
 * AI service — calls the backend Gemini/rule-engine endpoint.
 * Falls back to the local keyword matcher if the backend is unreachable.
 *
 * Fixes P1-2: frontend now actually uses the Gemini backend.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getAIResponse(input) {
  try {
    const res = await fetch(`${API_URL}/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    if (!res.ok) {
      console.warn("Gemini backend returned", res.status, "— falling back to local responses");
      return localSmartResponse(input);
    }

    const data = await res.json();

    if (data.success && data.reply) {
      return data.reply;
    }

    return localSmartResponse(input);
  } catch (err) {
    // Backend unreachable (offline or server not running) — use local fallback
    console.warn("Backend unreachable, using offline fallback:", err.message);
    return localSmartResponse(input);
  }
}

/**
 * Local rule-based fallback — works fully offline.
 * Intentionally simple. The backend ruleEngine.js has the richer version.
 */
function localSmartResponse(input) {
  const text = input.toLowerCase().replace(/[^a-z\s]/g, "");

  if (text.includes("burn") || text.includes("burnt") || text.includes("burned")) {
    return `🔥 Burn First Aid\n\n1. Cool the burn under cool running water for at least 20 minutes.\n2. Do NOT apply ice, butter, or toothpaste.\n3. Cover with a clean, non-fluffy dressing.\n4. Remove rings or tight items near the burn.\n5. Seek medical help for severe burns.\n\n⚠️ This is offline guidance — backend is not reachable.`;
  }

  if (text.includes("cut") || text.includes("bleeding") || text.includes("blood")) {
    return `🩸 Bleeding First Aid\n\n1. Apply firm pressure with a clean cloth.\n2. Raise the injured area above heart level if possible.\n3. Keep pressure on until bleeding stops.\n4. If bleeding is severe or won't stop, call emergency services immediately.\n\n⚠️ This is offline guidance — backend is not reachable.`;
  }

  if (text.includes("faint") || text.includes("unconscious") || text.includes("collapsed")) {
    return `😵 Fainting\n\n1. Lay the person flat on their back.\n2. Raise their legs slightly.\n3. Loosen tight clothing.\n4. Check for breathing and pulse.\n5. If unconscious for more than 1 minute, call emergency services.\n\n⚠️ This is offline guidance — backend is not reachable.`;
  }

  if (text.includes("fire") || text.includes("smoke")) {
    return `🔥 Fire Emergency\n\n1. Alert everyone and activate the fire alarm.\n2. Call emergency services immediately.\n3. Evacuate via the nearest safe exit — do NOT use lifts.\n4. Stay low to avoid smoke.\n5. If trapped, close doors and signal from a window.\n\n⚠️ This is offline guidance — backend is not reachable.`;
  }

  if (text.includes("chok") || text.includes("airway") || text.includes("breathing")) {
    return `🫁 Choking\n\n1. Encourage coughing if the person is conscious.\n2. Give up to 5 firm back blows between shoulder blades.\n3. If that fails, perform up to 5 abdominal thrusts (Heimlich).\n4. Alternate back blows and abdominal thrusts.\n5. Call emergency services if the obstruction does not clear.\n\n⚠️ This is offline guidance — backend is not reachable.`;
  }

  if (text.includes("heart") || text.includes("chest pain") || text.includes("cardiac")) {
    return `❤️ Heart Attack\n\n1. Call emergency services IMMEDIATELY.\n2. Have the person sit or lie comfortably.\n3. Loosen tight clothing.\n4. If conscious and not allergic, aspirin (300 mg) may help — chew slowly.\n5. Begin CPR if the person becomes unresponsive and not breathing normally.\n\n⚠️ This is offline guidance — backend is not reachable.`;
  }

  return `⚠️ Stay calm and ensure immediate safety.\n\nFor life-threatening emergencies, call your local emergency services immediately (e.g. 911 / 999 / 112).\n\nDescribe the emergency in more detail for specific first-aid guidance.\n\nNote: The AI backend is currently unreachable. Check that the backend server is running.`;
}