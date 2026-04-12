const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");
const auth = require("../middleware/auth");

// GET overall productivity stats
router.get("/stats", auth, async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments({ user: req.user.id });
        const completedTasks = await Task.countDocuments({ user: req.user.id, status: "Completed" });
        const pendingTasks = totalTasks - completedTasks;
        
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        const user = await User.findById(req.user.id);

        // --- Calculate 7-day trend ---
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentTasks = await Task.find({
            user: req.user.id,
            status: "Completed",
            createdAt: { $gte: sevenDaysAgo }
        });

        // Group by day of week
        const trend = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun or last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        }

        // This is a simplified grouping for the demo/SaaS feel
        recentTasks.forEach(t => {
            const dayName = new Date(t.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
            const index = days.indexOf(dayName);
            if (index !== -1) trend[index]++;
        });

        res.json({
            totalTasks,
            completedTasks,
            pendingTasks,
            completionRate: Math.round(completionRate),
            streak: user.streak,
            exp: user.exp,
            level: user.level,
            trend: {
                labels: days,
                data: trend
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
