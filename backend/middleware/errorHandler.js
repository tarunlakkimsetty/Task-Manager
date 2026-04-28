/**
 * Centralized Error Handler Middleware
 * Handles:
 * - Validation errors
 * - Sequelize errors
 * - JWT errors
 * - Custom errors
 * - Generic server errors
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Sequelize Validation Error
  if (err.name === "SequelizeValidationError") {
    const message = err.errors.map((e) => e.message).join(", ");
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: message,
    });
  }

  // Sequelize Unique Constraint Error
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = Object.keys(err.fields)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      error: `This ${field} is already registered`,
    });
  }

  // Sequelize Foreign Key Error
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Invalid reference",
      error: "The referenced record does not exist",
    });
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: "The token is invalid or malformed",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      error: "Please login again",
    });
  }

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Validation Error (from express-validator)
  if (err.statusCode === 400 && err.message === "Validation error") {
    return res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Generic Server Error
  console.error("Server Error:", err);
  return res.status(err.statusCode).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
};

// 404 Not Found Handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
};
