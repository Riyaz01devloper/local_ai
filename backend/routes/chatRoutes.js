const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");

// Save a new chat
router.post("/", chatController.saveChat);

// Get chat history by user ID
router.get("/:user_id", chatController.getChats);

// Clear chat history
router.delete("/:user_id", chatController.clearChatHistory);

module.exports = router;