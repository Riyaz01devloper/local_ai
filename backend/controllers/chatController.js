const chatModel = require("../models/chatmodel");

exports.saveChat = async (req, res) => {
  try {
    const { user_id, message, response } = req.body;

    await chatModel.saveChat(user_id, message, response);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("Save chat error:", err);

    res.status(500).json({
      error: "Failed to save chat",
    });
  }
};

exports.getChats = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await chatModel.getChats(user_id);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("Get chats error:", err);

    res.status(500).json({
      error: "Failed to fetch chats",
    });
  }
};

exports.clearChatHistory = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    await chatModel.deleteChats(user_id);

    res.status(200).json({
      success: true,
      message: "Chat history cleared successfully",
    });
  } catch (err) {
    console.error("Clear chat error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to clear chat history",
    });
  }
};