const chatModel = require("../models/chatmodels");

// Save chat
exports.saveChat = async (req, res) => {
  try {
    const { user_id, message, response } = req.body;

    // Basic validation
    if (!user_id || !message || !response) {
      return res.status(400).json({
        success: false,
        error: "user_id, message and response are required",
      });
    }

    await chatModel.saveChat(user_id, message, response);

    return res.status(201).json({
      success: true,
      message: "Chat saved successfully",
    });
  } catch (error) {
    console.error("Save chat error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to save chat",
    });
  }
};

// Get user's chat history
exports.getChats = async (req, res) => {
  try {
    const { user_id } = req.params;

    const rows = await chatModel.getChats(user_id);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Fetch chats error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch chats",
    });
  }
};