const chatModel = require("../models/chatmodels");

exports.saveChat = async (req, res) => {
  try {
console.log("Incoming request:", req.body);

    const { user_id, message, response } = req.body;

    await chatModel.saveChat(user_id, message, response);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save chat" });
  }
};

exports.getChats = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await chatModel.getChats(user_id);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};