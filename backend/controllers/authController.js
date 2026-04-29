const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");

/**
 * User Signup
 * @route POST /api/auth/signup
 * @param {string} username - User's username
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {object} - Success message
 */
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists with timeout
    let existingUser;
    try {
      existingUser = await Promise.race([
        User.findOne({ where: { email } }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database query timeout")), 5000)
        ),
      ]);
    } catch (dbError) {
      throw new AppError("Database service unavailable. Please try again later.", 503);
    }

    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with timeout
    let user;
    try {
      user = await Promise.race([
        User.create({
          username,
          email,
          password: hashedPassword,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database query timeout")), 5000)
        ),
      ]);
    } catch (dbError) {
      throw new AppError("Database service unavailable. Please try again later.", 503);
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Login
 * @route POST /api/auth/login
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {object} - JWT token and user data
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with timeout
    let user;
    try {
      user = await Promise.race([
        User.findOne({ where: { email } }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database query timeout")), 5000)
        ),
      ]);
    } catch (dbError) {
      throw new AppError("Database service unavailable. Please try again later.", 503);
    }

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid password", 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User
 * @route GET /api/auth/me
 * @returns {object} - Current user data
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    let user;
    try {
      user = await Promise.race([
        User.findByPk(req.user.id, {
          attributes: { exclude: ["password"] },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database query timeout")), 5000)
        ),
      ]);
    } catch (dbError) {
      throw new AppError("Database service unavailable. Please try again later.", 503);
    }

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
