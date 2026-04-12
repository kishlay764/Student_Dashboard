const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const port = process.env.PORT || 5000;

// Production Middleware
app.use(helmet({
    contentSecurityPolicy: false, // For ease of use with external assets in demo
}));
app.use(morgan("dev"));

// Middleware
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));


app.use(express.json());

// MongoDB connect
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("MERN MongoDB Connected Successfully");
    } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        // Don't exit process in development, but log clearly
        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
    }
};

connectDB();

// Return a clear API error when DB is unavailable instead of generic route failures.
app.use("/api", (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "Database is not connected. Start MongoDB or set a valid MONGO_URI."
        });
    }
    return next();
});

// Health Check
app.get("/", (req, res) => {
    res.json({ message: "Student Dashboard API is running." });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/analytics", require("./routes/analytics"));

// Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/build")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
    });
} else {
    // 404 Handler for development (since React Dev Server handles frontend)
    app.use((req, res, next) => {
        res.status(404).json({ message: "Route not found" });
    });
}

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Something went wrong on the server",
        error: process.env.NODE_ENV === "production" ? {} : err
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
