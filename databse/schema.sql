CREATE DATABASE IF NOT EXISTS ai_emergency;
USE ai_emergency;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  message TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE emergency_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  type VARCHAR(50),
  severity VARCHAR(20),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);