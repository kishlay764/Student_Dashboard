const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// GET all tasks for the logged in user
router.get("/", auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new task
router.post("/", auth, async (req, res) => {
    try {
        const { text } = req.body;
        const newTask = new Task({
            user: req.user.id,
            text
        });
        const savedTask = await newTask.save();
        res.json(savedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a task (Optional but good for completeness)
router.delete("/:id", auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: "User not authorized" });

        await task.deleteOne();
        res.json({ message: "Task removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
