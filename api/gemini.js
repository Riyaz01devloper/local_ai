let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
} catch (e) {
  try {
    GoogleGenerativeAI = require("../backend/node_modules/@google/generative-ai").GoogleGenerativeAI;
  } catch (e2) {
    try {
      GoogleGenerativeAI = require("./backend/node_modules/@google/generative-ai").GoogleGenerativeAI;
    } catch (e3) {
      GoogleGenerativeAI = null;
    }
  }
}

// Emergency keyword rules for immediate, zero-latency first aid triage
const rules = [
  {
    keywords: ["burn", "burned", "burnt", "scald"],
    response: `🔥 Burn First Aid:\n\n1. Cool the burn under cool running water for at least 20 minutes immediately.\n2. Gently remove rings, watches, or tight clothing before swelling begins.\n3. Cover with a sterile non-stick dressing, clean cloth, or plastic cling film.\n4. Do NOT apply ice, cold water packs, butter, oil, or toothpaste.\n5. Seek urgent medical attention if the burn is larger than the palm or affects face, hands, or joints.`,
  },
  {
    keywords: ["bleed", "bleeding", "blood", "cut", "wound", "laceration"],
    response: `🩸 Bleeding Control:\n\n1. Apply firm, continuous direct pressure with a clean cloth or bandage.\n2. Keep pressure sustained — do NOT remove the pad to check the wound.\n3. Elevate the injured area above the heart if possible and no fracture is suspected.\n4. If blood soaks through, add another clean cloth directly on top.\n5. Call emergency services immediately (911/112) for arterial or uncontrolled bleeding.`,
  },
  {
    keywords: ["faint", "fainted", "unconscious", "passed out", "collapsed", "blackout"],
    response: `😵 Fainting / Unresponsiveness:\n\n1. Lay the person flat on their back in a safe area.\n2. Raise their legs approximately 12 inches (30 cm) to restore blood flow to the brain.\n3. Loosen restrictive clothing around their collar, neck, and waist.\n4. Check their airway and confirm they are breathing normally.\n5. If unresponsive for over 1 minute or not breathing normally, call emergency services immediately.`,
  },
  {
    keywords: ["chok", "choking", "can't breathe", "cannot breathe", "airway"],
    response: `🫁 Choking Emergency:\n\n1. Encourage the person to cough forcefully if they are conscious.\n2. Deliver 5 sharp back blows between the shoulder blades using the heel of your hand.\n3. If obstruction persists, perform 5 abdominal thrusts (Heimlich manoeuvre).\n4. Repeat cycles of 5 back blows and 5 abdominal thrusts.\n5. Call emergency services (911/112) immediately if the obstruction does not clear.`,
  },
  {
    keywords: ["chest pain", "heart attack", "cardiac", "angina"],
    response: `❤️ Suspected Heart Attack:\n\n1. CALL EMERGENCY SERVICES IMMEDIATELY (911 / 112 / 999).\n2. Sit the person comfortably on the floor with back supported and knees bent.\n3. Loosen tight collar, tie, and belt to ease breathing.\n4. If conscious and not allergic, have them slowly chew an adult aspirin (300 mg).\n5. Keep them calm and prepare to begin CPR if they become unresponsive.`,
  },
  {
    keywords: ["cpr", "not breathing", "stopped breathing", "cardiac arrest"],
    response: `🫀 Adult CPR (Chest Compressions):\n\n1. Call emergency services immediately (911 / 112) and get an AED if available.\n2. Place the heel of one hand in the center of the chest; place other hand on top.\n3. Push hard and fast: 100–120 compressions per minute, 2 inches (5 cm) deep.\n4. Allow full chest recoil between compressions.\n5. Continue continuous compressions until professional paramedics take over.`,
  },
  {
    keywords: ["fire", "smoke", "flame", "burning"],
    response: `🔥 Fire Emergency:\n\n1. Alert occupants and evacuate immediately via the nearest fire exit.\n2. Stay low to the floor beneath smoke where oxygen levels are higher.\n3. Never use elevators during a fire evacuation.\n4. If clothing catches fire: STOP, DROP, and ROLL to extinguish flames.\n5. Call emergency services once safe outside — do NOT re-enter the building.`,
  },
  {
    keywords: ["electric", "electrocution", "shock", "live wire"],
    response: `⚡ Electrical Shock Emergency:\n\n1. Do NOT touch the person if they may still be in contact with the electrical current.\n2. Immediately turn off the main circuit breaker or unplug the power source.\n3. If power cannot be turned off, use a dry, non-conductive object (wooden broom) to separate them.\n4. Call emergency services (911/112) immediately.\n5. Check breathing and pulse once separated; begin CPR if necessary.`,
  },
  {
    keywords: ["poison", "poisoning", "swallowed chemical", "overdose", "toxic"],
    response: `☠️ Poisoning Emergency:\n\n1. Call your regional Poison Control Center or emergency services immediately.\n2. Do NOT induce vomiting or administer fluids unless instructed by medical professionals.\n3. Identify the chemical, container, dosage, and time of ingestion if safe.\n4. If exposed on skin or eyes, flush continuously with clean water for 15 minutes.\n5. Keep the patient still and monitor breathing closely until help arrives.`,
  },
  {
    keywords: ["fracture", "broken bone", "sprain", "dislocated"],
    response: `🦴 Bone Fracture / Sprain:\n\n1. Keep the injured limb completely still and supported in the position found.\n2. Do NOT attempt to straighten or realign a misshapen limb.\n3. Apply a cold pack wrapped in a cloth to reduce swelling (max 15 mins).\n4. If skin is broken, cover with a sterile cloth without applying pressure directly to bone.\n5. Seek professional emergency medical care immediately.`,
  },
  {
    keywords: ["stroke", "face drooping", "arm weakness", "slurred speech"],
    response: `🧠 Suspected Stroke (FAST Protocol):\n\n1. CALL EMERGENCY SERVICES IMMEDIATELY (911 / 112).\n2. Face: Check if one side of the face droops when smiling.\n3. Arms: Check if one arm drifts downward when both are raised.\n4. Speech: Check if speech is slurred or strange.\n5. Time: Note the exact time symptoms started and do NOT give food, drink, or medication.`,
  },
];

function getRuleResponse(message) {
  const input = message.toLowerCase();
  for (const rule of rules) {
    if (rule.keywords.some((word) => input.includes(word))) {
      return rule.response;
    }
  }
  return null;
}

async function callGeminiWithFallback(genAI, prompt) {
  // Candidate models to handle diverse Gemini API tiers
  const models = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-pro"
  ];

  let lastError = null;
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 250,
          temperature: 0.2,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (text && text.trim()) {
        return { text: text.trim(), model: modelName };
      }
    } catch (err) {
      lastError = err;
      // Continue to next model candidate
    }
  }

  throw lastError || new Error("Failed to generate content with available Gemini models");
}

module.exports = async function handler(req, res) {
  // CORS Configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed. Send POST request.",
    });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const message = body?.message;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Step 1: Rule Engine (Immediate zero-latency triage)
    const ruleReply = getRuleResponse(message);
    if (ruleReply) {
      return res.status(200).json({
        success: true,
        source: "rule-engine",
        reply: ruleReply,
      });
    }

    // Step 2: Google Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !GoogleGenerativeAI) {
      return res.status(200).json({
        success: true,
        source: "emergency-triage",
        reply: `⚠️ Immediate Safety Guidance:\n\n1. Ensure the immediate scene is completely safe before approaching.\n2. Check for responsiveness and verify if the person is breathing.\n3. Call local emergency services immediately (911 / 112 / 999) if severe.\n4. Keep the person calm, warm, and comfortable. Do not move them if spinal injury is suspected.\n\n(Note: Add GEMINI_API_KEY to your Vercel Project Settings for live AI generative responses.)`,
      });
    }

    const prompt = `You are ResQ AI, an emergency first-aid triage assistant.

CRITICAL RULES:
- Provide maximum 5 clear, numbered, high-priority emergency action steps.
- Keep the response concise (under 80 words).
- Focus on immediate physical actions (airway, breathing, bleeding control, recovery posture).
- Do NOT provide speculative medical diagnoses or prescriptions.
- If the situation is life-threatening, state "Call local emergency services immediately (911/112)." as step 1.

Emergency Situation: ${message.trim()}`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const { text, model } = await callGeminiWithFallback(genAI, prompt);

      return res.status(200).json({
        success: true,
        source: `gemini (${model})`,
        reply: text,
      });
    } catch (apiErr) {
      console.warn("Gemini call failed, providing emergency safety triage fallback:", apiErr.message);
      return res.status(200).json({
        success: true,
        source: "emergency-triage-fallback",
        reply: `⚠️ Immediate Safety Guidance:\n\n1. Ensure the scene is safe before assisting.\n2. Call local emergency services immediately (911 / 112 / 999) if there is any serious danger.\n3. Check breathing and consciousness.\n4. Keep the person warm, still, and supported.\n5. Await emergency medical personnel.`,
      });
    }
  } catch (err) {
    console.error("Gemini API Error:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "Emergency service temporary processing error.",
      error: err.message,
    });
  }
};
