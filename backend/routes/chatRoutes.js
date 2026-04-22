const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/", chatController.saveChat);
router.get("/:user_id", chatController.getChats);

module.exports = router;