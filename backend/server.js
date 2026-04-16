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

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://student-dashboard-eight-delta.vercel.app"
];

if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL.split(",").map(url => url.trim()).forEach(url => {
        if (url && !allowedOrigins.includes(url)) {
            allowedOrigins.push(url);
        }
    });
}

console.log("Allowed Origins:", allowedOrigins);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("Origin rejected:", origin);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
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
