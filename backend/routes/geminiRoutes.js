const express = require("express");
const router = express.Router();
const { getRuleResponse } = require("../services/ruleEngine");
const { generateEmergencyResponse } = require("../services/geminiService");

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // P1-1 fix: check rule engine FIRST; only call Gemini if no rule matched
    const ruleReply = getRuleResponse(message);

    if (ruleReply) {
      return res.json({
        success: true,
        source: "rule-engine",
        reply: ruleReply,
      });
    }

    // Fall through to Gemini only when no rule matched
    const reply = await generateEmergencyResponse(message);

    res.json({
      success: true,
      source: "gemini",
      reply,
    });
  } catch (err) {
    console.error("Gemini route error:", err.message || err);

    res.status(500).json({
      success: false,
      message: "Failed to generate response. Please try again.",
    });
  }
});

module.exports = router;