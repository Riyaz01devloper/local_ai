/**
 * EmergencyView — static first-aid guidance panel.
 *
 * Provides immediate, categorized emergency guidance that works
 * completely offline without requiring an AI model.
 * Clearly labeled as first-aid guidance, not a substitute for
 * professional emergency services.
 */

const EMERGENCY_TOPICS = [
  {
    id: "burn",
    icon: "🔥",
    title: "Burns",
    shortDesc: "Heat, chemical, or electrical burns",
    steps: [
      "Cool the burn under cool (not cold) running water for at least 20 minutes.",
      "Remove rings, watches, or tight clothing near the burn.",
      "Cover with a clean, non-fluffy dressing or cling film.",
      "Do NOT apply ice, butter, toothpaste, or any cream.",
      "Seek medical help for burns larger than the palm of the hand, or any burn on face, hands, feet, or genitals.",
    ],
    callIfSevere: true,
  },
  {
    id: "bleeding",
    icon: "🩸",
    title: "Severe Bleeding",
    shortDesc: "Cuts, wounds, uncontrolled bleeding",
    steps: [
      "Apply firm, direct pressure with a clean cloth or bandage.",
      "Raise the injured limb above heart level if possible.",
      "Keep pressure on until bleeding stops — do not lift the cloth to check.",
      "If blood soaks through, add more layers on top (do not remove the first).",
      "Call emergency services immediately for uncontrolled or arterial bleeding.",
    ],
    callIfSevere: true,
  },
  {
    id: "fainting",
    icon: "😵",
    title: "Fainting / Unconsciousness",
    shortDesc: "Person collapsed or unresponsive",
    steps: [
      "Lay the person flat on their back.",
      "Raise their legs slightly (about 30 cm / 12 inches) if no injury prevents this.",
      "Loosen any tight clothing around the neck and waist.",
      "Check for breathing and pulse.",
      "If unconscious for more than 1 minute or not breathing normally, call emergency services immediately.",
    ],
    callIfSevere: true,
  },
  {
    id: "choking",
    icon: "🫁",
    title: "Choking",
    shortDesc: "Airway obstruction in adults",
    steps: [
      "Encourage the person to cough forcefully if they can.",
      "If coughing does not clear it, give up to 5 firm back blows between the shoulder blades.",
      "If back blows do not work, perform up to 5 abdominal thrusts (Heimlich manoeuvre).",
      "Alternate between 5 back blows and 5 abdominal thrusts.",
      "Call emergency services if the obstruction is not cleared after several cycles.",
    ],
    callIfSevere: true,
  },
  {
    id: "heartattack",
    icon: "❤️",
    title: "Heart Attack",
    shortDesc: "Chest pain, pressure, or tightness",
    steps: [
      "Call emergency services (e.g. 911 / 999 / 112) IMMEDIATELY.",
      "Help the person sit or lie in a comfortable position — typically sitting with knees bent.",
      "Loosen tight clothing.",
      "If the person is conscious and not allergic, give one adult aspirin (300 mg) to chew slowly.",
      "If the person becomes unresponsive and stops breathing normally, begin CPR.",
    ],
    callIfSevere: true,
  },
  {
    id: "cpr",
    icon: "🫀",
    title: "CPR (Adult)",
    shortDesc: "Unresponsive, not breathing normally",
    steps: [
      "Call emergency services immediately before starting CPR.",
      "Place the heel of your hand on the centre of the person's chest.",
      "Push down hard and fast — at least 5 cm (2 inches), at a rate of 100–120 compressions per minute.",
      "Allow the chest to fully recoil between compressions.",
      "If trained, give 2 rescue breaths after every 30 compressions. If untrained, do continuous chest compressions only.",
    ],
    callIfSevere: true,
  },
  {
    id: "fire",
    icon: "🔥",
    title: "Fire",
    shortDesc: "Building fire or smoke inhalation",
    steps: [
      "Alert everyone in the building and activate the fire alarm.",
      "Call emergency services immediately.",
      "Evacuate via the nearest safe exit — do NOT use lifts.",
      "Stay low to avoid smoke — crawl if necessary.",
      "If trapped: close doors to slow the fire and signal from a window.",
    ],
    callIfSevere: true,
  },
  {
    id: "fracture",
    icon: "🦴",
    title: "Fractures & Sprains",
    shortDesc: "Suspected broken bone or joint injury",
    steps: [
      "Keep the injured area as still as possible.",
      "Support the injury above and below the suspected break.",
      "Apply ice wrapped in a cloth to reduce swelling — do NOT apply ice directly to skin.",
      "Do not try to straighten or realign the bone.",
      "Seek medical care promptly; call emergency services if it is a serious fracture or involves the spine or neck.",
    ],
    callIfSevere: false,
  },
];

import { useState } from "react";

function EmergencyView({ onAskAI }) {
  const [selected, setSelected] = useState(null);

  const topic = EMERGENCY_TOPICS.find(t => t.id === selected);

  return (
    <div className="page-view">
      <div className="emergency-view">
        {/* Header alert */}
        <div className="emergency-alert-bar">
          <span style={{ fontSize: 20, flexShrink: 0 }}>🚨</span>
          <span>
            <strong>For life-threatening emergencies, call your local emergency services first (e.g. 911 / 999 / 112).</strong>{" "}
            The guidance below is first-aid information only and is not a substitute for professional medical care.
          </span>
        </div>

        {selected && topic ? (
          <>
            <button
              onClick={() => setSelected(null)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, color: "var(--text-secondary)",
                background: "none", border: "none", cursor: "pointer", padding: 0,
              }}
            >
              ← Back to all topics
            </button>
            <div className="emergency-response-box">
              <div className="emergency-response-header">
                <span>{topic.icon}</span>
                <span>{topic.title}</span>
              </div>
              <p className="emergency-response-content">
                {topic.steps.map((step, i) => (
                  <span key={i} style={{ display: "block", marginBottom: 10 }}>
                    <strong style={{ color: "var(--text-primary)" }}>{i + 1}.</strong> {step}
                  </span>
                ))}
              </p>
              {topic.callIfSevere && (
                <div className="emergency-ai-disclaimer">
                  ⚠️ This is general first-aid guidance. Seek professional medical attention immediately for severe cases.
                </div>
              )}
            </div>
            {onAskAI && (
              <button
                className="btn-primary"
                style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8 }}
                onClick={() => onAskAI(`Tell me about first aid for: ${topic.title}`)}
              >
                💬 Ask AI for more detail
              </button>
            )}
          </>
        ) : (
          <>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
                Emergency First-Aid Guide
              </h2>
              <div className="emergency-grid">
                {EMERGENCY_TOPICS.map(t => (
                  <button
                    key={t.id}
                    className="emergency-card"
                    onClick={() => setSelected(t.id)}
                    aria-label={`Open first-aid guide for ${t.title}`}
                  >
                    <span className="emergency-card-icon">{t.icon}</span>
                    <span className="emergency-card-title">{t.title}</span>
                    <span className="emergency-card-desc">{t.shortDesc}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Disclaimer footer */}
        <p className="emergency-disclaimer">
          ResQ AI provides general first-aid information. This does not replace professional medical advice,
          diagnosis, or treatment. Always contact local emergency services for serious or life-threatening situations.
        </p>
      </div>
    </div>
  );
}

export default EmergencyView;

