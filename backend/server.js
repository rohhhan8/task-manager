require("dotenv").config({ path: __dirname + '/.env' });
console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const path = require("path");
const Task = require("./models/TaskModel");
const nodemailer = require("nodemailer");

const app = express();

// CORS configuration
console.log('NODE_ENV:', process.env.NODE_ENV);
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://task-manager-hd1x.onrender.com']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

app.get("/health", (req, res) => {
  res.send("✅ Backend is running...");
});

// Email Transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  }
});

const sendReminderEmail = (task) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: task.userEmail,
    subject: `Task Reminder: ${task.title}`,
    text: `Hi! Just a reminder that your task "${task.title}" is due now. Please take action.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("📧 Email Error:", error);
    } else {
      console.log(`📨 Email sent: ${info.response}`);
    }
  });
};

// Cron: check every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();
  console.log(`⏰ Cron job running at ${now.toISOString()}`);
  try {
    const upcomingTasks = await Task.find({
      reminder: { $lte: now },
      notified: { $ne: true },
    });

    for (const task of upcomingTasks) {
      console.log(`🔔 Sending reminder for task "${task.title}"`);
      await sendReminderEmail(task);
      task.notified = true;
      await task.save();
    }
  } catch (err) {
    console.error("🚨 Cron job error:", err);
  }
});

// Serve frontend
if (process.env.NODE_ENV === "production") {
  // Correct path to frontend build directory
  const frontendBuildPath = path.join(__dirname, "..", "frontend", "build");
  console.log("Frontend build path:", frontendBuildPath);

  app.use(express.static(frontendBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
}

// Graceful Shutdown
process.on("SIGINT", () => {
  console.log("🛑 SIGINT received. Shutting down...");
  mongoose.connection.close(false, () => {
    console.log("📴 MongoDB connection closed.");
    process.exit(0);
  });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
