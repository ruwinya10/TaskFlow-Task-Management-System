const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateStatus,
    assignTask
} = require("../controllers/taskController");

const router = express.Router();


// All task routes require authentication
router.use(protect);


// Create task
router.post("/", createTask);


// Get all permitted tasks
router.get("/", getTasks);


// Get single task
router.get("/:id", getTaskById);


// Update task
router.put("/:id", updateTask);


// Delete task
router.delete("/:id", deleteTask);


// Change task status
router.patch("/:id/status", updateStatus);


// Assign/reassign task
router.patch("/:id/assign", assignTask);


module.exports = router;