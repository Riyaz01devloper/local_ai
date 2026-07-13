<<<<<<< HEAD
const { saveChat } = require("../models/chatmodels");
const chatModel = require("../models/chatmodels");
const handleChat = async (req, res) => {
  const { user_id, message, response } = req.body;

  try {
    await saveChat(user_id, message, response);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { handleChat };
=======
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
>>>>>>> 5c341e7d22136779ddcae3b01cc46072d1dd275d
