const db = require("../config/db");

const saveChat = (user_id, message, response) => {
  const sql = "INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)";
  return db.promise().query(sql, [user_id, message, response]);
};

const getChats = (user_id) => {
<<<<<<< HEAD
  const sql = "SELECT * FROM chat_history WHERE user_id = ?";
=======
  const sql = "SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at ASC";
>>>>>>> 5c341e7d22136779ddcae3b01cc46072d1dd275d
  return db.promise().query(sql, [user_id]);
};

module.exports = { saveChat, getChats };