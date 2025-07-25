const express = require("express");
const router = express.Router();
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask
} = require("../controllers/calendarController");
const authenticate = require("../middlewares/authMiddleware");

// All routes require authentication
router.use(authenticate);

// Create a new task
router.post("/tasks", createTask);

// Get all tasks
router.get("/tasks", getTasks);

// Update a task
router.put("/tasks/:taskId", updateTask);

// Delete a task
router.delete("/tasks/:taskId", deleteTask);

module.exports = router;