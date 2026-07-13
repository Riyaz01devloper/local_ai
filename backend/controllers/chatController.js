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