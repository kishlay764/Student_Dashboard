const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");
const auth = require("../middleware/auth");

// GET all tasks for the logged in user
router.get("/", auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ order: 1, createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new task
router.post("/", auth, async (req, res) => {
    try {
        const { text, priority, deadline } = req.body;
        const newTask = new Task({
            user: req.user.id,
            text,
            priority: priority || "Medium",
            deadline
        });
        const savedTask = await newTask.save();
        res.json(savedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT to update a task (status, priority, etc.)
router.put("/:id", auth, async (req, res) => {
    try {
        const { text, priority, status, deadline } = req.body;
        let task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: "Task not found" });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

        const previousStatus = task.status;
        
        task.text = text || task.text;
        task.priority = priority || task.priority;
        task.status = status || task.status;
        task.deadline = deadline || task.deadline;

        // Gamification: Award EXP if task is completed
        if (status === "Completed" && previousStatus !== "Completed") {
            await User.findByIdAndUpdate(req.user.id, { $inc: { exp: 20 } });
        }

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a task
router.delete("/:id", auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

        await task.deleteOne();
        res.json({ message: "Task removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST reorder tasks
router.post("/reorder", auth, async (req, res) => {
    try {
        const { orderedIds } = req.body;
        // Bulk update order for tasks
        const updates = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id, user: req.user.id },
                update: { order: index }
            }
        }));

        await Task.bulkWrite(updates);
        res.json({ message: "Reordered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
