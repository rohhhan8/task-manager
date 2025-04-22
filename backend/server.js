require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
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
app.use("/api/auth", authRoutes);   // /register and /login
app.use("/api/tasks", taskRoutes);  // /api/tasks

// Health Check
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Create a transporter for Gmail (or another service if you prefer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail email address (from .env)
    pass: process.env.GMAIL_PASSWORD, // Your Gmail app password (from .env)
  }
});

// Helper function to send email
const sendReminderEmail = (task) => {
  const mailOptions = {
    from: process.env.GMAIL_USER, // Your email address
    to: task.userEmail, // Task's user's email (must be saved in DB)
    subject: `Task Reminder: ${task.title}`,
    text: `Hi! Just a reminder that your task "${task.title}" is due now. Please take action.`
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};

// Cron job to check for tasks every minute
cron.schedule("* * * * *", async () => {
  console.log("⏰ Cron job running...");

  const now = new Date();

  try {
    // Fetch tasks where reminder time has passed and not notified yet
    const upcomingTasks = await Task.find({
      reminder: { $lte: now },
      notified: { $ne: true }
    });

    for (const task of upcomingTasks) {
      console.log(`🔔 Reminder: Task "${task.title}" is due now. User ID: ${task.user}`);

      // Send email to the user
      await sendReminderEmail(task);  // Send reminder email

      // Mark task as notified
      task.notified = true;
      await task.save();
    }
  } catch (err) {
    console.error("Error checking reminders:", err);
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
