const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");

const {
    getAllUsers,
    getUserById,
    deleteUser
} = require("../controllers/userController");

const router = express.Router();


// Every user route requires login
router.use(protect);


// Only administrators can access these
router.use(adminOnly);


router.get("/", getAllUsers);

router.get("/:id", getUserById);

router.delete("/:id", deleteUser);


module.exports = router;