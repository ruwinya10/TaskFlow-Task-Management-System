const User = require("../models/User");
const Task = require("../models/Task");


// ========================
// GET ALL USERS
// ========================
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.json(users);

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Failed to get users"
        });
    }
};


// ========================
// GET USER BY ID
// ========================
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get user"
        });
    }
};


// ========================
// DELETE USER
// ========================
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Don't allow deleting an admin
        if (user.role === "admin") {
            return res.status(400).json({
                message: "Admin users cannot be deleted"
            });
        }

        // Unassign tasks belonging to this user
        await Task.updateMany(
            { assignedUser: user._id },
            { assignedUser: null }
        );

        await user.deleteOne();

        res.json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete user error:", error);

        res.status(500).json({
            message: "Failed to delete user"
        });
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    deleteUser
};