const db = require("../config/db");

// Save chat message
const saveChat = async (user_id, message, response) => {
  const query = `
    INSERT INTO chat_history (user_id, message, response)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
const result = await db.query(query, [user_id,message,response]);
return result.rows[0];
};

// Get user's chat history — returns pg QueryResult so controller can read .rows
const getChats = async (user_id) => {
  const query = `
    SELECT *
    FROM chat_history
    WHERE user_id = $1
    ORDER BY created_at ASC
  `;

  return await db.query(query, [user_id]);
};
const deleteChats = async (user_id) => {
  const query = `
    DELETE FROM chat_history
    WHERE user_id = $1
  `;

  return await db.query(query, [user_id]);
};

module.exports = {
  saveChat,
  getChats,
  deleteChats
};