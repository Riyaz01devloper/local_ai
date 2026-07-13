const express = require("express");
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

module.exports = router;