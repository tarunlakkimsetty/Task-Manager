# Task Management System - Implementation Guide

## Overview
This is a complete multi-user Task Management system built with Express.js, Sequelize ORM, and PostgreSQL. It includes authentication with JWT and authorization checks to ensure users can only manage their own tasks.

## 🏗️ Architecture & Folder Structure

```
backend/
├── models/
│   ├── User.js                 (User model)
│   ├── Task.js                 (Task model)
│   └── associations.js         (User-Task relationships)
├── controllers/
│   └── taskController.js       (Business logic for tasks)
├── routes/
│   ├── authRoutes.js          (Auth endpoints)
│   └── taskRoutes.js          (Task endpoints)
├── middleware/
│   └── authMiddleware.js       (JWT authentication)
├── config/
│   └── db.js                   (Database connection)
├── server.js                   (Entry point)
├── app.js                      (Express app setup)
└── .env                        (Environment variables)
```

## 📋 Database Schema

### User Table
```sql
CREATE TABLE "Users" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### Task Table
```sql
CREATE TABLE "Tasks" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'completed') DEFAULT 'pending' NOT NULL,
  UserId INTEGER NOT NULL REFERENCES "Users" (id) ON DELETE CASCADE,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL
);
```

## 🔌 API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (protected)

### Task Management Endpoints (All Protected)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all tasks for logged-in user
- `GET /api/tasks/:id` - Get specific task (authorization check)
- `PUT /api/tasks/:id` - Update task (authorization check)
- `DELETE /api/tasks/:id` - Delete task (authorization check)
- `GET /api/tasks/stats/all` - Get task statistics

## 📝 Complete Code Files

### 1. models/Task.js
```javascript
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Task = sequelize.define("Task", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "completed"),
    defaultValue: "pending",
    allowNull: false,
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
});

module.exports = Task;
```

### 2. models/associations.js
```javascript
const User = require("./User");
const Task = require("./Task");

// Define relationships
User.hasMany(Task, {
  foreignKey: "UserId",
  onDelete: "CASCADE", // Delete tasks when user is deleted
});

Task.belongsTo(User, {
  foreignKey: "UserId",
});

module.exports = { User, Task };
```

### 3. controllers/taskController.js
```javascript
const Task = require("../models/Task");
const User = require("../models/User");

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      title,
      description: description || null,
      status: "pending",
      UserId: userId,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all tasks for logged-in user
exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.findAll({
      where: { UserId: userId },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      message: "Tasks retrieved successfully",
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get single task by ID (with authorization check)
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.UserId !== userId) {
      return res.status(403).json({ message: "Unauthorized: Task does not belong to you" });
    }

    res.json({
      message: "Task retrieved successfully",
      task,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update task status (only owner)
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user.id;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.UserId !== userId) {
      return res.status(403).json({ message: "Unauthorized: Can only update your own tasks" });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) {
      if (!["pending", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'pending' or 'completed'" });
      }
      task.status = status;
    }

    await task.save();

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete task (only owner)
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.UserId !== userId) {
      return res.status(403).json({ message: "Unauthorized: Can only delete your own tasks" });
    }

    await task.destroy();

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get task statistics for logged-in user
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.findAll({
      where: { UserId: userId },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const pendingTasks = tasks.filter((t) => t.status === "pending").length;

    res.json({
      message: "Task statistics retrieved successfully",
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionPercentage: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching task stats:", error);
    res.status(500).json({ error: error.message });
  }
};
```

### 4. routes/taskRoutes.js
```javascript
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

// All routes are protected - require authentication
router.use(authMiddleware);

router.post("/", taskController.createTask);
router.get("/", taskController.getUserTasks);
router.get("/stats/all", taskController.getTaskStats);
router.get("/:id", taskController.getTaskById);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
```

### 5. Updated app.js
```javascript
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

module.exports = app;
```

### 6. Updated server.js
```javascript
require('dotenv').config();

const app = require("./app");
const sequelize = require("./config/db");

// Load model associations
require("./models/associations");

const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(() => {
    console.log("Database connected ✅");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("DB Error:", err);
  });
```

## 🔐 Security Features

### Authorization Checks
- ✅ JWT authentication on all task routes
- ✅ Users can only see/edit/delete their own tasks
- ✅ 403 Unauthorized response when accessing others' tasks
- ✅ Cascade delete: Deleting user also deletes their tasks

### Input Validation
- ✅ Title is required
- ✅ Status must be "pending" or "completed"
- ✅ Proper error messages for validation failures

### Error Handling
- ✅ 404 for non-existent tasks
- ✅ 403 for unauthorized access
- ✅ 400 for invalid input
- ✅ 500 for server errors with error messages

## 📊 Test Results

### ✅ All Tests Passed

1. **Task Creation**
   - User can create tasks with title and optional description
   - Tasks default to "pending" status
   - UserId is automatically set from JWT token

2. **Retrieve Tasks**
   - GET /api/tasks returns only user's tasks (3 tests)
   - Tasks are ordered by creation time (newest first)

3. **Task Statistics**
   - Correctly counts total, pending, and completed tasks
   - Calculates completion percentage accurately

4. **Update Task**
   - Status can be changed from "pending" to "completed"
   - Updated timestamp reflects changes
   - Only owner can update task

5. **Delete Task**
   - Task is successfully deleted
   - Deleted tasks don't appear in task list
   - Only owner can delete task

6. **Authorization**
   - User 1 cannot access User 2's tasks
   - 403 Unauthorized response correctly returned
   - Multi-user isolation verified

## 🚀 Usage Examples

### Create a Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread"}'
```

### Get All Tasks
```bash
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Task Status
```bash
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

### Get Task Statistics
```bash
curl -X GET http://localhost:5000/api/tasks/stats/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete Task
```bash
curl -X DELETE http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Key Implementation Details

1. **Foreign Key Constraint**: UserId field references User model with ON DELETE CASCADE
2. **JWT Authorization**: req.user.id from JWT payload ensures multi-user isolation
3. **Sequelize Relationships**: 
   - User.hasMany(Task)
   - Task.belongsTo(User)
4. **Middleware Protection**: authMiddleware applied to all task routes
5. **Error Handling**: Comprehensive try-catch with meaningful error messages

## ✨ Features Implemented

- ✅ Multi-user support with complete data isolation
- ✅ CRUD operations for tasks
- ✅ Task status management (pending/completed)
- ✅ Task statistics and completion tracking
- ✅ Proper authorization checks
- ✅ Input validation
- ✅ Error handling
- ✅ Pagination ready (can add limit/offset)
- ✅ Timestamp tracking (createdAt, updatedAt)

## 🎯 Next Steps (Optional Enhancements)

- Add pagination to task list
- Add task filtering by status
- Add task search functionality
- Add task categories/tags
- Add task due dates
- Add task priority levels
- Add task comments
- Add task sharing between users
- Add rate limiting
- Add request logging
