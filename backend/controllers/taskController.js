const Task = require("../models/Task");
const { AppError } = require("../middleware/errorHandler");

/**
 * Create a new task
 * @route POST /api/tasks
 * @param {string} title - Task title (required)
 * @param {string} description - Task description (optional)
 * @returns {object} - Created task
 */
exports.createTask = async (req, res, next) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  const task = await Task.create({
    title,
    description: description || null,
    status: "pending",
    UserId: userId,
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    task,
  });
};

/**
 * Get all tasks for logged-in user
 * @route GET /api/tasks
 * @returns {array} - Array of user's tasks
 */
exports.getUserTasks = async (req, res, next) => {
  const userId = req.user.id;

  const tasks = await Task.findAll({
    where: { UserId: userId },
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    success: true,
    message: "Tasks retrieved successfully",
    count: tasks.length,
    tasks,
  });
};

/**
 * Get single task by ID
 * @route GET /api/tasks/:id
 * @param {number} id - Task ID
 * @returns {object} - Task details
 */
exports.getTaskById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const task = await Task.findByPk(id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // Authorization check
  if (task.UserId !== userId) {
    throw new AppError("Unauthorized: Task does not belong to you", 403);
  }

  res.status(200).json({
    success: true,
    message: "Task retrieved successfully",
    task,
  });
};

/**
 * Update task
 * @route PUT /api/tasks/:id
 * @param {number} id - Task ID
 * @param {string} title - New title (optional)
 * @param {string} description - New description (optional)
 * @param {string} status - New status (optional)
 * @returns {object} - Updated task
 */
exports.updateTask = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const userId = req.user.id;

  const task = await Task.findByPk(id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // Authorization check
  if (task.UserId !== userId) {
    throw new AppError("Unauthorized: Can only update your own tasks", 403);
  }

  // Update fields if provided
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;

  await task.save();

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    task,
  });
};

/**
 * Delete task
 * @route DELETE /api/tasks/:id
 * @param {number} id - Task ID
 * @returns {object} - Success message
 */
exports.deleteTask = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const task = await Task.findByPk(id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // Authorization check
  if (task.UserId !== userId) {
    throw new AppError("Unauthorized: Can only delete your own tasks", 403);
  }

  await task.destroy();

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
};

/**
 * Get task statistics
 * @route GET /api/tasks/stats/all
 * @returns {object} - Task statistics
 */
exports.getTaskStats = async (req, res, next) => {
  const userId = req.user.id;

  const tasks = await Task.findAll({
    where: { UserId: userId },
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;

  res.status(200).json({
    success: true,
    message: "Task statistics retrieved successfully",
    stats: {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionPercentage:
        totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
    },
  });
};
