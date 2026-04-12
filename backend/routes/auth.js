const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

const SECRET = process.env.JWT_SECRET || "mysecretkey";

// SIGNUP
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already in use" });

        const hashed = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashed,
            exp: 0,
            level: 1,
            streak: 0,
            lastLogin: new Date(),
            badges: [],
            productivityScore: 0
        });
        await user.save();

        res.json({ message: "User Created Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Wrong password" });

        // Update Streak Logic
        const now = new Date();
        const lastLogin = new Date(user.lastLogin);
        const diffInTime = now.getTime() - lastLogin.getTime();
        const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

        if (diffInDays === 1) {
            // Logged in yesterday
            user.streak += 1;
        } else if (diffInDays > 1) {
            // Missed a day
            user.streak = 1;
        } else if (user.streak === 0) {
            // First time login
            user.streak = 1;
        }
        
        user.lastLogin = now;
        await user.save();

        const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "24h" });

        res.json({ 
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                streak: user.streak,
                exp: user.exp,
                level: user.level
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Award EXP
router.post("/award-exp", auth, async (req, res) => {
    try {
        const { exp } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.exp += exp;
        
        // Simple Leveling logic (every 100 EXP = 1 level)
        const newLevel = Math.floor(user.exp / 100) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
        }

        await user.save();
        res.json({ message: "EXP awarded", exp: user.exp, level: user.level });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;