const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet({
    contentSecurityPolicy: false, 
}));
app.use(morgan("dev"));

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true
}));

app.use(express.json());

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/student_dashboard";
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("MERN MongoDB Connected Successfully");
    } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
    }
};

connectDB();

app.use("/api", (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "Database is not connected. Start MongoDB or set a valid MONGO_URI."
        });
    }
    return next();
});

app.get("/", (req, res) => {
    res.json({ message: "Student Dashboard API is running." });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/analytics", require("./routes/analytics"));

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/build")));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
    });
} else {
    app.use((req, res, next) => {
        res.status(404).json({ message: "Route not found" });
    });
}

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
