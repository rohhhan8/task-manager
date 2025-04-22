// routes/taskRoutes.js
const express = require("express");
const Task = require("../models/TaskModel");
const User = require("../models/UserModel");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// Create Task (Reminder is optional)
router.post("/", async (req, res) => {
  try {
    const { title, description, reminder } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).json({ message: "User not found" });

    const newTask = new Task({
      title,
      description,
      reminder: reminder || null, // Make reminder optional
      user: req.user._id,
      userEmail: user.email,
      notified: false,
    });

    await newTask.save();
    res.json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Error creating task", error });
  }
});

// Get all tasks for the logged-in user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});

// Delete Task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Error deleting task", error });
  }
});

module.exports = router;
