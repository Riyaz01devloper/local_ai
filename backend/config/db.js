const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // XAMPP default
  database: "ai_emergency",
});

const saveChat = (user_id, message, response) => {
  return db.promise().query(
    "INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)",
    [user_id, message, response]
  );
};
db.connect((err) => {
  if (err) {
    console.error("DB Error:", err);
  } else {
    console.log("MySQL Connected");
  }
});

module.exports = db;