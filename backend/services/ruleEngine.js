const rules = [
  {
    keywords: ["burn", "burned", "burnt"],
    response: `🔥 Burn First Aid

1. Cool the burn under cool running water for 20 minutes.
2. Remove rings or tight clothing.
3. Cover with a clean non-stick dressing.
4. Do not apply ice, toothpaste, or butter.
5. Seek medical help if the burn is severe.`,
  },
  {
    keywords: ["bleeding", "blood", "cut"],
    response: `🩸 Bleeding First Aid

1. Apply firm pressure with a clean cloth.
2. Raise the injured area if possible.
3. Keep pressure until bleeding stops.
4. If bleeding is severe, call emergency services immediately.`,
  },
  {
    keywords: ["faint", "unconscious"],
    response: `😵 Fainting

1. Lay the person flat.
2. Raise the legs slightly.
3. Loosen tight clothing.
4. If unconscious for more than 1 minute, call emergency services.`,
  },
];

function getRuleResponse(message) {
  const input = message.toLowerCase();

  for (const rule of rules) {
    if (rule.keywords.some(word => input.includes(word))) {
      return rule.response;
    }
  }

  return null;
}

module.exports = {
  getRuleResponse,
};