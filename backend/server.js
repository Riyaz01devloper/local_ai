const express = require("express");
const cors = require("cors");
const helmet =require("helmet");
const rateLimit = require("express-rate-limit");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
require("dotenv").config();

const chatRoutes = require("./routes/chatRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(cors({
  origin:process.env.FRONTEND_URL || " http://localhost:5173",
  methods:["GET", "POST"],
  allowedHeaders:["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ResQ AI API is running",
  });
});

// API Routes
app.use("/api/chat", chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
app.use(notFound);
app.use(errorHandler);
// Start Server
app.listen(PORT, () => {
  console.log(`ResQ AI server running on port ${PORT}`);
});