

const express = require("express");
const cors = require("cors");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Running",
  });
});

// Error Handling Middleware
// 404 Not Found - Must come before error handler
app.use(notFoundHandler);

// Centralized Error Handler - Must come last
app.use(errorHandler);

module.exports = app;