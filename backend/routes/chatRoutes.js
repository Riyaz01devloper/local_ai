const express = require("express");
<<<<<<< HEAD
const db = require("../config/db");
const router = express.Router();
const { handleChat } = require("../controllers/chatController");
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  const sql = "SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at ASC";

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});
router.post("/", handleChat);
=======
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/", chatController.saveChat);
router.get("/:user_id", chatController.getChats);
>>>>>>> 5c341e7d22136779ddcae3b01cc46072d1dd275d

module.exports = router;