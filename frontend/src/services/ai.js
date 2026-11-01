/**
 * AI service — calls the backend Gemini / rule-engine endpoint.
 * In production on Vercel, requests route to same-origin /api/gemini.
 * Falls back to the local keyword matcher if the network is offline.
 */

const API_URL = import.meta.env.VITE_API_URL || "/api";

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
    // Offline or server not running — use local offline fallback
    console.warn("Backend request not reachable, using offline emergency guidance:", err.message);
    return localSmartResponse(input);
  }
}

/**
 * Local rule-based emergency triage fallback — works fully offline without network access.
 */
function localSmartResponse(input) {
  const text = input.toLowerCase().replace(/[^a-z\s]/g, "");

  if (text.includes("burn") || text.includes("burnt") || text.includes("burned") || text.includes("scald")) {
    return `🔥 Burn First Aid:\n\n1. Cool the burn under cold running water for at least 20 minutes.\n2. Do NOT apply ice, oil, butter, or toothpaste.\n3. Cover loosely with a clean, sterile non-stick cloth or plastic cling film.\n4. Remove rings or tight clothing before swelling begins.\n5. Seek immediate medical help if the burn is large or affects face/joints.\n\n*(Offline Triage Mode active)*`;
  }

  if (text.includes("cut") || text.includes("bleeding") || text.includes("blood") || text.includes("wound")) {
    return `🩸 Bleeding First Aid:\n\n1. Apply firm, continuous direct pressure with a clean cloth or bandage.\n2. Elevate the injured area above the heart if possible.\n3. Keep sustained pressure — do not remove the cloth to check.\n4. If blood soaks through, add another cloth on top.\n5. For uncontrolled bleeding, call emergency services (911/112) immediately.\n\n*(Offline Triage Mode active)*`;
  }

  if (text.includes("faint") || text.includes("unconscious") || text.includes("collapsed") || text.includes("passed out")) {
    return `😵 Fainting / Unresponsiveness:\n\n1. Lay the person flat on their back in a safe area.\n2. Raise their legs 12 inches (30 cm) to restore blood flow to the brain.\n3. Loosen restrictive clothing around collar and waist.\n4. Verify breathing and airway clearance.\n5. If unresponsive for over 1 minute, call emergency services immediately.\n\n*(Offline Triage Mode active)*`;
  }

  if (text.includes("fire") || text.includes("smoke") || text.includes("flame")) {
    return `🔥 Fire Emergency:\n\n1. Alert occupants and evacuate immediately via the nearest fire exit.\n2. Stay low under the smoke where air is clearer.\n3. Never use elevators during a fire.\n4. If clothes catch fire: STOP, DROP, and ROLL.\n5. Call emergency services once safe outside — do not re-enter.\n\n*(Offline Triage Mode active)*`;
  }

  if (text.includes("chok") || text.includes("airway") || text.includes("cannot breathe") || text.includes("cant breathe")) {
    return `🫁 Choking Emergency:\n\n1. Encourage forceful coughing if the person is conscious.\n2. Deliver 5 sharp back blows between shoulder blades with the heel of your hand.\n3. If blocked, perform 5 abdominal thrusts (Heimlich manoeuvre).\n4. Repeat cycles of 5 back blows and 5 abdominal thrusts.\n5. Call emergency services (911/112) immediately if obstruction persists.\n\n*(Offline Triage Mode active)*`;
  }

  if (text.includes("heart") || text.includes("chest pain") || text.includes("cardiac")) {
    return `❤️ Heart Attack / Cardiac Alert:\n\n1. CALL EMERGENCY SERVICES IMMEDIATELY (911 / 112 / 999).\n2. Sit the person comfortably on the floor with back supported.\n3. Loosen tight clothing around neck and chest.\n4. If conscious and not allergic, chew an adult aspirin (300 mg) slowly.\n5. Monitor continuously and prepare CPR if breathing ceases.\n\n*(Offline Triage Mode active)*`;
  }

  return `⚠️ Emergency First Aid Guidance:\n\n1. Assess immediate danger to yourself and the patient.\n2. Check for responsiveness and verify if the person is breathing.\n3. Call local emergency services immediately (911 / 112 / 999) for urgent threats.\n4. Keep the person calm, comfortable, and warm.\n5. Provide clear details of the injury for specific step-by-step triage guidance.`;
}
