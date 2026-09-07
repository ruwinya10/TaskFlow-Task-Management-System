const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

const {
    notFound,
    errorHandler
} = require("./middleware/errorMiddleware");


dotenv.config();


// ========================
// DATABASE
// ========================

connectDB();


// ========================
// EXPRESS
// ========================

const app = express();


// ========================
// MIDDLEWARE
// ========================

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173"
    })
);

app.use(express.json());


// ========================
// BASIC ROUTE
// ========================

app.get("/", (req, res) => {
    res.json({
        message: "Less Taxi Backend API is running!"
    });
});


// ========================
// API ROUTES
// ========================

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/users", userRoutes);


// ========================
// ERROR HANDLING
// ========================

app.use(notFound);

app.use(errorHandler);


// ========================
// SERVER
// ========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});