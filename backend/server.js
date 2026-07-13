const express = require("express");
const cors = require("cors");
require("dotenv").config();

<<<<<<< HEAD
=======
const chatRoutes = require("./routes/chatRoutes");

>>>>>>> 5c341e7d22136779ddcae3b01cc46072d1dd275d
const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
const chatRoutes = require("./routes/chatRoutes");

app.use("/api/chat", chatRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
=======
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
>>>>>>> 5c341e7d22136779ddcae3b01cc46072d1dd275d
});