

const express = require("express");
const cors = require("cors");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// Allow requests from local development and deployed frontend domains.
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4173",
  "https://frontend-olive-six-47.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Mark database readiness in app locals
app.locals.dbReady = false;

// Readiness gate - return 503 if database is not ready
app.use((req, res, next) => {
  if (req.path === "/" || req.path === "/health") {
    return next();
  }

  if (!app.locals.dbReady) {
    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable",
      error: "Database is still connecting. Please retry in a moment.",
    });
  }

  next();
});

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

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Healthy",
    databaseReady: app.locals.dbReady,
  });
});

// Error Handling Middleware
// 404 Not Found - Must come before error handler
app.use(notFoundHandler);

// Centralized Error Handler - Must come last
app.use(errorHandler);

module.exports = app;