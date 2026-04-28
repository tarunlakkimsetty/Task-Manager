const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");
const asyncHandler = require("../utils/asyncHandler");
const { validateTask } = require("../middleware/validator");

// All routes are protected - require authentication
router.use(authMiddleware);

// Create task
router.post("/", validateTask, asyncHandler(taskController.createTask));

// Get all tasks for user
router.get("/", asyncHandler(taskController.getUserTasks));

// Get task statistics
router.get("/stats/all", asyncHandler(taskController.getTaskStats));

// Get single task
router.get("/:id", asyncHandler(taskController.getTaskById));

// Update task
router.put("/:id", validateTask, asyncHandler(taskController.updateTask));

// Delete task
router.delete("/:id", asyncHandler(taskController.deleteTask));

module.exports = router;
