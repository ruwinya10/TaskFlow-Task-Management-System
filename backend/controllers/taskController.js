const Task = require("../models/Task");
const User = require("../models/User");


const canManageTask = (task, userId) => {
    const isCreator = task.creator.toString() === userId;
    const assignedId = task.assignedUser
        ? task.assignedUser.toString()
        : null;

    return isCreator && (!assignedId || assignedId === userId);
};


const canChangeTaskStatus = (task, userId) => {
    const assignedId = task.assignedUser
        ? task.assignedUser.toString()
        : null;

    if (assignedId) {
        return assignedId === userId;
    }

    return task.creator.toString() === userId;
};


// ========================
// CREATE TASK
// ========================
const createTask = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const task = await Task.create({
            title,
            description: description || "",
            status: "todo",
            creator: req.user.id,
            assignedUser: null
        });

        const populatedTask = await Task.findById(task._id)
            .populate("creator", "name email")
            .populate("assignedUser", "name email");

        res.status(201).json(populatedTask);

    } catch (error) {
        console.error("Create task error:", error);

        res.status(500).json({
            message: "Failed to create task"
        });
    }
};


// ========================
// GET TASKS
// ========================
const getTasks = async (req, res) => {
    try {
        let tasks;

        if (req.user.role === "admin") {

            // Admin sees every task
            tasks = await Task.find()
                .populate("creator", "name email")
                .populate("assignedUser", "name email")
                .sort({ createdAt: -1 });

        } else {

            // Normal user sees only tasks they created
            // or tasks assigned to them
            tasks = await Task.find({
                $or: [
                    { creator: req.user.id },
                    { assignedUser: req.user.id }
                ]
            })
                .populate("creator", "name email")
                .populate("assignedUser", "name email")
                .sort({ createdAt: -1 });
        }

        res.json(tasks);

    } catch (error) {
        console.error("Get tasks error:", error);

        res.status(500).json({
            message: "Failed to get tasks"
        });
    }
};


// ========================
// GET SINGLE TASK
// ========================
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate("creator", "name email")
            .populate("assignedUser", "name email");

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Admin can access every task
        if (req.user.role === "admin") {
            return res.json(task);
        }

        // Normal user can access own/assigned tasks
        const creatorId = task.creator._id.toString();

        const assignedId = task.assignedUser
            ? task.assignedUser._id.toString()
            : null;

        if (
            creatorId !== req.user.id &&
            assignedId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You do not have permission to view this task"
            });
        }

        res.json(task);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get task"
        });
    }
};


// ========================
// UPDATE TASK
// ========================
const updateTask = async (req, res) => {
    try {
        const { title, description } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Admin can update any task
        if (
            req.user.role !== "admin" &&
            !canManageTask(task, req.user.id)
        ) {
            return res.status(403).json({
                message: "You can only manage your own unassigned or self-assigned tasks"
            });
        }

        if (title !== undefined) {
            task.title = title;
        }

        if (description !== undefined) {
            task.description = description;
        }

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("creator", "name email")
            .populate("assignedUser", "name email");

        res.json(updatedTask);

    } catch (error) {
        console.error("Update task error:", error);

        res.status(500).json({
            message: "Failed to update task"
        });
    }
};


// ========================
// DELETE TASK
// ========================
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Admin can delete any task
        if (
            req.user.role !== "admin" &&
            !canManageTask(task, req.user.id)
        ) {
            return res.status(403).json({
                message: "You can only delete your own unassigned or self-assigned tasks"
            });
        }

        await task.deleteOne();

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete task"
        });
    }
};


// ========================
// UPDATE STATUS
// ========================
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = [
            "todo",
            "doing",
            "done"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Admin can change any task
        if (
            req.user.role !== "admin" &&
            !canChangeTaskStatus(task, req.user.id)
        ) {
            return res.status(403).json({
                message: "You do not have permission to change this task status"
            });
        }

        task.status = status;

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("creator", "name email")
            .populate("assignedUser", "name email");

        res.json(updatedTask);

    } catch (error) {
        console.error("Status update error:", error);

        res.status(500).json({
            message: "Failed to update status"
        });
    }
};


// ========================
// ASSIGN TASK
// ========================
const assignTask = async (req, res) => {
    try {
        const { userId } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }


        // ============================
        // ADMIN
        // ============================
        if (req.user.role === "admin") {

            if (!userId) {
                // Admin can also unassign
                task.assignedUser = null;

                await task.save();

                return res.json({
                    message: "Task unassigned successfully",
                    task
                });
            }

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            task.assignedUser = user._id;

            await task.save();

            const updatedTask = await Task.findById(task._id)
                .populate("creator", "name email")
                .populate("assignedUser", "name email");

            return res.json(updatedTask);
        }


        // ============================
        // NORMAL USER
        // ============================

        // User can only assign an unassigned task
        // to themselves.
        if (task.assignedUser) {
            return res.status(403).json({
                message: "This task is already assigned"
            });
        }

        if (userId !== req.user.id) {
            return res.status(403).json({
                message: "You can only assign a task to yourself"
            });
        }

        task.assignedUser = req.user.id;

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("creator", "name email")
            .populate("assignedUser", "name email");

        res.json(updatedTask);

    } catch (error) {
        console.error("Assign task error:", error);

        res.status(500).json({
            message: "Failed to assign task"
        });
    }
};


module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateStatus,
    assignTask
};