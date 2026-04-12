const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/spfms", {
    serverSelectionTimeoutMS: 5000
})
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.error("MongoDB Connection Error:", err));

// Return a clear API error when DB is unavailable instead of generic route failures.
app.use("/api", (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "Database is not connected. Start MongoDB or set a valid MONGO_URI."
        });
    }
    return next();
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
