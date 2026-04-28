const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const { validateSignup, validateLogin } = require("../middleware/validator");

// Signup route
router.post("/signup", validateSignup, asyncHandler(authController.signup));

// Login route
router.post("/login", validateLogin, asyncHandler(authController.login));

// Get current user (protected route)
router.get("/me", authMiddleware, asyncHandler(authController.getCurrentUser));

module.exports = router;