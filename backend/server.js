require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const path = require("path"); // ✅ Required to serve frontend
const Task = require("./models/TaskModel");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Import Routes
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.send("Backend is running...");
});

// Create a transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  }
});

// Send Email Helper
const sendReminderEmail = (task) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: task.userEmail,
    subject: `Task Reminder: ${task.title}`,
    text: `Hi! Just a reminder that your task "${task.title}" is due now. Please take action.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};

// Cron job to check for reminders
cron.schedule("* * * * *", async () => {
  console.log("⏰ Cron job running...");
  const now = new Date();

  try {
    const upcomingTasks = await Task.find({
      reminder: { $lte: now },
      notified: { $ne: true }
    });

    for (const task of upcomingTasks) {
      console.log(`🔔 Reminder: Task "${task.title}" is due now. User ID: ${task.user}`);
      await sendReminderEmail(task);
      task.notified = true;
      await task.save();
    }
  } catch (err) {
    console.error("Error checking reminders:", err);
  }
});

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
  });
}

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));